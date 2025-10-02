import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async () => {
 
  try {
    const result = await conn.query(`
        SELECT
    A.codigo_eve,
    E.nombre_eve,
    CAST(A.fecha_asi AS DATE) AS fecha_asistencia,
    COUNT(A.id_asi) AS total_asistentes
FROM
    tbasistencia AS A
LEFT JOIN
    tbeventos AS E ON A.codigo_eve = E.codigo_eve
GROUP BY
    A.codigo_eve,
    E.nombre_eve,
    CAST(A.fecha_asi AS DATE)
ORDER BY
    fecha_asi DESC,
    A.codigo_eve ASC;
        `);

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
