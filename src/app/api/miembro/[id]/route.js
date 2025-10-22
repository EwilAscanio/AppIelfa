import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";


export const GET = async (request, { params }) => {
  console.log("Obteniendo miembro con cédula:", params.id);
  
  try {
    const { id: cedula } = params;

    if (!cedula) {
      return NextResponse.json(
        { message: "Cédula es requerida" },
        { status: 400 }
      );
    }

    // ✅ Consulta segura para PostgreSQL
    const result = await conn.query(
      `
      SELECT
        *,
        EXTRACT(YEAR FROM AGE(fechanacimiento_mie))::INTEGER AS edad_actual
      FROM
        tbmiembros
      WHERE
        cedula_mie = $1
      `,
      [cedula]
    );

    // ✅ Acceder a .rows, no a result directamente
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error al obtener miembro:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};

export const PUT = async (request, { params }) => {
  try {
    const { id: cedula_actual } = params;

    if (!cedula_actual) {
      return NextResponse.json(
        { message: "Cédula es requerida" },
        { status: 400 }
      );
    }

    const {
      nombre_mie,
      cedula_mie,
      direccion_mie,
      telefono_mie,
      fechanacimiento_mie,
      sexo_mie,
      email_mie,
      tipo_mie
    } = await request.json();

    // Validar campos requeridos
    if (
      !nombre_mie || !cedula_mie || !direccion_mie || !telefono_mie ||
      !fechanacimiento_mie || !sexo_mie || !email_mie || !tipo_mie
    ) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // ✅ Consulta segura con placeholders de PostgreSQL ($1, $2, ...)
    const result = await conn.query(
      `UPDATE tbmiembros
       SET 
         nombre_mie = $1,
         cedula_mie = $2,
         direccion_mie = $3,
         telefono_mie = $4,
         fechanacimiento_mie = $5,
         sexo_mie = $6,
         email_mie = $7,
         tipo_mie = $8
       WHERE cedula_mie = $9`,
      [
        nombre_mie,
        cedula_mie,
        direccion_mie,
        telefono_mie,
        fechanacimiento_mie,
        sexo_mie,
        email_mie,
        tipo_mie,
        cedula_actual
      ]
    );

    // ✅ En PostgreSQL, usa .rowCount (no affectedRows)
    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Miembro actualizado exitosamente"
    });

  } catch (error) {
    console.error("Error al actualizar miembro:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (request, { params }) => {
  const { id: cedula } = params;

  if (!cedula) {
    return NextResponse.json(
      { message: "Cédula es requerida" },
      { status: 400 }
    );
  }

  try {
    // 1. Verificar si el miembro existe
    const checkResult = await conn.query(
      "SELECT cedula_mie FROM tbmiembros WHERE cedula_mie = $1",
      [cedula]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // 2. Eliminar el miembro
    const deleteResult = await conn.query(
      "DELETE FROM tbmiembros WHERE cedula_mie = $1",
      [cedula]
    );

    // ✅ En PostgreSQL, usa .rowCount (no affectedRows)
    if (deleteResult.rowCount === 0) {
      return NextResponse.json(
        { message: "No se pudo eliminar el miembro" },
        { status: 500 }
      );
    }

    // 3. Actualizar contador de forma segura
    await conn.query(`
      UPDATE configuracion 
      SET totalMiembros = GREATEST(0, totalMiembros - 1) 
      WHERE id = 1
    `);

    return NextResponse.json({
      message: "Miembro eliminado y contador actualizado",
      deletedId: cedula
    });

  } catch (error) {
    console.error("Error al eliminar miembro:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor al eliminar el miembro",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
};