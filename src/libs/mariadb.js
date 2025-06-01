import mariadb from "serverless-mysql";

// Creacion de los parametros de conexion con la base de Databas.
export const conn = mariadb({
  config: {
    host: "localhost",
    user: "root",
    password: "1234",
    port: "3306",
    database: "db_ielfa",
  },
});
