import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

// Método para consultar los datos para el reporte Ventas de Combustible según su Uso de Vehículo
export const GET = async (request) => {

  console.log("URL", request);
  try {
    // Obtener los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const fechaInicial = searchParams.get("fechaInicial");
    const fechaFinal = searchParams.get("fechaFinal");

    console.log("FECHA INICIAL", fechaInicial);
    console.log("FECHA FINAL", fechaFinal);

    // Validar que las fechas estén presentes
    if (!fechaInicial || !fechaFinal) {
      console.log("FECHA INICIAL", fechaInicial);
      console.log("FECHA FINAL", fechaFinal);
      return NextResponse.json(
        {
          message: "Todos los datos son requeridas.",
        },
        {
          status: 400,
        }
      );
    }

    // Ajustar las fechas para incluir la hora
    const fechaInicio = `${fechaInicial} 00:00:00`;
    const fechaFin = `${fechaFinal} 23:59:59`;

    console.log("FECHA INICio", fechaInicio);
    console.log("FECHA FIN", fechaFin);

    // Consulta SQL con filtro por fechas
    const result = await conn.query(
      `
        SELECT * FROM tbeventos where fecha_eve >= ? and fecha_eve <= ?;
      `,
      [fechaInicial, fechaFinal] // Pasar los parámetros
    );
    //[fechaInicio, fechaFin] // Pasar los parámetros

    console.log("RESULT", result);
    // Validar si no se encontraron registros
    if (result.length === 0) {
      return NextResponse.json(
        {
          message:
            "No se encontraron registros para las fechas proporcionadas.",
        },
        {
          status: 404,
        }
      );
    }


    return NextResponse.json({
      eventos: result});
  } catch (error) {
    console.error("Error en la API:", error); // Log del error
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
