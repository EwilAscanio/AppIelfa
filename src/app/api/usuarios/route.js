import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export const dynamic = 'force-dynamic';

export const GET = async () => {
  /* Comentario: Realizacion de la consulta a la base de datos
  para traer todos los usuarios registrados.
  Se utiliza un try catch para evaluar si la solicitud fue realizada
  con exito permite la consulta a la base de datos de los contrario da un error con status 500.
*/
  try {
    const result = await conn.query("SELECT * FROM tbusuarios");

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      {
        message: result.error,
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

    if (
      !data.nombre_usr ||
      !data.login_usr ||
      !data.email_usr ||
      !data.password_usr
    ) {
      return NextResponse.json(
        {
          message: "Faltan datos",
        },
        {
          status: 400,
        }
      );
    }

    // Destructuring de los datos recibidos
    let { nombre_usr, login_usr, email_usr, password_usr, id_rol } = data;
    

    // 1. Verificar si el usuario ya existe
    // Corrección: Usar $1 y $2 para los parámetros en PostgreSQL
    
    const existingUser = await conn.query(
      "SELECT * FROM tbusuarios WHERE email_usr = $1 OR login_usr = $2",
      [email_usr, login_usr]
    );

    // Corrección: El resultado de la consulta está en la propiedad 'rows'
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          message: "El usuario ya está registrado.",
        },
        {
          status: 400,
        }
      );
    }

    // 2. Hashear la contraseña
    password_usr = await bcrypt.hash(password_usr, 5);

    // 3. Insertar el nuevo usuario
    // Corrección: Usar la sintaxis de INSERT INTO ... VALUES (...)
    const insertQuery = `
      INSERT INTO tbusuarios 
      (nombre_usr, login_usr, email_usr, password_usr, id_rol)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await conn.query(insertQuery, [
      nombre_usr,
      login_usr,
      email_usr,
      password_usr,
      id_rol,
    ]);

    // Corrección: El resultado de la inserción también está en 'rows'
    return NextResponse.json(result.rows[0]);
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