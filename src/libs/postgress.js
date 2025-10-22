import { Pool } from "pg";

// Conexion a la base de datos de Postgress en Produccion
export const conn = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,

  // 👇 Configuración crítica para evitar ECONNRESET
  idleTimeoutMillis: 30000,    // Cierra conexiones inactivas después de 30s (menos que 5 min)
  connectionTimeoutMillis: 5000, // Tiempo máximo para establecer conexión
  max: 5,                      // Máximo de conexiones en el pool

  ssl: false 

});


// ssl: {
//   rejectUnauthorized: false, 
// },