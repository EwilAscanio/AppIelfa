import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  console.log("PARAMS",params);
  console.log("ID", params.id);
  try {
    const result = await conn.query(`
          SELECT * FROM tbeventos WHERE codigo_eve = "${params.id}"`);

    if (result.lenght === 0 || result == []) {
      return NextResponse(
        {
          message: "Miembro no encontrado",
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
};

export const PUT = async (req, { params }) => {
  try {
    const {
      codigo_eve,
      nombre_eve,
      fecha_eve,
      descripcion_eve,
      status_eve,
    } = await req.json();

    const result = await conn.query(
      `
          UPDATE tbeventos SET
          codigo_eve = "${codigo_eve}",
          nombre_eve = "${nombre_eve}",
          fecha_eve = "${fecha_eve}",
          descripcion_eve = "${descripcion_eve}",
          status_eve = "${status_eve}"
          WHERE codigo_eve = "${params.id}"
      `
    );

    if (result.affectedRows === 0) {
      return NextResponse(
        {
          message: "Evento no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
};

export const DELETE = async (req, { params }) => {

  try {
    // 1. Verificar si el evento existe antes de eliminar
    const eventRows = await conn.query(
      "SELECT codigo_eve FROM tbeventos WHERE codigo_eve = ?",
      [params.id]
    );


    if (eventRows.length === 0) {
      console.log("Evento NO ENCONTRADO (en la DB)");
      return NextResponse.json(
        { message: "Evento no encontrado." },
        { status: 404 }
      );
    }

    // 2. Ejecutar la operación DELETE
    const deleteResult = await conn.query(
      "DELETE FROM tbeventos WHERE codigo_eve = ?",
      [params.id]
    );

    if (deleteResult.affectedRows === 0) {
      throw new Error("No se pudo eliminar el evento (affectedRows fue 0).");
    }

    // 3. Actualizar contador (versión segura con cláusula WHERE)
    await conn.query(`
      UPDATE configuracion
      SET totalEventos = GREATEST(0, totalEventos - 1)
      WHERE id = 1
    `);

    return NextResponse.json({
      message: "Evento eliminado y contador actualizado.",
      deletedId: params.id
    });

  } catch (error) {
    console.error("Error detallado al eliminar evento:", error); // Esto sigue siendo muy útil para depuración

    // --- ¡AQUÍ ES DONDE MANEJAMOS EL ERROR ESPECÍFICO DE CLAVE FORÁNEA! ---
    // MySQL/MariaDB error code for foreign key constraint violation
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return NextResponse.json(
        {
          message: "No se puede eliminar este evento porque tiene asistencia de miembros registrada. Elimine primero los registros de asistencia asociados a este evento.",
          // Puedes añadir un código de error específico para el frontend si lo necesitas
          errorCode: "FOREIGN_KEY_CONSTRAINT_VIOLATION"
        },
        { status: 409 } // 409 Conflict es un buen código HTTP para este tipo de errores
      );
    }

    // Manejo genérico de otros errores
    return NextResponse.json(
      {
        message: `Error interno del servidor al eliminar el evento: ${error.message}`,
        suggestion: "Verifique que el ID sea correcto y que exista el registro en configuración (id=1).",
        // Puedes añadir más detalles de error para depuración en desarrollo
        // rawError: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
};