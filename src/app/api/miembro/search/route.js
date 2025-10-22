import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async (req) => {

  console.log("Iniciando búsqueda de miembros");
  
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