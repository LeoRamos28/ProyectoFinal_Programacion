import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import appRoutes from "./routes/app.routes.js";

import Rol from "./models/Rol.js"; 
import Usuario from "./models/Usuario.js";
import Cliente from "./models/Cliente.js";
import OrdenTrabajo from "./models/OrdenTrabajo.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS
const corsOptions = {
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", appRoutes);

// inicialización roles y master 


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

        app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
    })
    .catch(err => console.error("❌ Error al conectar con la base de datos:", err));
