import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

// POST: Agregar un miembro al borrador
export const POST = async (request) => {
  
  try {
    const { codigo_eve, id_mie } = await request.json();

    if (!codigo_eve || !id_mie) {
      return NextResponse.json(
        { message: "El código de evento y el ID de miembro son requeridos" },
        { status: 400 }
      );
    }

    // ✅ PostgreSQL: usa ON CONFLICT DO NOTHING
    // Asegúrate de tener una restricción UNIQUE en (codigo_eve, id_mie)
    const result = await conn.query(
      `INSERT INTO tbasistencia_borrador (codigo_eve, id_mie) 
       VALUES ($1, $2) 
       ON CONFLICT (codigo_eve, id_mie) DO NOTHING`,
      [codigo_eve, id_mie]
    );

    // ✅ En PostgreSQL, usa .rowCount (no .affectedRows)
    if (result.rowCount > 0) {
      return NextResponse.json({ message: "Miembro agregado al borrador" });
    } else {
      return NextResponse.json({ message: "El miembro ya estaba en el borrador" });
    }

  } catch (error) {
    console.error("Error al agregar miembro al borrador:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }

}

// DELETE: Eliminar un miembro del borrador
export const DELETE = async (request) => {
  try {
    const { codigo_eve, id_mie } = await request.json();

    if (!codigo_eve || !id_mie) {
      return NextResponse.json(
        { message: "El código de evento y el ID de miembro son requeridos" },
        { status: 400 }
      );
    }

    // ✅ Usa $1, $2 (PostgreSQL), no ?
    const result = await conn.query(
      "DELETE FROM tbasistencia_borrador WHERE codigo_eve = $1 AND id_mie = $2",
      [codigo_eve, id_mie]
    );

    // ✅ En PostgreSQL, usa .rowCount (no .affectedRows)
    if (result.rowCount > 0) {
      return NextResponse.json({ message: "Miembro eliminado del borrador" });
    } else {
      return NextResponse.json(
        { message: "Miembro no encontrado en el borrador" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("Error al eliminar miembro del borrador:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }

}

// GET: Obtener todos los miembros del borrador para un evento
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo_eve = searchParams.get('codigo_eve');

    if (!codigo_eve) {
      return NextResponse.json(
        { message: "El código de evento es requerido" },
        { status: 400 }
      );
    }

    const result = await conn.query(
      `SELECT b.id_mie, m.nombre_mie, m.cedula_mie
       FROM tbasistencia_borrador b
       JOIN tbmiembros m ON b.id_mie = m.id_mie
       WHERE b.codigo_eve = ?`,
      [codigo_eve]
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}