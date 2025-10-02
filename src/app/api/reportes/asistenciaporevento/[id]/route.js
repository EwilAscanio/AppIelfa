import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {

    const { searchParams } = new URL(request.url);
    const codigoEvento = searchParams.get("codigoEvento");

    if (!codigoEvento) {
      return NextResponse.json(
        { message: "El código del evento es requerido para el reporte de asistencia." },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        tbeventos.*, 
        tbasistencia.*, 
        tbmiembros.tipo_mie, 
        tbmiembros.fechanacimiento_mie,
        EXTRACT(YEAR FROM AGE(tbmiembros.fechanacimiento_mie))::INTEGER AS edad_actual
      FROM tbeventos
      JOIN tbasistencia ON tbeventos.codigo_eve = tbasistencia.codigo_eve
      JOIN tbmiembros ON tbasistencia.id_mie = tbmiembros.id_mie
      WHERE tbeventos.codigo_eve = $1 AND tbeventos.status_eve = 'Activo'
      ORDER BY tbmiembros.nombre_mie;
    `;

    const result = await conn.query(query, [codigoEvento]);
    const asistencias = result.rows; // ✅ Acceder a .rows

    const totalAsistentes = asistencias.length;

    // Calcular la cantidad de niños (edad < 10)
    const conteoNinosEnAsistencia = asistencias.filter(a => a.edad_actual < 10).length;


    if (asistencias.length === 0) {
      return NextResponse.json(
        {
          message: "No se encontraron registros de asistencia para el evento en el código proporcionado.",
          asistencias: [],
          totalAsistentes: 0,
          conteoNinosEnAsistencia: 0
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      asistencias,
      totalAsistentes,
      conteoNinosEnAsistencia,
      message: "Reporte de asistencia generado exitosamente."
    });

  } catch (error) {
    console.error("Error en la API de reporte de asistencia:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al generar el reporte: " + error.message },
      { status: 500 }
    );
  }
};