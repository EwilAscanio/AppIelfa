import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const result = await conn.query("SELECT * FROM tbeventos");
    
    // ✅ Devuelve solo las filas (formato limpio para el frontend)
    return NextResponse.json(result.rows);
    
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    
    return NextResponse.json(
      {
        message: "Error al obtener los eventos",
        error: error.message, // ✅ Usa el error capturado
      },
      {
        status: 500,
      }
    );
  }
};

export const POST = async (req) => {
  try {
    const data = await req.json();

    const { codigo_eve, nombre_eve, fecha_eve, descripcion_eve, status_eve } = data;

    // Validación de campos requeridos
    if (!codigo_eve || !nombre_eve || !fecha_eve || !descripcion_eve ) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el evento ya existe
    const existingEvent = await conn.query(
      "SELECT 1 FROM tbeventos WHERE codigo_eve = $1",
      [codigo_eve]
    );

    console.log(existingEvent);

    if (existingEvent.rows.length > 0) {
      return NextResponse.json(
        { message: "El evento ya está registrado." },
        { status: 400 }
      );
    }

    // Insertar nuevo evento (sintaxis PostgreSQL)
    const result = await conn.query(
      `INSERT INTO tbeventos 
       (codigo_eve, nombre_eve, fecha_eve, descripcion_eve, status_eve)
       VALUES ($1, $2, $3, $4, $5)
       `,
      [codigo_eve, nombre_eve, fecha_eve, descripcion_eve, status_eve]
    );

    // Actualizar contador de eventos
    await conn.query(
      "UPDATE configuracion SET totalEventos = totalEventos + 1 WHERE id = $1",
      [1]
    );

    return NextResponse.json({
      message: "Evento registrado exitosamente.",
      id: result.rows[0]?.id_eve,
    });

  } catch (error) {
    console.error("Error al registrar evento:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};
