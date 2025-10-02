import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";


export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicial = searchParams.get("fechaInicial");
    const fechaFinal = searchParams.get("fechaFinal");

    if (!fechaInicial || !fechaFinal) {
      return NextResponse.json(
        {
          message:
            "Las fechas inicial y final son requeridas para el reporte de asistencia.",
        },
        { status: 400 }
      );
    }

    // ✅ Consulta adaptada para PostgreSQL
    const query = `
      SELECT
        tbmiembros.id_mie,
        tbmiembros.nombre_mie,
        tbmiembros.cedula_mie,
        tbmiembros.tipo_mie,
        COUNT(tbasistencia.id_asi) AS total_eventos_asistidos,
        STRING_AGG(tbeventos.codigo_eve, ' | ' ORDER BY tbeventos.fecha_eve) AS eventos_asistidos
      FROM
        tbeventos
      JOIN tbasistencia ON tbeventos.codigo_eve = tbasistencia.codigo_eve
      JOIN tbmiembros ON tbasistencia.id_mie = tbmiembros.id_mie
      WHERE
        tbeventos.fecha_eve >= $1
        AND tbeventos.fecha_eve <= $2
      GROUP BY
        tbmiembros.id_mie,
        tbmiembros.nombre_mie,
        tbmiembros.cedula_mie,
        tbmiembros.tipo_mie
      ORDER BY
        total_eventos_asistidos DESC, nombre_mie;
    `;

    const result = await conn.query(query, [fechaInicial, fechaFinal]);

    const asistencias = result.rows; // ✅ Acceder a .rows
    const totalAsistentes = asistencias.length;

    if (asistencias.length === 0) {
      return NextResponse.json(
        {
          message: "No se encontraron registros de asistencia para las fechas proporcionadas.",
          asistencias: [],
          totalAsistentes: 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      asistencias,
      totalAsistentes,
      message: "Reporte de asistencia generado exitosamente.",
    });

  } catch (error) {
    console.error("Error en la API de reporte de asistencia:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor al generar el reporte: " + error.message,
      },
      { status: 500 }
    );
  }
};