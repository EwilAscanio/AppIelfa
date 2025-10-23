//falta server db
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const { codigo_evento } = req.query; // Obtener el código del evento desde la consulta

    if (!codigo_evento) {
      return NextResponse.json(
        {
          message: "Falta el código del evento",
        },
        {
          status: 400,
        }
      );
    }

    // Consultar la asistencia para el evento específico
    const asistencia = await conn.query(
      "SELECT * FROM tbasistencia WHERE codigo_eve = ?",
      [codigo_evento]
    );

    if (asistencia.length === 0) {
      return NextResponse.json(
        {
          message: "No hay asistencia registrada para este evento",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({ message: "Resumen de asistencia", asistencia });
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

export const PUT = async (req, { params }) => {
  try {
    const {
      nombre_mie,
      cedula_mie,
      direccion_mie,
      telefono_mie,
      edad_mie,
      sexo_mie,
      email_mie,
    } = await req.json();

    const result = await conn.query(
      `
        UPDATE tbmiembros
        SET nombre_mie = "${nombre_mie}", cedula_mie = "${cedula_mie}", direccion_mie = "${direccion_mie}", telefono_mie = "${telefono_mie}", edad_mie = "${edad_mie}", sexo_mie = "${sexo_mie}", email_mie = "${email_mie}"
        WHERE id_mie = "${params.id}"
      `
    );

    if (result.affectedRows === 0) {
      return NextResponse(
        {
          message: "Usuario no encontrado",
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
  const result = await conn.query(`
          DELETE FROM tbmiembros WHERE id_mie = "${params.id}"`);
  try {
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Miembro no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      message: "Miembro eliminado exitosamente",
    });
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
