import { Pool } from "pg";


// Conexion a la base de datos de Postgress en Produccion
export const conn = new Pool({
  config: {
    host: "dpg-d39airer433s7384opsg-a",
    user: "dbappielfa_user",
    password: "Su5BwS3Uq5ki3WKFRrIHjmwMgruVnKTz",
    port: "5432",
    database: "dbappielfa", //Esta es la bd de ielfa en produccion
  },
});

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