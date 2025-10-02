// app/api/usersession/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // 👈 Importa desde lib/auth.js
import { NextResponse } from "next/server";
import axios from "axios";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "No estás autenticado" },
        { status: 401 }
      );
    }

    // Obtener el email del usuario desde la sesión
    const email = session.user.email;

    // Consultar la API de usuarios para obtener el rol
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/usuarios/${email}`
    );

    return NextResponse.json({
      user: session.user.name,
      role: response.data.nombre_rol,
    });
  } catch (error) {
    console.error("Error obteniendo la sesión o el rol del usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}