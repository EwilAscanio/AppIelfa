import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const result = await conn.query(`
      SELECT
        A.codigo_eve,
        E.nombre_eve,
        CAST(A.fecha_asi AS DATE) AS fecha_asistencia,
        A.id_mie,
        A.nombre_mie,
        A.cedula_mie
      FROM
        tbasistencia AS A
      LEFT JOIN
        tbeventos AS E ON A.codigo_eve = E.codigo_eve
      ORDER BY
        CAST(A.fecha_asi AS DATE) DESC,
        A.codigo_eve ASC,
        A.nombre_mie ASC;
    `);

    // Agrupar los resultados por evento y fecha
    const eventosMap = new Map();

    result.rows.forEach(row => {
      const key = `${row.codigo_eve}-${row.fecha_asistencia}`;

      if (!eventosMap.has(key)) {
        eventosMap.set(key, {
          codigo_eve: row.codigo_eve,
          nombre_eve: row.nombre_eve,
          fecha_asistencia: row.fecha_asistencia,
          miembros: []
        });
      }

      // Agregar miembro a la lista si existe
      if (row.id_mie) {
        eventosMap.get(key).miembros.push({
          id_mie: row.id_mie,
          nombre_mie: row.nombre_mie,
          cedula_mie: row.cedula_mie
        });
      }
    });

    // Convertir el mapa a array y agregar total_asistentes
    const eventos = Array.from(eventosMap.values()).map(evento => ({
      ...evento,
      total_asistentes: evento.miembros.length
    }));

    return NextResponse.json(eventos);

  } catch (error) {
    console.error("Error al obtener resumen de asistencia:", error);
    
    // ❌ NO uses 'result.error' aquí (result no existe en catch)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: error.message, // ✅ Usa el error capturado
      },
      {
        status: 500,
      }
    );
  }
};
