import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    // Consulta para obtener todos los miembros
    const allMembersResult = await conn.query(
      `SELECT
        *,
        TIMESTAMPDIFF(YEAR, fechanacimiento_mie, CURDATE()) AS edad_actual
      FROM
        tbmiembros
        `);

    // Consulta para contar miembros por género
    // ASUMO que tienes una columna llamada 'genero_mie' o similar.
    // Si tu columna se llama diferente (ej: 'sexo', 'genero'), cámbiala aquí.
    const genderCountResult = await conn.query(
     "SELECT sexo_mie, COUNT(*) AS count FROM tbmiembros GROUP BY sexo_mie");


    // Formatear los resultados del conteo para que sean más fáciles de usar
    const genderCounts = genderCountResult.reduce((acc, current) => {
      acc[current.sexo_mie] = current.count;
      return acc;
    }, {});

    const tipoMembersResult = await conn.query(
      "SELECT tipo_mie, COUNT(*) AS count FROM tbmiembros GROUP BY tipo_mie");
    // Formatear los resultados del conteo por tipo de miembro

    // También puedes calcular el total aquí si lo necesitas
    const totalMembers = allMembersResult.length;

    // Retorna ambos resultados en un solo objeto JSON
    return NextResponse.json({
      miembros: allMembersResult,
      conteoPorGenero: genderCounts,
      totalMiembros: totalMembers,
      tipoMiembros: tipoMembersResult,
      status: 200,
    });
  } catch (error) {
    console.error("Error al obtener miembros y conteo por género:", error); // Es buena práctica loggear el error
    // Asegúrate de que 'result.error' no sea null si la variable 'result' no existe aquí
    return NextResponse.json(
      {
        message: "Error al realizar la consulta a la base de datos.",
        error: error.message || "Error desconocido", // Usa error.message para depuración
      },
      {
        status: 500,
      }
    );
  }
};


export const POST = async (req) => {
  try {
    const data = await req.json();

    if (!data.telefono_mie) {
      data.telefono_mie = 0;
    }

    if (!data.email_mie) {
      data.email_mie = "sincorreo@email.com";
    }
      
    // Validación de datos
    if (!data.nombre_mie || !data.cedula_mie || !data.direccion_mie || 
        !data.telefono_mie || !data.fechanacimiento_mie || !data.sexo_mie || !data.email_mie || !data.tipo_mie) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    // Verificar miembro existente
    const existingMember = await conn.query(
      "SELECT * FROM tbmiembros WHERE cedula_mie = ?", [data.cedula_mie]
    );

    if (existingMember.length > 0) {
      return NextResponse.json(
        { message: "El miembro ya está registrado." }, { status: 400 }
      );
    }

    // 1. Insertar el nuevo miembro
    const result = await conn.query("INSERT INTO tbmiembros SET ?", {
      nombre_mie: data.nombre_mie,
      cedula_mie: data.cedula_mie,
      direccion_mie: data.direccion_mie,
      telefono_mie: data.telefono_mie,
      fechanacimiento_mie: data.fechanacimiento_mie,
      sexo_mie: data.sexo_mie,
      email_mie: data.email_mie,
      tipo_mie: data.tipo_mie,
    });

    // 2. Actualizar el contador (sin transacción)
    await conn.query(
      "UPDATE configuracion SET totalMiembros = totalMiembros + 1 WHERE id = 1"
    );

    return NextResponse.json({
      message: "Miembro registrado y contador actualizado exitosamente.",
      result
    });

  } catch (error) {
    return NextResponse.json(
      { message: error.message }, { status: 500 }
    );
  }
};


