import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const POST = async (request, { params }) => {
  try {
    const { id: familyId } = params;

    if (!familyId) {
      return NextResponse.json(
        { message: "ID de familia es requerido" },
        { status: 400 }
      );
    }

    const { members } = await request.json();

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { message: "Lista de miembros es requerida" },
        { status: 400 }
      );
    }

    // Verificar que la familia existe
    const familyCheck = await conn.query(
      "SELECT id_fam FROM tbfamilias WHERE id_fam = $1",
      [familyId]
    );

    if (familyCheck.rows.length === 0) {
      return NextResponse.json(
        { message: "Familia no encontrada" },
        { status: 404 }
      );
    }

    const results = [];

    // Procesar cada miembro
    for (const member of members) {
      const { nombre_mie, cedula_mie, parentesco } = member;

      if (!nombre_mie || !cedula_mie || !parentesco) {
        results.push({
          nombre_mie,
          cedula_mie,
          success: false,
          message: "Datos incompletos"
        });
        continue;
      }

      try {
        // Buscar miembro por nombre y cédula
        const memberSearch = await conn.query(
          `SELECT id_mie, nombre_mie, cedula_mie, id_familia
           FROM tbmiembros
           WHERE LOWER(TRIM(nombre_mie)) = LOWER(TRIM($1))
           AND cedula_mie = $2`,
          [nombre_mie.trim(), cedula_mie.trim()]
        );

        if (memberSearch.rows.length === 0) {
          results.push({
            nombre_mie,
            cedula_mie,
            success: false,
            message: "Miembro no encontrado"
          });
          continue;
        }

        const foundMember = memberSearch.rows[0];

        // Verificar si ya pertenece a una familia
        if (foundMember.id_familia) {
          results.push({
            nombre_mie,
            cedula_mie,
            success: false,
            message: "Miembro ya pertenece a otra familia"
          });
          continue;
        }

        // Actualizar el miembro con el ID de familia y parentesco
        await conn.query(
          `UPDATE tbmiembros
           SET id_familia = $1, parentesco = $2
           WHERE id_mie = $3`,
          [familyId, parentesco, foundMember.id_mie]
        );

        results.push({
          nombre_mie,
          cedula_mie,
          success: true,
          message: "Miembro asignado exitosamente"
        });

      } catch (error) {
        console.error("Error procesando miembro:", error);
        results.push({
          nombre_mie,
          cedula_mie,
          success: false,
          message: "Error interno al procesar"
        });
      }
    }

    return NextResponse.json({
      message: "Proceso de asignación completado",
      results,
      summary: {
        total: members.length,
        assigned: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error("Error al asignar miembros a familia:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};
