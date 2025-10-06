import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import usuarioRoutes from "./routes/routes.js";
import Usuario from "./models/Usuario.js"; // importamos el modelo

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/usuarios", usuarioRoutes);

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
        id_rol: 1, // Asegúrate de que el rol con id=1 exista en la tabla `roles`
        password: hashedPassword,
        estado: true
      });
      console.log("✅ Usuario master creado");
    } else {
      console.log("Usuario master ya existe");
    }
  } catch (err) {
    console.error("Error creando usuario master:", err);
  }
}

// Conectamos a la DB y levantamos el servidor (sin sync!)
sequelize.authenticate()
  .then(async () => {
    console.log("✅ Conectado a database_final");
    await crearMaster();
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ Error al conectar con la base de datos:", err));
