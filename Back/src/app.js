import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import usuarioRoutes from "./routes/routes.js";
import Usuario from "./models/Usuario.js"; 
import Rol from "./models/Rol.js"; 

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CONFIGURACIÓN CORS PARA PERMITIR EL FRONTEND (4200)
const corsOptions = {
    // Permite solicitudes desde tu frontend
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Manejar cookies/headers de autenticación
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions)); 
app.use(express.json());
app.use("/api/usuarios", usuarioRoutes);


async function inicializarRoles() {
    try {
        // Asegurar el Rol Master (ID 1)
        await Rol.findOrCreate({
            where: { id_rol: 1 },
            defaults: { nombre: 'Master' }
        });
        console.log("✅ Rol 'Master' (ID 1) asegurado.");

        // Asegurar el Rol Técnico (ID 3)
        await Rol.findOrCreate({
            where: { id_rol: 2 }, 
            defaults: { nombre: 'Tecnico' }
        });
        console.log("✅ Rol 'Tecnico' (ID 2) asegurado.");
        
    } catch (err) {
        console.error("❌ Error inicializando roles:", err.message);
        throw err;
    }
}

// Función para crear usuario master si no existe
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

// Conexion a la DB y levantamos el servidor
sequelize.authenticate()
    .then(async () => {
        console.log("✅ Conectado a database_final");
        
        // 1. INICIALIZAR LOS ROLES
        await inicializarRoles();
        
        // 2. LUEGO CREAR EL USUARIO MASTER
        await crearMaster();
        
        app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
    })
    .catch(err => console.error("❌ Error al conectar con la base de datos:", err));