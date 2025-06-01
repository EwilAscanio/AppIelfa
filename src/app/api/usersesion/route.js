import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req) {
  try {

    if (!authOptions) {
      console.error("authOptions no está configurado correctamente.");
      return NextResponse.json(
        {
          message: "Error en la configuración de autenticación.",
        },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      console.warn("No se encontró una sesión activa.");
      return NextResponse.json(
        {
          message: "No estás autenticado",
        },
        { status: 401 }
      );
    }

    // Obtener el email del usuario desde la sesión
    const email = session.user.email;
    const name = session.user.name;

    // Consultar la API de usuarios para obtener el rol
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/usuarios/${email}`
    );

    // Devolver el usuario y el rol
    return NextResponse.json({
      user: session.user.name,
      role : response.data.nombre_rol,
    });
  } catch (error) {
    console.error("Error obteniendo la sesión o el rol del usuario:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: error.message,
      },
      { status: 500 }
    );
  }
}