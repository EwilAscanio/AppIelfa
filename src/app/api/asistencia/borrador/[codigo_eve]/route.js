import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
  
  try {
    const { codigo_eve } = params;

    if (!codigo_eve) {
      return NextResponse.json(
        { message: "El código de evento es requerido" },
        { status: 400 }
      );
    }

    /*
    const result = await conn.query(
      `SELECT 
         b.id_mie, 
         m.nombre_mie AS nombre, 
         m.cedula_mie AS cedula
       FROM tbasistencia_borrador b
       JOIN tbmiembros m ON b.id_mie = m.id_mie
       WHERE b.codigo_eve = $1`,
      [codigo_eve]
    );
    */

    const result = await conn.query(
      `SELECT
    b.id_mie,
    b.codigo_eve,
    m.cedula_mie AS cedula_mie,
    m.nombre_mie AS nombre_mie,
    m.fechanacimiento_mie AS fechanacimiento_mie
FROM
    tbasistencia_borrador b
INNER JOIN
    tbmiembros m ON b.id_mie = m.id_mie
WHERE
    b.codigo_eve = $1`,
      [codigo_eve]
    );

    console.log("Resultado del borrador:", result);


    // ✅ Devuelve solo las filas (result.rows), no el objeto completo
    return NextResponse.json(result.rows);

  

  } catch (error) {
    console.error("Error en GET de borrador:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }



}

// DELETE: Eliminar todo el borrador de un evento
// export async function DELETE(request, { params }) {
//   try {
//     const { codigo_eve } = params;

//     if (!codigo_eve) {
//       return NextResponse.json(
//         { message: "El código de evento es requerido" },
//         { status: 400 }
//       );
//     }

//     const result = await conn.query(
//       "DELETE FROM tbasistencia_borrador WHERE codigo_eve = ?",
//       [codigo_eve]
//     );

//     if (result.affectedRows > 0) {
//       return NextResponse.json({ message: "Borrador del evento eliminado" });
//     } else {
//       return NextResponse.json({ message: "No se encontró un borrador para este evento" }, { status: 404 });
//     }
//   } catch (error) {
//     console.error("Error en DELETE de borrador:", error);
//     return NextResponse.json(
//       { message: "Error interno del servidor" },
//       { status: 500 }
//     );
//   }
// }

export const DELETE = async (request, { params }) => {
  
  console.log("ENTRANDO A DELETE BORRADOR:");
  try {
    const { codigo_eve } = params;

    if (!codigo_eve) {
      return NextResponse.json(
        { message: "El código de evento es requerido" },
        { status: 400 }
      );
    }

    // ✅ Usa $1 en lugar de ? (PostgreSQL)
    const result = await conn.query(
      "DELETE FROM tbasistencia_borrador WHERE codigo_eve = $1",
      [codigo_eve]
    );

    // ✅ En PostgreSQL, usa .rowCount (no .affectedRows)
    if (result.rowCount > 0) {
      return NextResponse.json({ message: "Borrador del evento eliminado" });
    } else {
      return NextResponse.json(
        { message: "No se encontró un borrador para este evento" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error en DELETE de borrador:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }

}