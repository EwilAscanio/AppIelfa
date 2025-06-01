import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    console.log("Iniciando la API de reporte de asistencia por evento...");


    const { searchParams } = new URL(request.url);
    console.log("Parámetros de búsqueda:", searchParams.toString());
    
    const codigoEvento = searchParams.get("codigoEvento");
    

   console.log("Código de evento recibido:", codigoEvento);
   

    // Validar que las fechas estén presentes
    if (!codigoEvento) {
      return NextResponse.json(
        {
          message: "El codigo del Evento es requerido para el reporte de asistencia.",
        },
        {
          status: 400, // Bad Request
        }
      );
    }

    // Consulta SQL para obtener registros de asistencia, uniéndolos con eventos
    // para filtrar por la fecha del evento y obtener el nombre del evento.
    
    /*
    const query = `
      SELECT * FROM tbeventos JOIN tbasistencia ON  tbeventos.codigo_eve = tbasistencia.codigo_eve 
      where tbeventos.codigo_eve = ?
      and status_eve = 'Activo' order by nombre_mie;
    `;
*/
    const query = `
      
      SELECT tbeventos.*, tbasistencia.*, tbmiembros.tipo_mie FROM tbeventos
      JOIN tbasistencia ON tbeventos.codigo_eve = tbasistencia.codigo_eve
      JOIN tbmiembros ON tbasistencia.id_mie = tbmiembros.id_mie
      WHERE tbeventos.codigo_eve = ?
      AND status_eve = 'Activo' order by nombre_mie;
      `


    const result = await conn.query(query, [codigoEvento]);

    console.log("Resultados de la consulta de asistencia:", result);

    // Calcular el total de asistentes (cada registro es una asistencia individual)
    const totalAsistentes = result.length;

    console.log("Total de asistentes:", totalAsistentes);
    // Si no se encontraron registros, devolvemos un array vacío pero con status 200 (OK)
    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "No se encontraron registros de asistencia para el evento en el codigo proporcionado.",
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