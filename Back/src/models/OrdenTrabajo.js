import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Cliente from './Cliente.js';
import Usuario from './Usuario.js';

const OrdenTrabajo = sequelize.define('OrdenTrabajo', {
    id_orden: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cliente,
            key: 'id_cliente'
        }
    },
    id_usuario_atencion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id_usuario'
        }
    },
    id_tecnico_asignado: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: 'id_usuario'
        }
    },
    tipo: {
        type: DataTypes.ENUM('instalacion', 'reclamo'),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    direccion_trabajo: {
        type: DataTypes.STRING(255),
    },
    estado: {
        type: DataTypes.ENUM('pendiente', 'asignada', 'en_proceso', 'finalizada', 'cancelada', 'completada'),
        defaultValue: 'pendiente',
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    
    fecha_asignacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fecha_finalizacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    solucion_reclamo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'ordenes_trabajo',
    timestamps: false

});


OrdenTrabajo.belongsTo(Cliente, { as: "cliente", foreignKey: "id_cliente" });
OrdenTrabajo.belongsTo(Usuario, { as: "tecnico", foreignKey: "id_tecnico_asignado" });
OrdenTrabajo.belongsTo(Usuario, { as: "atencion", foreignKey: "id_usuario_atencion" });

export default OrdenTrabajo;





