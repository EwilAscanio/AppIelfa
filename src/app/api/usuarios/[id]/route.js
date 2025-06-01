import { NextResponse } from "next/server";
import { conn } from "@/libs/mariadb";

export const GET = async (req, { params }) => {
  try {
    const result = await conn.query(`
          SELECT * FROM tbusuarios INNER JOIN tbroles ON tbusuarios.id_rol = tbroles.id_rol
          WHERE email_usr = "${params.id}"`);

    if (result.lenght === 0 || result == []) {
      return NextResponse(
        {
          message: "Usuario no encontrado",
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(result[0]);
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

export const DELETE = async (req, { params }) => {
  const result = await conn.query(`
          DELETE FROM tbusuarios WHERE id_usr = "${params.id}"`);
  try {
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Usuario no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Usuario eliminado exitosamente",
      },
      {
        status: 200,
      }
    );
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
