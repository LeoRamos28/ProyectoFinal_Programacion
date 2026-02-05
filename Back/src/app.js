import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import appRoutes from "./routes/app.routes.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import Rol from "./models/Rol.js";
import Usuario from "./models/Usuario.js";
import Cliente from "./models/Cliente.js";
import OrdenTrabajo from "./models/OrdenTrabajo.js";

const app = express();

// 1. PUERTO: Render asigna uno dinámico, en tu PC será el 3000
const PORT = process.env.PORT || 3000;

// 2. CORS: Permitir localhost en tu PC y Vercel en la nube
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";

const corsOptions = {
  origin: FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// 3. SWAGGER: URL dinámica para que los Docs funcionen en ambos lados
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Infinet Fibra API",
      version: "1.0.0",
      description:
        "API completa para gestión de clientes, usuarios, roles y órdenes de trabajo",
    },
    servers: [
      {
        // En Render usa la URL externa, en tu PC usa localhost
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/**/*.js"],
};

const specs = swaggerJsdoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Infinet Fibra - API Docs",
  }),
);

app.use("/api", appRoutes);

// ========================================================
// FUNCIONES INICIALIZACIÓN
// ========================================================
async function inicializarRoles() {
  try {
    await Rol.findOrCreate({
      where: { id_rol: 1 },
      defaults: { nombre: "Master" },
    });
    await Rol.findOrCreate({
      where: { id_rol: 2 },
      defaults: { nombre: "Tecnico" },
    });
    await Rol.findOrCreate({
      where: { id_rol: 3 },
      defaults: { nombre: "Atencion Cliente" },
    });
    console.log("✅ Roles de sistema asegurados.");
  } catch (err) {
    console.error("❌ Error inicializando roles:", err.message);
  }
}

async function crearMaster() {
  try {
    const existe = await Usuario.findOne({
      where: { email: "master@fibra.com" },
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
        estado: true,
      });
      console.log("✅ Usuario master creado");
    }
  } catch (err) {
    console.error("❌ Error creando usuario master:", err.message);
  }
}

// ========================================================
// CONEXIÓN Y SINCRONIZACIÓN (Híbrida)
// ========================================================
// .sync({ alter: true }) crea las tablas en Aiven si no existen
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ Conexión exitosa y tablas sincronizadas.");

    await inicializarRoles();
    await crearMaster();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor activo en puerto ${PORT}`);
      console.log(`📖 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ Error crítico de base de datos:", err);
  });
