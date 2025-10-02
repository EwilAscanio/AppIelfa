import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const result = await conn.query("SELECT * FROM configuracion WHERE id=$1", [1]);

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error al obtener la configuración:", error.message);
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


export const PUT = async (req) => {
  try {
    const data = await req.json();
    const { totalMiembros, totalEventos } = data;

    // Actualizamos ambos campos en una sola consulta (mejor práctica)
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (totalMiembros !== undefined) {
      fields.push(`totalMiembros = $${paramIndex++}`);
      values.push(totalMiembros);
    }

    if (totalEventos !== undefined) {
      fields.push(`totalEventos = $${paramIndex++}`);
      values.push(totalEventos);
    }

    // Si no hay campos para actualizar
    if (fields.length === 0) {
      return NextResponse.json(
        { message: "No se proporcionaron datos para actualizar." },
        { status: 400 }
      );
    }

    // Agregar el id al final de los valores
    values.push(1); // WHERE id = 1

    const query = `
      UPDATE configuracion
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
    `;

    const result = await conn.query(query, values);

    // En PostgreSQL, usamos rowCount (no affectedRows)
    if (result.rowCount > 0) {
      return NextResponse.json(
        { message: "Los datos se actualizaron correctamente" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No se encontró el registro para actualizar." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json(
      { message: "Ocurrió un error al actualizar la configuración." },
      { status: 500 }
    );
  }
};