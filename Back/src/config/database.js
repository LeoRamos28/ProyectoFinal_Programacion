import { Sequelize } from "sequelize";

// En Render usamos DATABASE_URL, en local usamos tu config manual
const connectionString = process.env.DATABASE_URL;

const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || "infinet_fibra",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "basedatos",
      {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        logging: false,
      },
    );

export default sequelize;
