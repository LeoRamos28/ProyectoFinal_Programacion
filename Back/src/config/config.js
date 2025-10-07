import dotenv from "dotenv";
dotenv.config();

export default {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT || "mysql",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "clave_por_defecto",
    expires: process.env.JWT_EXPIRES || "1h",
  }
};