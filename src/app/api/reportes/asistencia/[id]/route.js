import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicial = searchParams.get("fechaInicial");
    const fechaFinal = searchParams.get("fechaFinal");

    console.log("FECHA INICIAL (parámetro de URL):", fechaInicial);
    console.log("FECHA FINAL (parámetro de URL):", fechaFinal);

    // Validar que las fechas estén presentes
    if (!fechaInicial || !fechaFinal) {
      return NextResponse.json(
        {
          message: "Las fechas inicial y final son requeridas para el reporte de asistencia.",
        },
        {
          status: 400, // Bad Request
        }
      );
    }

    // Ajustar las fechas para cubrir el día completo
    // Esto asegura que la consulta incluya registros desde el inicio del día inicial hasta el final del día final.
   // const fechaInicio = `${fechaInicial} 00:00:00`;
   // const fechaFin = `${fechaFinal} 23:59:59`;

    console.log("Rango de consulta SQL (desde):", fechaInicial);
    console.log("Rango de consulta SQL (hasta):", fechaFinal);

    // Consulta SQL para obtener registros de asistencia, uniéndolos con eventos
    // para filtrar por la fecha del evento y obtener el nombre del evento.
    
    /*
    const query = `
      SELECT * FROM tbeventos JOIN tbasistencia ON  tbeventos.codigo_eve = tbasistencia.codigo_eve 
      where tbeventos.fecha_eve >= ?
      and tbeventos.fecha_eve <= ?;
    `;*/

    const query = `
      SELECT tbeventos.*, tbasistencia.*, tbmiembros.tipo_mie FROM tbeventos
      JOIN tbasistencia ON tbeventos.codigo_eve = tbasistencia.codigo_eve
      JOIN tbmiembros ON tbasistencia.id_mie = tbmiembros.id_mie
      WHERE tbeventos.fecha_eve >= ?
      AND tbeventos.fecha_eve <= ?;
      `

    const result = await conn.query(query, [fechaInicial, fechaFinal]);

    console.log("Resultados de la consulta de asistencia:", result);

    // Calcular el total de asistentes (cada registro es una asistencia individual)
    const totalAsistentes = result.length;

    console.log("Total de asistentes:", totalAsistentes);
    // Si no se encontraron registros, devolvemos un array vacío pero con status 200 (OK)
    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "No se encontraron registros de asistencia para los eventos en las fechas proporcionadas.",
          asistencias: [], // Aseguramos que siempre sea un array
          totalAsistentes: 0
        },
        {
          status: 200, // Status 200 OK es apropiado para "no hay datos", no un error.
        }
      );
    }

    // Devolver los datos de asistencia
    return NextResponse.json({
      asistencias: result, // Renombrado a 'asistencias' para que coincida con tu frontend
      totalAsistentes: totalAsistentes,
      message: "Reporte de asistencia generado exitosamente."
    });
  } catch (error) {
    console.error("Error en la API de reporte de asistencia:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor al generar el reporte: " + error.message,
      },
      {
        status: 500, // Internal Server Error
      }
    );
  }
};