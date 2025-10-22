import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export const GET = async () => {

  console.log("Obteniendo todos los miembros y conteos asociados");
  
  try {
    if (!conn) {
      throw new Error("No se pudo establecer conexión con la base de datos.");
    }

    // ✅ Edad en PostgreSQL: usa AGE() y EXTRACT()
    const allMembersResult = await conn.query(`
      SELECT
        *,
        EXTRACT(YEAR FROM AGE(fechanacimiento_mie))::INTEGER AS edad_actual
      FROM
        tbmiembros
      ORDER BY
        nombre_mie ASC
    `);

    const members = allMembersResult.rows; // 👈 .rows contiene los datos

    if (!members || members.length === 0) {
      throw new Error("No se encontraron miembros en la base de datos.");
    }

    // ✅ Conteo por género
    const genderCountResult = await conn.query(`
      SELECT 
        sexo_mie, 
        COUNT(*)::INTEGER AS count 
      FROM tbmiembros
      WHERE EXTRACT(YEAR FROM AGE(fechanacimiento_mie)) >= 10
      GROUP BY sexo_mie
    `);

    // ✅ Conteo por tipo de miembro
    const memberTypeCountResult = await conn.query(
      "SELECT tipo_mie, COUNT(*)::INTEGER AS count FROM tbmiembros GROUP BY tipo_mie"
    );

    // ✅ Conteo de niños (edad < 10)
    const childrenCountResult = await conn.query(`
      SELECT COUNT(*)::INTEGER AS count
      FROM tbmiembros
      WHERE EXTRACT(YEAR FROM AGE(fechanacimiento_mie)) < 10
    `);

    // Formatear resultados
    const genderCounts = genderCountResult.rows.reduce((acc, current) => {
      acc[current.sexo_mie] = current.count;
      return acc;
    }, {});

    const memberTypeCounts = memberTypeCountResult.rows.reduce((acc, current) => {
      acc[current.tipo_mie] = current.count;
      return acc;
    }, {});

    const childrenCount = childrenCountResult.rows[0]?.count || 0;

    return NextResponse.json({
      miembros: members,
      conteoPorGenero: genderCounts,
      conteoPorTipoMiembro: memberTypeCounts,
      conteoDeNinos: childrenCount,
      totalMiembros: members.length,
    });
  } catch (error) {
    console.error("Error al obtener miembros y conteos:", error);
    return NextResponse.json(
      {
        message: "Error al realizar la consulta a la base de datos.",
        error: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
};


export const POST = async (req) => {
  try {
    const data = await req.json();

    // Establecer valores por defecto
    const telefono_mie = data.telefono_mie || "0"; // En PostgreSQL, teléfonos suelen ser texto
    const email_mie = data.email_mie || "sincorreo@email.com";

    // Validación de datos requeridos
    if (
      !data.nombre_mie ||
      !data.cedula_mie ||
      !data.direccion_mie ||
      !data.fechanacimiento_mie ||
      !data.sexo_mie ||
      !data.tipo_mie
    ) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar si el miembro ya existe
    const existingMember = await conn.query(
      "SELECT 1 FROM tbmiembros WHERE cedula_mie = $1",
      [data.cedula_mie]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json(
        { message: "El miembro ya está registrado." },
        { status: 400 }
      );
    }

    // Insertar nuevo miembro (sintaxis PostgreSQL)
    const insertResult = await conn.query(
      `INSERT INTO tbmiembros 
       (nombre_mie, cedula_mie, direccion_mie, telefono_mie, fechanacimiento_mie, sexo_mie, email_mie, tipo_mie)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id_mie`,
      [
        data.nombre_mie,
        data.cedula_mie,
        data.direccion_mie,
        telefono_mie,
        data.fechanacimiento_mie,
        data.sexo_mie,
        email_mie,
        data.tipo_mie,
      ]
    );

    // Actualizar contador de miembros
    await conn.query(
      "UPDATE configuracion SET totalMiembros = totalMiembros + 1 WHERE id = $1",
      [1]
    );

    return NextResponse.json({
      message: "Miembro registrado y contador actualizado exitosamente.",
      id: insertResult.rows[0]?.id_mie,
    });

  } catch (error) {
    console.error("Error al registrar miembro:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};