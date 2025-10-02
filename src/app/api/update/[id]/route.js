import { conn } from "@/libs/postgress";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
  try {
    const { id } = params;

    // Validar que el ID sea un número
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // ✅ Consulta segura con placeholder de PostgreSQL
    const result = await conn.query(
      "SELECT * FROM tbusuarios WHERE id_usr = $1",
      [Number(id)] // Aseguro de pasar un número
    );

    // ✅ Acceder a .rows y verificar longitud correctamente
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ✅ Devolver el primer (y único) resultado
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
};

export const PUT = async (request, { params }) => {
  try {
    const { id } = params;

    // Validar que el ID sea un número
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const {
      nombre_usr,
      login_usr,
      email_usr,
      password_usr,
      id_rol
    } = await request.json();

    // Validar campos requeridos
    if (!nombre_usr || !login_usr || !email_usr || !password_usr || !id_rol) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password_usr, 5); 

    // ✅ Consulta segura con placeholders de PostgreSQL ($1, $2, ...)
    const result = await conn.query(
      `UPDATE tbusuarios
       SET 
         nombre_usr = $1,
         login_usr = $2,
         email_usr = $3,
         password_usr = $4,
         id_rol = $5
       WHERE id_usr = $6
       RETURNING *`,
      [nombre_usr, login_usr, email_usr, hashedPassword, Number(id_rol), Number(id)]
    );

    // ✅ En PostgreSQL, usa .rowCount (no affectedRows)
    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
};