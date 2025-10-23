//falta importar la conexion a la base de datos
// Importa la conexión a la base de datos
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('query');

    console.log("searchTerm (API):", searchTerm);

    if (!searchTerm || searchTerm.trim() === "") {
      return NextResponse.json([]);
    }

    const safeSearchTerm = searchTerm.trim().substring(0, 50);
    console.log("safeSearchTerm (API):", safeSearchTerm);
    const searchPattern = `%${safeSearchTerm.toLowerCase()}%`;
    console.log("searchPattern (API):", searchPattern);


    // ✅ Corregido: 
    // - Usa $1, $2 (PostgreSQL)
    // - Corrige "nobre_mie" → "nombre_mie"
    const query = `
      SELECT id_mie, cedula_mie, nombre_mie
      FROM tbmiembros
      WHERE LOWER(cedula_mie) LIKE $1 OR LOWER(nombre_mie) LIKE $2
      LIMIT 10
    `;

    
    const result = await conn.query(query, [searchPattern, searchPattern]);

    console.log("Resultado de la consulta (API):", result);
    // ✅ En PostgreSQL + node-postgres, los resultados están en .rows
    const rows = result.rows;

    if (!Array.isArray(rows)) {
      console.error("Formato inesperado de resultado:", result);
      return NextResponse.json(
        { message: "Error al procesar los datos de la base de datos." },
        { status: 500 }
      );
    }

    return NextResponse.json(rows);

  } catch (error) {
    console.error("Error en la búsqueda de miembros:", error);
    return NextResponse.json(
      { message: "Ocurrió un error al buscar miembros.", error: error.message },
      { status: 500 }
    );
  }
}


export const POST = async (req) => {
  try {
    const data = await req.json();
    console.log("DATA", data);

    if (
      !data.codigo_evento ||
      !Array.isArray(data.miembros) ||
      data.miembros.length === 0
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

    const codigo_eve = data.codigo_evento; // Cambiado de id_eve a codigo_eve
    const results = [];

    // Verificar si el evento existe
    const eventoExistente = await conn.query(
      "SELECT * FROM tbeventos WHERE codigo_eve = ?",
      [codigo_eve]
    );
    if (eventoExistente.length === 0) {
      return NextResponse.json(
        {
          message: "El evento no existe",
        },
        {
          status: 400,
        }
      );
    }

    for (const miembro of data.miembros) {
      const { cedula, nombre, id_mie } = miembro;

      if (!cedula || !nombre || !id_mie) {
        return NextResponse.json(
          {
            message: "Faltan datos del miembro",
          },
          {
            status: 400,
          }
        );
      }

      const result = await conn.query("INSERT INTO tbasistencia SET ?", {
        id_mie,
        codigo_eve, // Cambiado de id_eve a codigo_eve
        nombre_mie: nombre,
        cedula_mie: cedula,
      });

      results.push(result);
    }

    return NextResponse.json({ message: "Asistencia guardada", results });
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