import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { Op } from "sequelize"; // Necesario para consultas más flexibles si se requiere



// Listar usuarios (General y Filtrado por Rol)

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios (filtrado opcional por rol)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id_rol
 *         schema:
 *           type: integer
 *           example: 2
 *         description: Filtrar usuarios por id_rol
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - bearerAuth: []
 */

export const getUsuarios = async (req, res) => {
    try {
        // 1. Obtener el filtro id_rol desde la query string (Ej: ?id_rol=3)
        const { id_rol } = req.query;

        let whereCondition = {};
        
        // Si se proporciona id_rol, filtramos por él. Esto lo usa tu frontend.
        if (id_rol) {
            whereCondition = { id_rol: id_rol };
        }

        const usuarios = await Usuario.findAll({
            where: whereCondition,
            attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'dni', 'telefono', 'id_rol', 'estado'],
            // Opcionalmente podrías ordenar aquí
            order: [['apellido', 'ASC']]
        });
        
        res.json(usuarios);
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ error: "Error al obtener la lista de usuarios/técnicos." });
    }
};


// Registrar/Crear usuario (Utilizado para crear técnicos)

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear usuario/registro de técnico (Solo Master)
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - dni
 *               - email
 *               - id_rol
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Carlos"
 *               apellido:
 *                 type: string
 *                 example: "García"
 *               dni:
 *                 type: string
 *                 example: "87654321"
 *               email:
 *                 type: string
 *                 example: "carlos@fibra.com"
 *               telefono:
 *                 type: string
 *                 example: "987654321"
 *               id_rol:
 *                 type: integer
 *                 example: 2
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *       400:
 *         description: Faltan campos obligatorios
 *       409:
 *         description: Email o DNI ya registrados
 *       500:
 *         description: Error interno
 *     security:
 *       - bearerAuth: []
 */
export const createUsuario = async (req, res) => {
    try {
        console.log("DATOS RECIBIDOS PARA CREAR USUARIO/TÉCNICO:", req.body); // ⬅️ AGREGAR ESTO

        // La solicitud viene de tu componente Técnico, el id_rol=3 lo asigna el servicio.
        const { nombre, apellido, dni, email, telefono, id_rol, password } = req.body;
        
        // 1. Validar campos obligatorios
        if (!nombre || !apellido || !dni || !email || !id_rol || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios (nombre, email, DNI, rol, contraseña)." });
        }

        // 2. Verificar si el email o DNI ya existen
        const existingUser = await Usuario.findOne({
            where: {
                [Op.or]: [{ email }, { dni }]
            }
        });
        
        if (existingUser) {
            return res.status(409).json({ error: "El email o DNI ya está registrado." });
        }

        // 3. Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Crear el usuario
        const usuario = await Usuario.create({
            nombre,
            apellido,
            dni,
            email,
            telefono,
            id_rol,
            password: hashedPassword,
            estado: true // Por defecto, estado activo
        });

        // Retornar el usuario sin el hash de la contraseña
        const { password: _, ...usuarioSinPassword } = usuario.toJSON();
        res.status(201).json({ mensaje: "Usuario registrado", usuario: usuarioSinPassword });
    } catch (error) {
        console.error("Error en createUsuario:", error);
        // Manejar errores de clave foránea o DB si son genéricos
        res.status(500).json({ error: error.message });
    }
};

// Actualizar usuario (Utilizado para editar técnicos)

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario por ID (Solo Master)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: ID del usuario a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Carlos"
 *               apellido:
 *                 type: string
 *                 example: "García"
 *               dni:
 *                 type: string
 *                 example: "87654321"
 *               email:
 *                 type: string
 *                 example: "carlos@fibra.com"
 *               telefono:
 *                 type: string
 *                 example: "987654321"
 *               id_rol:
 *                 type: integer
 *                 example: 2
 *               estado:
 *                 type: boolean
 *                 example: true
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 *     security:
 *       - bearerAuth: []
 */

export const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params; // id_usuario
        const { nombre, apellido, dni, email, telefono, id_rol, estado, password } = req.body;
        
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        let updateData = { nombre, apellido, dni, email, telefono, id_rol, estado };

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await usuario.update(updateData);

        // Retornar el usuario actualizado sin la contraseña
        const { password: _, ...usuarioSinPassword } = usuario.toJSON();
        res.json({ mensaje: "Usuario actualizado", usuario: usuarioSinPassword });
    } catch (error) {
        console.error("Error al actualizar:", error);
        // Manejar el error 409 (Conflicto) si intenta actualizar con un email/dni duplicado
        res.status(500).json({ error: error.message });
    }
};

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

// Login (Se mantiene igual)

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "master@fibra.com"
 *               password:
 *                 type: string
 *                 example: "TuPasswordMaster123"
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     id_rol:
 *                       type: integer
 *       400:
 *         description: Email y contraseña son requeridos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 *     security: []
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body; 

        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos" });
        }

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario || !usuario.estado) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const valido = await bcrypt.compare(password, usuario.password);
        if (!valido) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

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


// Eliminar usuario

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario por ID (Solo Master)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado con éxito
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 *     security:
 *       - bearerAuth: []
 */

export const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params; // id_usuario
        const resultado = await Usuario.destroy({
            where: { id_usuario: id }
        });

        if (resultado === 0) {
            return res.status(404).json({ error: "Usuario no encontrado para eliminar" });
        }

        res.json({ mensaje: "Usuario eliminado" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        // NOTA: La eliminación puede fallar si el usuario tiene claves foráneas activas (e.g., está asignado a órdenes de trabajo).
        res.status(500).json({ error: error.message });
    }
};
