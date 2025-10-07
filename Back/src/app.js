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

// FUNCIÓN: GARANTIZAR LA EXISTENCIA DEL ROL ADMIN
async function inicializarRoles() {
    try {
        const [rolAdmin, created] = await Rol.findOrCreate({
            where: { id_rol: 1 }, // Busca por ID 1
            defaults: { 
                nombre: 'Admin' 
            }
        });

        if (created) {
            console.log("✅ Rol 'Admin' (ID 1) creado exitosamente.");
        } else {
            if (rolAdmin.nombre !== 'Admin') {
                console.warn(`⚠️ Advertencia: El id_rol 1 existe con el nombre: ${rolAdmin.nombre}`);
            }
            console.log("Rol 'Admin' (ID 1) ya existe.");
        }
    } catch (err) {
        console.error("❌ Error inicializando roles. Asegúrate de que la tabla 'roles' exista:", err.message);
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
                id_rol: 1, // Usa el ID del rol que garantizamos arriba
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