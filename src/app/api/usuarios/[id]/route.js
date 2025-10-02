import { NextResponse } from "next/server";
import { conn } from "@/libs/postgress";

export const GET = async (request, { params }) => {
  try {
    const { id: email } = params; // 'id' en la URL representa el email

    if (!email) {
      return NextResponse.json(
        { message: "Email es requerido" },
        { status: 400 }
      );
    }

    // ✅ Consulta segura con placeholder ($1) para evitar inyección SQL
    const result = await conn.query(
      `SELECT 
         tbusuarios.*, 
         tbroles.nombre_rol 
       FROM tbusuarios 
       INNER JOIN tbroles ON tbusuarios.id_rol = tbroles.id_rol
       WHERE tbusuarios.email_usr = $1`,
      [email]
    );

    // ✅ Acceder a .rows y verificar longitud correctamente
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error al obtener usuario por email:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const { id } = params;

    // Validar que el ID sea un número válido
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // ✅ Consulta segura con placeholder de PostgreSQL ($1)
    const result = await conn.query(
      "DELETE FROM tbusuarios WHERE id_usr = $1",
      [Number(id)]
    );

    // ✅ En PostgreSQL, usa .rowCount (no affectedRows)
    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Usuario eliminado exitosamente" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
};
