import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicial = searchParams.get("fechaInicial");
    const fechaFinal = searchParams.get("fechaFinal");

    if (!fechaInicial || !fechaFinal) {
      return NextResponse.json(
        { message: "Las fechas inicial y final son requeridas." },
        { status: 400 }
      );
    }

    // ✅ En PostgreSQL, puedes comparar fechas directamente si el campo es DATE
    // Si `fecha_eve` es TIMESTAMP, puedes usar rangos con $1 y $2 como fechas ISO
    // Ej: '2024-01-01' y '2024-01-31' → PostgreSQL las convierte automáticamente

    const result = await conn.query(
      `SELECT * FROM tbeventos 
       WHERE fecha_eve >= $1 AND fecha_eve <= $2`,
      [fechaInicial, fechaFinal] // ✅ Usa las fechas en formato YYYY-MM-DD
    );

    const eventos = result.rows; // ✅ Accede a .rows

    if (eventos.length === 0) {
      return NextResponse.json(
        { message: "No se encontraron eventos para las fechas proporcionadas." },
        { status: 200 } // 👈 200 es mejor que 404 si la consulta es válida pero sin resultados
      );
    }

    return NextResponse.json({ eventos });

  } catch (error) {
    console.error("Error en la API de eventos:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};