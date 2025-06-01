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

    console.log("searchParam (API):", searchParam); // Log para depuración
    console.log("searchTerm (API):", searchTerm); // Log para depuración
    console.log("safesearchTerm (API):", safeSearchTerm); // Log para depuración

    // === CORRECCIÓN 2 y 3: Modificar la consulta SQL ===
    // - Seleccionar id_mie, cedula_mie y nobre_mie
    // - Buscar en cedula_mie O nobre_mie
    // - Usar LIKE con comodines % y LOWER() para búsqueda general e insensible a mayúsculas
    const query = `
      SELECT id_mie, cedula_mie, nombre_mie
      FROM tbmiembros
      WHERE LOWER(cedula_mie) LIKE ? OR LOWER(nombre_mie) LIKE ?
      LIMIT 10
    `;

     console.log("query (API):", query); // Log para depuración
    // === Ejecutar la consulta ===
    // Pasar el parámetro dos veces, una para cada placeholder (?)
    const queryResult = await conn.query(query, [searchParam, searchParam]);

    console.log("queryResult (API):", queryResult); // Log para depuración

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
    console.log("DATA COMPLETA RECIBIDA:", data); // Para depuración
    console.log("ARRAY DE ASISTENCIA:", data.asistencia); // Para depuración
    console.log("CODIGO EVENTO:", data.asistencia[0].codigo_eve); // Para depuración

    // VALIDACIÓN: Ahora verificamos data.asistencia
    if (
      !data.asistencia[0].codigo_eve|| // Asegúrate de que codigo_evento esté en el nivel superior del JSON
      !Array.isArray(data.asistencia) || // CAMBIO CLAVE: Usa data.asistencia
      data.asistencia.length === 0
    ) {
      return NextResponse.json(
        {
          message: "Faltan datos esenciales: codigo_evento o el array de asistencia está vacío o no es un array.",
        },
        {
          status: 400,
        }
      );
    }

    const codigo_eve = data.asistencia[0].codigo_eve;
    const fecha_asi = data.asistencia[0].fecha_asi; 
    const results = [];

    console.log("CODIGO EVENTO:", codigo_eve); // Para depuración
    console.log("FECHA ASISTENCIA:", fecha_asi); // Para depuración
    console.log("result", results); // Para depuración

    // Verificar si el evento existe
    const eventoExistente = await conn.query(
      "SELECT * FROM tbeventos WHERE codigo_eve = ?",
      [codigo_eve]
    );
    if (eventoExistente.length === 0) {
      return NextResponse.json(
        {
          message: "El evento no existe.",
        },
        {
          status: 400,
        }
      );
    }
    console.log("Fecha asi:", fecha_asi); // Para depuración

    // Iterar sobre data.asistencia en lugar de data.miembros
    for (const miembro of data.asistencia) { // CAMBIO CLAVE: Itera sobre data.asistencia
      const { cedula_mie, nombre_mie, id_mie, codigo_eve: miembro_codigo_eve, fecha_asi } = miembro; // Desestructura los campos tal como vienen en la data

      console.log("MIEMBRO:", miembro); // Para depuración

      if (!cedula_mie || !nombre_mie || !id_mie || !fecha_asi  ) { // Usa los nombres de las propiedades que recibes
        // Aquí podrías especificar qué miembro tiene los datos faltantes para depuración
        return NextResponse.json(
          {
            message: "Faltan datos esenciales (cedula_mie, nombre_mie, id_mie) para al menos un miembro en la asistencia.",
            miembroConError: miembro // Esto ayuda a depurar
          },
          {
            status: 400,
          }
        );
      }

      const result = await conn.query("INSERT INTO tbasistencia SET ?", {
        id_mie,
        codigo_eve: codigo_eve, // Usamos el codigo_eve principal del JSON, no del miembro específico si este está en el nivel superior.
                                 // Si el codigo_eve de cada miembro debe ser el que se use, entonces usa `miembro_codigo_eve`.
                                 // Dado que el JSON de entrada muestra `codigo_eve` dentro de cada objeto de asistencia,
                                 // y un `codigo_evento` a nivel superior, es mejor usar el del nivel superior para el insert
                                 // si el campo de la tabla se llama `codigo_eve`. Si el campo de la tabla es `id_evento`
                                 // y estás asignándole `codigo_eve` entonces es una inconsistencia en nombres.
        nombre_mie: nombre_mie,
        cedula_mie: cedula_mie,
        fecha_asi: fecha_asi
      });

      results.push(result);
    }

    return NextResponse.json({ message: "Asistencia guardada correctamente.", results });
  } catch (error) {
    console.error("Error al procesar la solicitud de asistencia:", error); // Log más detallado del error
    return NextResponse.json(
      {
        message: "Error interno del servidor al intentar guardar la asistencia.",
        error: error.message, // Incluir el mensaje de error para depuración
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
