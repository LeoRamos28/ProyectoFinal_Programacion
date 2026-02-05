import { Sequelize } from "sequelize";

// En Render usamos DATABASE_URL, en local usamos tu config manual
const connectionString = process.env.DATABASE_URL;

const sequelize = connectionString 
  ? new Sequelize(connectionString, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Crucial para que Aiven acepte la conexión de Render
        }
      }
    })
  : new Sequelize(
      'tu_db_local', 
      'root', 
      'password', 
      {
        host: 'localhost',
        dialect: 'mysql',
        logging: false
      }
    );

export default sequelize;