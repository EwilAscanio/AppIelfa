import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export const GET = async (req, { params }) => {
  const { id } = params;

  console.log("Obteniendo familia con ID:", id);

  try {
    if (!conn) {
      throw new Error("No se pudo establecer conexión con la base de datos.");
    }

    const familyResult = await conn.query(`
      SELECT
        f.id_fam,
        f.nombre_fam,
        f.cedula_jefe_fam,
        m.nombre_mie AS jefe_nombre,
        m.cedula_mie AS jefe_cedula,
        JSON_AGG(
          json_build_object(
            'id', mem.id_mie,
            'nombre', mem.nombre_mie,
            'cedula', mem.cedula_mie,
            'parentesco', mem.parentesco
          )
        ) FILTER (WHERE mem.id_mie IS NOT NULL AND mem.cedula_mie != f.cedula_jefe_fam) AS miembros
      FROM
        tbfamilias f
      LEFT JOIN
        tbmiembros m ON f.cedula_jefe_fam = m.cedula_mie
      LEFT JOIN
        tbmiembros mem ON f.id_fam = mem.id_fam
      WHERE
        f.id_fam = $1
      GROUP BY
        f.id_fam,
        f.nombre_fam,
        f.cedula_jefe_fam,
        m.nombre_mie,
        m.cedula_mie;
    `, [id]);

    if (familyResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Familia no encontrada" },
        { status: 404 }
      );
    }

    const familia = familyResult.rows[0];

    return NextResponse.json({
      familia: familia,
    });
  } catch (error) {
    console.error("Error al obtener familia:", error);
    return NextResponse.json(
      {
        message: "Error al realizar la consulta a la base de datos.",
        error: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (req, { params }) => {
  const { id } = params;

  try {
    const data = await req.json();

    console.log("Datos para actualizar familia:", data);

    // Validación básica
    if (!data.nombre_fam || !data.cedula_jefe_fam) {
      return NextResponse.json(
        { message: "Nombre de familia y cédula del jefe son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que la familia existe
    const familyCheck = await conn.query(
      "SELECT id_fam, cedula_jefe_fam FROM tbfamilias WHERE id_fam = $1",
      [id]
    );

    if (familyCheck.rows.length === 0) {
      return NextResponse.json(
        { message: "Familia no encontrada" },
        { status: 404 }
      );
    }

    const currentFamily = familyCheck.rows[0];

    // Verificar que el nuevo jefe existe y no pertenece a otra familia
    if (data.cedula_jefe_fam !== currentFamily.cedula_jefe_fam) {
      const jefeCheck = await conn.query(
        "SELECT id_mie, cedula_mie, nombre_mie, id_fam FROM tbmiembros WHERE cedula_mie = $1",
        [data.cedula_jefe_fam]
      );

      if (jefeCheck.rows.length === 0) {
        return NextResponse.json(
          { message: "Nuevo jefe de familia no encontrado" },
          { status: 404 }
        );
      }

      const newJefe = jefeCheck.rows[0];

      if (newJefe.id_fam !== null && newJefe.id_fam !== parseInt(id)) {
        return NextResponse.json(
          { message: `El nuevo jefe ya pertenece a otra familia` },
          { status: 400 }
        );
      }
    }

    // Verificar que no existe otra familia con el mismo nombre
    const nameCheck = await conn.query(
      "SELECT id_fam FROM tbfamilias WHERE LOWER(TRIM(nombre_fam)) = LOWER(TRIM($1)) AND id_fam != $2",
      [data.nombre_fam.trim(), id]
    );

    if (nameCheck.rows.length > 0) {
      return NextResponse.json(
        { message: "Ya existe otra familia con ese nombre" },
        { status: 400 }
      );
    }

    // Iniciar transacción
    await conn.query("BEGIN");

    // Actualizar la familia
    await conn.query(
      "UPDATE tbfamilias SET nombre_fam = $1, cedula_jefe_fam = $2 WHERE id_fam = $3",
      [data.nombre_fam.trim(), data.cedula_jefe_fam, id]
    );

    // Si cambió el jefe, actualizar las referencias
    if (data.cedula_jefe_fam !== currentFamily.cedula_jefe_fam) {
      // Remover el id_fam del jefe anterior
      await conn.query(
        "UPDATE tbmiembros SET id_fam = NULL WHERE cedula_mie = $1",
        [currentFamily.cedula_jefe_fam]
      );

      // Asignar el id_fam al nuevo jefe
      await conn.query(
        "UPDATE tbmiembros SET id_fam = $1 WHERE cedula_mie = $2",
        [id, data.cedula_jefe_fam]
      );
    }

    // Gestionar miembros
    if (data.miembros !== undefined) {
      // Obtener miembros actuales de la familia
      const currentMembersResult = await conn.query(
        "SELECT cedula_mie, parentesco FROM tbmiembros WHERE id_fam = $1",
        [id]
      );
      const currentMembers = currentMembersResult.rows;

      // Miembros que deben estar en la familia según los datos enviados
      const targetMembers = data.miembros.map(m => ({
        cedula: m.cedula,
        parentesco: m.parentesco
      }));

      // Miembros a remover (están en BD pero no en target)
      const membersToRemove = currentMembers.filter(cm =>
        !targetMembers.some(tm => tm.cedula === cm.cedula_mie)
      );

      // Miembros a agregar (están en target pero no en BD)
      const membersToAdd = targetMembers.filter(tm =>
        !currentMembers.some(cm => cm.cedula_mie === tm.cedula)
      );

      // Miembros a actualizar parentesco
      const membersToUpdate = targetMembers.filter(tm =>
        currentMembers.some(cm => cm.cedula_mie === tm.cedula && cm.parentesco !== tm.parentesco)
      );

      // Remover miembros
      for (const member of membersToRemove) {
        await conn.query(
          "UPDATE tbmiembros SET id_fam = NULL WHERE cedula_mie = $1",
          [member.cedula_mie]
        );
      }

      // Agregar miembros
      for (const member of membersToAdd) {
        // Verificar que el miembro existe y no pertenece a otra familia
        const memberCheck = await conn.query(
          "SELECT id_mie, id_fam FROM tbmiembros WHERE cedula_mie = $1",
          [member.cedula]
        );

        if (memberCheck.rows.length === 0) {
          throw new Error(`Miembro con cédula ${member.cedula} no encontrado`);
        }

        const existingMember = memberCheck.rows[0];

        if (existingMember.id_fam !== null && existingMember.id_fam !== parseInt(id)) {
          throw new Error(`Miembro ${member.cedula} ya pertenece a otra familia`);
        }

        // Actualizar el miembro
        await conn.query(
          "UPDATE tbmiembros SET id_fam = $1, parentesco = $2 WHERE cedula_mie = $3",
          [id, member.parentesco, member.cedula]
        );
      }

      // Actualizar parentescos
      for (const member of membersToUpdate) {
        await conn.query(
          "UPDATE tbmiembros SET parentesco = $1 WHERE cedula_mie = $2 AND id_fam = $3",
          [member.parentesco, member.cedula, id]
        );
      }
    }

    await conn.query("COMMIT");

    return NextResponse.json({
      message: "Familia actualizada exitosamente",
      familia: {
        id_fam: id,
        nombre_fam: data.nombre_fam.trim(),
        cedula_jefe_fam: data.cedula_jefe_fam
      }
    });

  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Error al actualizar familia:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};
