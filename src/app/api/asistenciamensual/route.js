import { conn } from "@/libs/postgress"; 
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    // Consulta para obtener el conteo de asistencias por mes (solo del año actual)
    const result = await conn.query(`
      SELECT
        EXTRACT(MONTH FROM fecha_asi)::INTEGER AS mes,
        COUNT(*)::INTEGER AS total_asistencias
      FROM
        tbasistencia
      WHERE
        EXTRACT(YEAR FROM fecha_asi) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY
        EXTRACT(MONTH FROM fecha_asi)
      ORDER BY
        mes ASC;
    `);

    // Devuelve solo las filas (formato limpio para el frontend)
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error al obtener asistencia mensual:", error);
    return NextResponse.json(
      {
        message: "Error al obtener los datos de asistencia mensual.",
        error: error.message || "Error desconocido",
      },
      {
        status: 500,
      }
    );
  }
};