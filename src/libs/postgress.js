import { Pool } from "pg";

// Conexion a la base de datos de Postgress en Produccion
export const conn = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  // 👇 Configuración crítica para evitar ECONNRESET en Render
  idleTimeoutMillis: 30000,    // Cierra conexiones inactivas después de 30s (menos que 5 min)
  connectionTimeoutMillis: 5000, // Tiempo máximo para establecer conexión
  max: 5,                      // Máximo de conexiones en el pool
  ssl: {
    rejectUnauthorized: false, // Render requiere SSL, pero con cert autofirmado
  },
});


/*
export const conn = new Pool({
  config: {
    host: "dpg-d39airer433s7384opsg-a.oregon-postgres.render.com",
    user: "dbappielfa_user",
    password: "Su5BwS3Uq5ki3WKFRrIHjmwMgruVnKTz",
    port: "5432",
    database: "dbappielfa", //Esta es la bd de ielfa en produccion
  },
});

*/


// Conexion a la base de datos de Postgress en Desarrollo
/*
export const conn = new Pool({
    config: {
      host: "localhost",
      user: "root",
      password: "123456",
      port: "5432",
      database: "dbappielfa", //Esta es la bd de ielfa en produccion
      //database: "db_ielfa", // Esta es la bd de ielfa en desarrollo
    },
  });

*/