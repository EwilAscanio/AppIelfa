import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async () => {
 
  try {
    const result = await conn.query("SELECT * FROM tbeventos");

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: result.error,
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

    // Validar que se proporcionen todos los datos requeridos
    if (
      !data.codigo_eve ||
      !data.nombre_eve ||
      !data.fecha_eve ||
      !data.descripcion_eve ||
      !data.status_eve
    ) {
      return NextResponse.json(
        {
          message: "Faltan datos",
        },
        {
          status: 400,
        }
      );
    }

    const { codigo_eve, nombre_eve, fecha_eve, descripcion_eve, status_eve } =
      data;

    // Verificar si el evento ya está registrado (puedes ajustar esta lógica según tus necesidades)
    const existingEvent = await conn.query(
      "SELECT * FROM Tbeventos WHERE codigo_eve = ? ",
      [codigo_eve]
    );

    if (existingEvent.length > 0) {
      return NextResponse.json(
        {
          message: "El evento ya está registrado.",
        },
        {
          status: 400,
        }
      );
    }

    // Insertar el nuevo evento en la base de datos
    const result = await conn.query("INSERT INTO Tbeventos SET ?", {
      codigo_eve,
      nombre_eve,
      fecha_eve,
      descripcion_eve,
      status_eve,
    });

    await conn.query(
      "UPDATE configuracion SET totalEventos = totalEventos + 1 WHERE id = 1"
    );

    return NextResponse.json({
      message: "Evento registrado exitosamente.",
      result,
    });
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
