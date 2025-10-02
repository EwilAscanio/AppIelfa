import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('query');

    // Si no hay término de búsqueda, devolver array vacío
    if (!searchTerm || searchTerm.trim() === "") {
      return NextResponse.json([]);
    }

    // Limitar longitud y preparar patrón de búsqueda
    const safeSearchTerm = searchTerm.trim().substring(0, 50);
    const searchPattern = `%${safeSearchTerm}%`;

    // Consulta SQL segura para PostgreSQL
    // - cedula_mie es INTEGER → convertir a TEXT con ::TEXT
    // - nombre_mie es texto → usar LOWER() para búsqueda insensible a mayúsculas
    const query = `
      SELECT id_mie, cedula_mie, nombre_mie
      FROM tbmiembros
      WHERE cedula_mie::TEXT LIKE $1 
         OR LOWER(nombre_mie) LIKE $2
      LIMIT 10
    `;

    // Ejecutar consulta con parámetros seguros
    const result = await conn.query(query, [
      searchPattern,               // para cédula (texto, sin lower)
      searchPattern.toLowerCase()  // para nombre (en minúsculas)
    ]);

    // Devolver solo las filas
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("Error en la búsqueda de miembros:", error);
    return NextResponse.json(
      { 
        message: "Ocurrió un error al buscar miembros.",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export const POST = async (req) => {
    try {
        const data = await req.json();

        // 1. Validación de datos esenciales
        if (
            !data.asistencia ||
            !Array.isArray(data.asistencia) ||
            data.asistencia.length === 0 ||
            !data.asistencia[0].codigo_eve
        ) {
            return NextResponse.json(
                {
                    message: "Faltan datos esenciales: codigo_eve o el array de asistencia está vacío.",
                },
                { status: 400 }
            );
        }

        const codigo_eve = data.asistencia[0].codigo_eve;
        const fecha_asi = data.asistencia[0].fecha_asi;

        // 2. Verificar si el evento existe
        const eventoExistente = await conn.query(
            "SELECT 1 FROM tbeventos WHERE codigo_eve = $1",
            [codigo_eve]
        );

        if (eventoExistente.rows.length === 0) {
            return NextResponse.json(
                { message: "El evento no existe." },
                { status: 400 }
            );
        }

        let insertedCount = 0;
        let ignoredCount = 0;
        const results = [];

        // 3. Iterar e insertar de forma segura
        for (const miembro of data.asistencia) {
            const { cedula_mie, nombre_mie, id_mie, fecha_asi: miembro_fecha_asi } = miembro;

            if (!cedula_mie || !nombre_mie || !id_mie || !miembro_fecha_asi) {
                return NextResponse.json(
                    {
                        message: "Faltan datos esenciales para un miembro en la asistencia.",
                        miembroConError: miembro,
                    },
                    { status: 400 }
                );
            }

            // Consulta SQL con ON CONFLICT DO NOTHING
            const insertQuery = `
                INSERT INTO tbasistencia 
                    (id_mie, codigo_eve, nombre_mie, cedula_mie, fecha_asi)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id_mie, codigo_eve) DO NOTHING
                RETURNING id_asi;
            `;

            const result = await conn.query(
                insertQuery,
                [id_mie, codigo_eve, nombre_mie, cedula_mie, miembro_fecha_asi]
            );

            // 4. Contabilizar resultados
            if (result.rows.length > 0) {
                // La fila fue insertada (es un registro nuevo)
                results.push(result.rows[0]);
                insertedCount++;
            } else {
                // La inserción fue ignorada (es un duplicado)
                ignoredCount++;
            }
        }
        
        // 5. Respuesta detallada al cliente
        return NextResponse.json({
            message: `Proceso de asistencia completado. Se registraron ${insertedCount} nuevos asistentes y se ignoraron ${ignoredCount} duplicados.`,
            inserted_records: results,
            inserted_count: insertedCount,
            ignored_count: ignoredCount,
        });

    } catch (error) {
        console.error("Error al procesar la asistencia:", error);
        
        // Manejar errores específicos de duplicado si la restricción fallara por alguna razón.
        // Aunque ON CONFLICT debe prevenir el error 23505, lo mantenemos por si acaso.
        if (error.code === '23505') { 
             return NextResponse.json(
                {
                    message: "Error de duplicidad: uno o más miembros ya tienen asistencia registrada para este evento.",
                    error: error.message,
                },
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            {
                message: "Error interno del servidor al guardar la asistencia.",
                error: error.message,
            },
            { status: 500 }
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
