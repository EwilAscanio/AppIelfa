import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const result = await conn.query(`
      SELECT
        A.codigo_eve,
        E.nombre_eve,
        CAST(A.fecha_asi AS DATE) AS fecha_asistencia,
        COUNT(A.id_asi) AS total_asistentes
      FROM
        tbasistencia AS A
      LEFT JOIN
        tbeventos AS E ON A.codigo_eve = E.codigo_eve
      GROUP BY
        A.codigo_eve,
        E.nombre_eve,
        CAST(A.fecha_asi AS DATE)
      ORDER BY
        fecha_asistencia DESC,
        A.codigo_eve ASC;
    `);

    // ✅ Devuelve solo las filas (result.rows)
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("Error al obtener resumen de asistencia:", error);
    
    // ❌ NO uses 'result.error' aquí (result no existe en catch)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: error.message, // ✅ Usa el error capturado
      },
      {
        status: 500,
      }
    );
  }
};