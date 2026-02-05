import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import appRoutes from "./routes/app.routes.js";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import Rol from "./models/Rol.js"; 
import Usuario from "./models/Usuario.js";
import Cliente from "./models/Cliente.js";
import OrdenTrabajo from "./models/OrdenTrabajo.js";

const app = express();
const PORT = process.env.PORT || 3000;

// URL de tu frontend en Vercel (la obtendremos de una variable de entorno en Render)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// ✅ Configuración CORS Dinámica
const corsOptions = {
    origin: FRONTEND_URL, // Permitirá localhost en tu PC y Vercel en la nube
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// ========================================================
// CONFIGURACIÓN SWAGGER
// ========================================================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Infinet Fibra API',
            version: '1.0.0',
            description: 'API completa para gestión de clientes, usuarios, roles y órdenes de trabajo',
        },
        servers: [
            { 
                // Detecta si está en Render o Local
                url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}` 
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/**/*.js'] 
};


const specs = swaggerJsdoc(swaggerOptions);

// ========================================================
// RUTAS SWAGGER
// ========================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Infinet Fibra - API Docs"
}));

app.use("/api", appRoutes);

// ========================================================
// FUNCIONES INICIALIZACIÓN (sin cambios)
// ========================================================
async function inicializarRoles() {
    try {
        await Rol.findOrCreate({
            where: { id_rol: 1 },
            defaults: { nombre: 'Master' }
        });
        console.log("✅ Rol 'Master' (ID 1) asegurado.");

        await Rol.findOrCreate({
            where: { id_rol: 2 }, 
            defaults: { nombre: 'Tecnico' }
        });
        console.log("✅ Rol 'Tecnico' (ID 2) asegurado.");

        await Rol.findOrCreate({
            where: { id_rol: 3 }, 
            defaults: { nombre: 'Atencion Cliente' }
        });
        console.log("✅ Rol 'Atencion Cliente' (ID 3) asegurado.");

    } catch (err) {
        console.error("❌ Error inicializando roles:", err.message);
        throw err;
    }
}

async function crearMaster() {
    try {
        const existe = await Usuario.findOne({ 
            where: { email: "master@fibra.com" } 
        });

        if (!existe) {
            const hashedPassword = await bcrypt.hash("TuPasswordMaster123", 10);
            await Usuario.create({
                nombre: "Master",
                apellido: "Admin",
                dni: "00000000",
                email: "master@fibra.com",
                telefono: "123456789",
                id_rol: 1, 
                password: hashedPassword,
                estado: true
            });
            console.log("✅ Usuario master creado");
        } else {
            console.log("Usuario master ya existe");
        }
    } catch (err) {
        console.error("Error creando usuario master:", err.message);
    }
}

// Conexión DB y levantar servidor
sequelize.authenticate()
    .then(async () => {
        console.log("✅ Conectado a database_final");
        
        await inicializarRoles();
        await crearMaster();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor en http://localhost:${PORT}`);
            console.log(`📖 Swagger Docs: http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => console.error("❌ Error al conectar con la base de datos:", err));
