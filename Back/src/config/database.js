// database.js (versión mejorada)
import { Sequelize } from "sequelize";
import config from "./config.js";

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: process.env.DB_PORT || 3306,
    dialect: config.db.dialect,
    logging: false, //Evita logs pesados en la consola
  }
);

export default sequelize;