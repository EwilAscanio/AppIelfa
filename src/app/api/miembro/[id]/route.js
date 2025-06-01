import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {

  try {
    // Consulta SQL segura
    const result = await conn.query(
      `
      SELECT
        *, TIMESTAMPDIFF(YEAR, fechanacimiento_mie, CURDATE()) AS edad_actual
      FROM
        tbmiembros
      WHERE
        cedula_mie = ?;
      `,
      [params.id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        {
          message: "Miembro no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(result[0]);
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

export const PUT = async (req, { params }) => {
  try {
   
  
    const {
      nombre_mie,
      cedula_mie,
      direccion_mie,
      telefono_mie,
      fechanacimiento_mie,
      sexo_mie,
      email_mie,
      tipo_mie,
    } = await req.json();

    const result = await conn.query(
      `
        UPDATE tbmiembros
        SET nombre_mie = "${nombre_mie}", cedula_mie = "${cedula_mie}", direccion_mie = "${direccion_mie}", telefono_mie = "${telefono_mie}", fechanacimiento_mie="${fechanacimiento_mie}", sexo_mie = "${sexo_mie}", email_mie = "${email_mie}", tipo_mie = "${tipo_mie}" WHERE cedula_mie = "${params.id}"
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

 
  try {
    // 1. Verificar si el miembro existe antes de eliminar
    const [memberExists] = await conn.query(
      "SELECT cedula_mie FROM tbmiembros WHERE cedula_mie = ?", 
      [params.id]
    );

    if (!memberExists.cedula_mie) {
      return NextResponse.json(
        { message: "Miembro no encontrado2" },
        { status: 404 }
      );
    }
    // 2. Ejecutar ambas operaciones secuencialmente
    const deleteResult = await conn.query(
      "DELETE FROM tbmiembros WHERE cedula_mie = ?", 
      [params.id]
    );

    // Validar que realmente se eliminó
    if (deleteResult.affectedRows === 0) {
      throw new Error("No se pudo eliminar el miembro");
    }

    // 3. Actualizar contador (versión segura con cláusula WHERE)
    await conn.query(`
      UPDATE configuracion 
      SET totalMiembros = GREATEST(0, totalMiembros - 1) 
      WHERE id = 1
    `);

    return NextResponse.json({
      message: "Miembro eliminado y contador actualizado",
      deletedId: params.id
    });

  } catch (error) {
    return NextResponse.json(
      { 
        message: `Error al eliminar: ${error.message}`,
        suggestion: "Verifique que el ID sea correcto y que exista el registro en configuración"
      },
      { status: 500 }
    );
  }
};

