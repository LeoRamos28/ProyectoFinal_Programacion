import Cliente from "../models/Cliente.js";
import { Op } from "sequelize";

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener lista de clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       500:
 *         description: Error interno del servidor al obtener clientes.
 *     security:
 *       - bearerAuth: []
 */

export const getClientes = async (req, res) => {
  try {
    // Listar todos los clientes
    const clientes = await Cliente.findAll({
      attributes: [
        "id_cliente",
        "nombre",
        "apellido",
        "dni",
        "provincia",
        "localidad",
        "direccion",
      ],
      order: [["apellido", "ASC"]],
    });

    res.json(clientes);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener clientes." });
  }
};

// Registra cliente

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       description: Datos para crear un cliente
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - dni
 *               - provincia
 *               - localidad
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               dni:
 *                 type: string
 *                 example: "12345678"
 *               provincia:
 *                 type: string
 *                 example: "Buenos Aires"
 *               localidad:
 *                 type: string
 *                 example: "La Plata"
 *               direccion:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 cliente:
 *       400:
 *         description: Faltan campos obligatorios del cliente.
 *       500:
 *         description: Error interno del servidor al crear cliente.
 *     security:
 *       - bearerAuth: []
 */

export const createCliente = async (req, res) => {
  try {
    const { nombre, apellido, dni, provincia, localidad, direccion } = req.body;

    if (
      !nombre ||
      !apellido ||
      !provincia ||
      !dni ||
      !localidad ||
      !direccion
    ) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios del cliente." });
    }

    const nuevoCliente = await Cliente.create({
      nombre,
      apellido,
      provincia,
      dni,
      localidad,
      direccion,
    });

    res.status(201).json({
      mensaje: "Cliente registrado exitosamente.",
      cliente: nuevoCliente,
    });
  } catch (error) {
    console.error("Error en registro de cliente:", error);
    res.status(500).json({ error: "Fallo interno al registrar el cliente." });
  }
};

// Buscar cliente

/**
 * @swagger
 * /api/clientes/buscar:
 *   get:
 *     summary: Buscar clientes por varios campos
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: Texto para buscar en nombre, apellido, dni, provincia, localidad y dirección
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de clientes que coinciden con la búsqueda.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       400:
 *         description: No se proporcionó el dato de búsqueda.
 *       500:
 *         description: Fallo interno al buscar clientes.
 *     security:
 *       - bearerAuth: []
 */

export const buscarClientes = async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    return res
      .status(400)
      .json({ error: "No se proporcionó el dato de búsqueda." });
  }
  try {
    const clientes = await Cliente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${query}%` } },
          { apellido: { [Op.like]: `%${query}%` } },
          { dni: { [Op.like]: `%${query}%` } },
          { provincia: { [Op.like]: `%${query}%` } },
          { localidad: { [Op.like]: `%${query}%` } },
          { direccion: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: [
        "id_cliente",
        "nombre",
        "apellido",
        "dni",
        "provincia",
        "localidad",
        "direccion",
      ],
      order: [["apellido", "ASC"]],
    });
    res.json(clientes);
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    res.status(500).json({ error: "Fallo interno al buscar clientes." });
  }
};

// Eliminar cliente

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Eliminar un cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno al eliminar cliente
 *     security:
 *       - bearerAuth: []
 */
export const deleteCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }
    await cliente.destroy();
    res.json({ mensaje: "Cliente eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Fallo interno al eliminar el cliente." });
  }
};

// Editar cliente

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar un cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a actualizar
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Datos para actualizar el cliente
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Carlos"
 *               apellido:
 *                 type: string
 *                 example: "Pérez López"
 *               dni:
 *                 type: string
 *                 example: "87654321"
 *               provincia:
 *                 type: string
 *                 example: "Santa Fe"
 *               localidad:
 *                 type: string
 *                 example: "Rosario"
 *               direccion:
 *                 type: string
 *                 example: "Av. Siempre Viva 742"
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 cliente:
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno al actualizar cliente
 *     security:
 *       - bearerAuth: []
 */

export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, provincia, localidad, direccion } = req.body;
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }
    cliente.nombre = nombre ?? cliente.nombre;
    cliente.apellido = apellido ?? cliente.apellido;
    cliente.provincia = provincia ?? cliente.provincia;
    cliente.localidad = localidad ?? cliente.localidad;
    cliente.direccion = direccion ?? cliente.direccion;
    cliente.dni = dni ?? cliente.dni;

    await cliente.save();
    res.json({ mensaje: "Cliente actualizado.", cliente });
  } catch (error) {
    console.error("Error al editar cliente:", error);
    res.status(500).json({ error: "Fallo interno al editar el cliente." });
  }
};
