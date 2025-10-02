import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    // === CORRECCIÓN 1: Obtener el término del parámetro 'query' ===
    const searchTerm = searchParams.get('query');

    console.log("searchTerm (API):", searchTerm); // Log para depuración

    if (!searchTerm || searchTerm.trim() === "") {
      // Devolver un array vacío si no hay término de búsqueda
      return NextResponse.json([]);
    }

    const safeSearchTerm = searchTerm.trim().substring(0, 50); // Limita la longitud
    const searchParam = `%${safeSearchTerm.toLowerCase()}%`; // Parámetro para LIKE (busca en cualquier parte)

    // === CORRECCIÓN 2 y 3: Modificar la consulta SQL ===
    // - Seleccionar id_mie, cedula_mie y nobre_mie
    // - Buscar en cedula_mie O nobre_mie
    // - Usar LIKE con comodines % y LOWER() para búsqueda general e insensible a mayúsculas
    const query = `
      SELECT id_mie, cedula_mie, nobre_mie
      FROM tbmiembros
      WHERE LOWER(cedula_mie) LIKE ? OR LOWER(nobre_mie) LIKE ?
      LIMIT 10
    `;

    // === Ejecutar la consulta ===
    // Pasar el parámetro dos veces, una para cada placeholder (?)
    const queryResult = await conn.query(query, [searchParam, searchParam]);

    // === Extraer las filas del resultado ===
    // Asumiendo que conn.query de 'mysql2/promise' devuelve [rows, fields]
    let rows;
    if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
        rows = queryResult[0];
    }
    // Si tu librería de DB devuelve solo el array de filas directamente, usa esto:
    else if (Array.isArray(queryResult)) {
        rows = queryResult;
    }
    // Si devuelve un objeto con una propiedad 'results' (menos común, pero posible)
    else if (typeof queryResult === 'object' && queryResult !== null && Array.isArray(queryResult.results)) {
        rows = queryResult.results;
    }
    else {
        console.error("La Base de datos no retorna un array en un formato esperado:", queryResult);
        return NextResponse.json({ message: "Formato de datos inesperado de la base de datos." }, { status: 500 });
    }

    // Verificar si las filas obtenidas son un array válido
    if (!Array.isArray(rows)) {
       console.error("Algo salió mal después de obtener el resultado. 'rows' no es un array:", rows);
       return NextResponse.json({ message: "Error procesando datos de la base de datos." }, { status: 500 });
    }

    // Devolver los resultados como JSON
    return NextResponse.json(rows);

  } catch (error) {
    console.error("Error en la consulta o búsqueda de miembros:", error);
    // Devolver un error más descriptivo si es posible, o un mensaje genérico
    return NextResponse.json({ message: "Ocurrió un error al buscar miembros.", error: error.message }, { status: 500 });
  }
  // No necesitas un bloque finally si solo cierras la conexión, y si usas pool, no la cierras aquí.
  // Si no usas pool y necesitas cerrar la conexión, asegúrate de que 'conn' sea manejado correctamente.
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