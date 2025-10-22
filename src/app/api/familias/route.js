import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export const GET = async () => {

  console.log("Obteniendo todas las familias");

  try {
    if (!conn) {
      throw new Error("No se pudo establecer conexión con la base de datos.");
    }

    // Consulta para obtener todas las familias con información del jefe
    const familiesResult = await conn.query(`
       SELECT
  f.id_fam,
  f.nombre_fam,
  f.cedula_jefe_fam,
  m.nombre_mie AS jefe_nombre,
  m.cedula_mie AS jefe_cedula,
  JSON_AGG(
    json_build_object(
      'id', mem.id_mie,
      'nombre', mem.nombre_mie,
      'cedula', mem.cedula_mie,
      'parentesco', mem.parentesco
    )
  ) FILTER (WHERE mem.id_mie IS NOT NULL AND mem.cedula_mie != f.cedula_jefe_fam) AS miembros
FROM
  tbfamilias f
LEFT JOIN
  tbmiembros m ON f.cedula_jefe_fam = m.cedula_mie
LEFT JOIN
  tbmiembros mem ON f.id_fam = mem.id_fam
GROUP BY
  f.id_fam,
  f.nombre_fam,
  f.cedula_jefe_fam,
  m.nombre_mie,
  m.cedula_mie
ORDER BY
  f.nombre_fam ASC;
    `);

    const families = familiesResult.rows;

    return NextResponse.json({
      familias: families,
      totalFamilias: families.length,
    });
  } catch (error) {
    console.error("Error al obtener familias:", error);
    return NextResponse.json(
      {
        message: "Error al realizar la consulta a la base de datos.",
        error: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req) => {
  try {
    console.log("Registrando nueva familia");

    const data = await req.json();

    console.log("Datos recibidos para nueva familia:", data);

    // Validación de datos requeridos
    if (!data.nombre_fam || !data.cedula_jefe_fam) {
      return NextResponse.json(
        { message: "Nombre de familia y ID del jefe de familia son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el jefe de familia existe y no pertenece a otra familia
    const jefeCheck = await conn.query(
      "SELECT id_mie, cedula_mie, nombre_mie, id_fam FROM tbmiembros WHERE cedula_mie = $1 and id_fam IS NULL",
      [data.cedula_jefe_fam]
    );

    console.log("Resultado de la verificación del jefe de familia:", jefeCheck.rows);

    if (jefeCheck.rows.length === 0) {
      return NextResponse.json(
        { message: "Jefe de familia no encontrado" },
        { status: 404 }
      );
    }

    const jefe = jefeCheck.rows[0];

    console.log("Información del jefe de familia:", jefe);

    if (jefe.id_fam !== null) {
        // Verificar que no existe una familia con el mismo nombre
      const familyCheck = await conn.query(
        "SELECT id_fam FROM tbfamilias WHERE LOWER(TRIM(nombre_fam)) = LOWER(TRIM($1))",
        [data.nombre_fam.trim()]
      );
            if (familyCheck.rows.length > 0) {
            return NextResponse.json(
              { message: "Ya existe una familia con ese nombre" },
              { status: 400 }
            );
          }
        return NextResponse.json(
          { message: `El jefe de familia ${jefe.nombre_mie} ya pertenece a otra familia` },
          { status: 400 }
        );
    }

   
    console.log("Insertando nueva familia:", data.nombre_fam);
    console.log("ID del jefe de familia:", data.cedula_jefe_fam);
    console.log("Nombre del jefe de familia:", jefe.nombre_mie);
    console.log("Cédula del jefe de familia:", jefe.cedula_mie);
    console.log("Procediendo a insertar la nueva familia en la base de datos");

    // Insertar nueva familia
    const insertResult = await conn.query(
      `INSERT INTO tbfamilias
       (nombre_fam, cedula_jefe_fam)
       VALUES ($1, $2)
       RETURNING id_fam`,
      [data.nombre_fam.trim(), data.cedula_jefe_fam]
    );

    const familyId = insertResult.rows[0].id_fam;

    // Actualizar el jefe de familia con el ID de familia
    await conn.query(
      "UPDATE tbmiembros SET id_fam = $1 WHERE cedula_mie = $2",
      [familyId, data.cedula_jefe_fam]
    );

    return NextResponse.json({
      message: "Familia registrada exitosamente",
      familyId: familyId,
      familia: {
        id_fam: familyId,
        nombre_fam: data.nombre_fam.trim(),
        cedula_jefe_fam: data.cedula_jefe_fam,
        jefe_nombre: jefe.nombre_mie
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error al registrar familia:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};
