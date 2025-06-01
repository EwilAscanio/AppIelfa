import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    // Consulta SQL para obtener el conteo de asistencias por mes
    // Extraemos el mes de la columna fecha_asi y contamos las ocurrencias.
    // ORDER BY MONTH(fecha_asi) asegura que los meses estén en orden.
    // Considera también filtrar por año si solo quieres el año actual o un año específico.
    // Para el año actual, podrías añadir: WHERE YEAR(fecha_asi) = YEAR(CURDATE())
    const result = await conn.query(`
      SELECT
        MONTH(fecha_asi) AS mes,
        COUNT(*) AS total_asistencias
      FROM
        tbasistencia
      GROUP BY
        MONTH(fecha_asi)
      ORDER BY
        mes ASC;
    `);

    console.log("Asistencias mensuales:", result); // Para depuración

    // El resultado será algo como: [{ mes: 1, total_asistencias: 150 }, { mes: 2, total_asistencias: 200 }, ...]
    // Esto es perfecto para el frontend.

    return NextResponse.json(result);
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