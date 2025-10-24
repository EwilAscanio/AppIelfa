import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

/**
 * GET /api/reportes/familias
 * Obtiene la lista completa de familias con información de sus miembros.
 */
export const GET = async (request) => {

  const { searchParams } = new URL(request.url);

  const categoria = searchParams.get('categoria');

  console.log("Categoría recibida en la API:", categoria);

  try {
    // Consulta para obtener todas las familias con información del jefe y miembros
    const result = await conn.query(`
      SELECT
        f.id_fam,
        f.nombre_fam,
        f.cedula_jefe_fam,
        m.nombre_mie AS jefe_nombre,
        m.cedula_mie AS jefe_cedula,
        m.direccion_mie AS jefe_direccion,
        m.telefono_mie AS jefe_telefono,
        JSON_AGG(
          json_build_object(
            'id', mem.id_mie,
            'nombre', mem.nombre_mie,
            'cedula', mem.cedula_mie,
            'parentesco', mem.parentesco,
            'edad', EXTRACT(YEAR FROM AGE(mem.fechanacimiento_mie))::INTEGER
          )
        ) FILTER (WHERE mem.id_mie IS NOT NULL AND mem.cedula_mie != f.cedula_jefe_fam) AS miembros
      FROM
        tbfamilias f
      LEFT JOIN
        tbmiembros m ON f.cedula_jefe_fam = m.cedula_mie
      LEFT JOIN
        tbmiembros mem ON f.id_fam = mem.id_fam
      GROUP BY
        f.id_fam,
        f.nombre_fam,
        f.cedula_jefe_fam,
        m.nombre_mie,
        m.cedula_mie,
        m.direccion_mie,
        m.telefono_mie
      ORDER BY
        f.nombre_fam ASC;
    `);

    const familias = result.rows;

    if (familias.length === 0) {
      return NextResponse.json(
        {
          message: "No se encontraron familias registradas.",
          familias: []
        },
        { status: 200 }
      );
    }

    // Calcular estadísticas
    const familiasConMiembros = familias.map(familia => ({
      ...familia,
      total_miembros: (familia.miembros ? familia.miembros.length : 0) + 1, // +1 para el jefe
      miembros_adultos: familia.miembros ?
        familia.miembros.filter(m => m.edad >= 18).length + 1 : 1, // +1 para el jefe asumiendo adulto
      miembros_ninos: familia.miembros ?
        familia.miembros.filter(m => m.edad < 18).length : 0
    }));

    return NextResponse.json({
      familias: familiasConMiembros,
      totalFamilias: familias.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener la lista de familias:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor al obtener las familias.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
};
