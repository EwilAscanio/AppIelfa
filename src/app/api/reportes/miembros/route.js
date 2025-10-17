import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

/**
 * GET /api/miembros
 * Obtiene la lista completa de miembros con su edad calculada.
 */
export const GET = async (request) => {
  
  const { searchParams } = new URL(request.url);

  const categoria = searchParams.get('categoria'); 

  console.log("Categoría recibida en la API:", categoria);

  try {
    // Consulta segura en PostgreSQL: calcula la edad y selecciona todos los campos necesarios
    const result = await conn.query(`
      SELECT 
        id_mie,
        nombre_mie,
        cedula_mie,
        direccion_mie,
        telefono_mie,
        fechanacimiento_mie,
        sexo_mie,
        email_mie,
        tipo_mie,
        EXTRACT(YEAR FROM AGE(fechanacimiento_mie))::INTEGER AS edad_actual
      FROM tbmiembros
      ORDER BY nombre_mie ASC;
    `);

    const miembrosTotales = result.rows;

    if (miembrosTotales.length === 0) {
      return NextResponse.json(
        { 
          message: "No se encontraron miembros registrados.",
          miembros: []
        },
        { status: 200 }
      );
    }

    const miembrosAdultos = miembrosTotales.filter(miembro => miembro.edad_actual >= 10);
    const miembrosNinos = miembrosTotales.filter(miembro => miembro.edad_actual < 10);


    return NextResponse.json({ 
      miembrosTotales,
      miembrosAdultos,
      miembrosNinos 
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener la lista de miembros:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor al obtener los miembros.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
};