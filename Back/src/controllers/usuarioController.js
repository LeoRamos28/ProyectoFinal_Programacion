// controllers/usuarioController.js
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

// Registrar usuario
export const registrar = async (req, res) => {
  try {
    const { nombre, apellido, dni, email, telefono, id_rol, password } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !dni || !email || !id_rol || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre,
      apellido,
      dni,
      email,
      telefono,
      id_rol,
      password: hashedPassword,
    });

    res.status(201).json({ mensaje: "Usuario registrado", usuario });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // ✅ ahora usamos email

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    // Buscar por EMAIL (único en tu tabla)
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !usuario.estado) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar token con datos reales de tu modelo
    const token = jwt.sign(
      { 
        id: usuario.id_usuario, 
        email: usuario.email, 
        id_rol: usuario.id_rol 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expires }
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        id_rol: usuario.id_rol
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Listar usuarios (ruta protegida)
export const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'dni', 'id_rol', 'estado']
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error al listar:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await usuario.destroy();
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    console.error("Error al eliminar:", error);
    res.status(500).json({ error: error.message });
  }
};