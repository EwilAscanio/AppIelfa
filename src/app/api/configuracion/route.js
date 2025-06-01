import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const result = await conn.query("SELECT * FROM configuracion WHERE id=1");
    return NextResponse.json(result);
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

    let result;

    // Solo actualizar si se proporciona el número de factura
    if (totalMiembros) {
      result = await conn.query(
        `UPDATE configuracion
         SET totalMiembros = ?
         WHERE id = 1`,
        [totalMiembros]
      );
    }

    // Solo actualizar si se proporciona la última vacunación
    if (totalEventos) {
      result = await conn.query(
        `UPDATE configuracion
         SET totalEventos = ?
         WHERE id = 1`,
        [totalEventos]
      );
    }

    // Comprobar si se actualizó algo
    if (result && result.affectedRows > 0) {
      // Verifica que haya filas afectadas
      return NextResponse.json(
        { message: "Los datos se actualizaron correctamente" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No se realizaron actualizaciones." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error al actualizar:", error.message);
    return NextResponse.json(
      { message: "Ocurrió un error al actualizar la configuración." },
      { status: 500 }
    );
  }
};
