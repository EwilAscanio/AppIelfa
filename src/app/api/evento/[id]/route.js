import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";


export const GET = async (req, { params }) => {
  try {
    const { id: codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        { message: "Código de evento es requerido" },
        { status: 400 }
      );
    }

    // ✅ Usa placeholder de PostgreSQL ($1)
    const result = await conn.query(
      "SELECT * FROM tbeventos WHERE codigo_eve = $1",
      [codigo]
    );
    
    // ✅ Accede a .rows, no al resultado directo
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // ✅ Devuelve la primera fila
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error al buscar evento:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};

export const PUT = async (request, { params }) => {
  try {
    const { id: codigo_evento } = params;

    if (!codigo_evento) {
      return NextResponse.json(
        { message: "Código de evento es requerido" },
        { status: 400 }
      );
    }

    const {
      codigo_eve,
      nombre_eve,
      fecha_eve,
      descripcion_eve,
      status_eve
    } = await request.json();

    // Validar campos requeridos
    if (!codigo_eve || !nombre_eve || !fecha_eve || !descripcion_eve || status_eve === undefined) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // ✅ Consulta segura con placeholders de PostgreSQL ($1, $2, ...)
    const result = await conn.query(
      `UPDATE tbeventos
       SET 
         codigo_eve = $1,
         nombre_eve = $2,
         fecha_eve = $3,
         descripcion_eve = $4,
         status_eve = $5
       WHERE codigo_eve = $6`,
      [codigo_eve, nombre_eve, fecha_eve, descripcion_eve, status_eve, codigo_evento]
    );

    // ✅ En PostgreSQL, usa .rowCount
    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Evento actualizado exitosamente"
    });

  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (request, { params }) => {
  const { id: codigo_eve } = params;

  if (!codigo_eve) {
    return NextResponse.json(
      { message: "Código de evento es requerido" },
      { status: 400 }
    );
  }

  try {
    // 1. Verificar si el evento existe
    const eventCheck = await conn.query(
      "SELECT 1 FROM tbeventos WHERE codigo_eve = $1",
      [codigo_eve]
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json(
        { message: "Evento no encontrado." },
        { status: 404 }
      );
    }

    // 2. Intentar eliminar el evento
    const deleteResult = await conn.query(
      "DELETE FROM tbeventos WHERE codigo_eve = $1",
      [codigo_eve]
    );

    // En PostgreSQL, rowCount = número de filas eliminadas
    if (deleteResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Evento no encontrado para eliminar." },
        { status: 404 }
      );
    }

    // 3. Actualizar contador de forma segura
    await conn.query(`
      UPDATE configuracion
      SET totalEventos = GREATEST(0, totalEventos - 1)
      WHERE id = 1
    `);

    return NextResponse.json({
      message: "Evento eliminado y contador actualizado.",
      deletedId: codigo_eve
    });

  } catch (error) {
    console.error("Error al eliminar evento:", error);

    // ✅ Código de error de clave foránea en PostgreSQL
    if (error.code === '23503') { // foreign_key_violation
      return NextResponse.json(
        {
          message: "No se puede eliminar este evento porque tiene asistencia de miembros registrada. Elimine primero los registros de asistencia asociados.",
          errorCode: "FOREIGN_KEY_CONSTRAINT_VIOLATION"
        },
        { status: 409 } // Conflict
      );
    }

    // Otros errores
    return NextResponse.json(
      {
        message: "Error interno del servidor al eliminar el evento.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
};