import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Usuario = sequelize.define(
  "Usuario",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id_usuario",
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING(20),
      allowNull: false,
      // Quitamos unique: true de aquí
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // Quitamos unique: true de aquí
      validate: {
        isEmail: true,
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    creado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "usuarios",
    timestamps: false,
    // Agregamos esta sección de índices con nombres fijos
    indexes: [
      {
        unique: true,
        fields: ["dni"],
        name: "idx_usuarios_dni_unique" 
      },
      {
        unique: true,
        fields: ["email"],
        name: "idx_usuarios_email_unique"
      }
    ]
  }
);

export default Usuario;