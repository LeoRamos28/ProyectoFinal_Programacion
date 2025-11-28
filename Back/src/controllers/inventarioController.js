import db from "../config/database.js";
import { QueryTypes } from "sequelize"; // Importamos esto por seguridad para las queries

// 1. LISTAR (GET)

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Listar todos los productos activos del inventario
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de productos activos en inventario
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

export const getInventario = async (req, res) => {
  try {
    // Devolvemos los datos limpios
    const results = await db.query('SELECT * FROM inventario WHERE activo = 1', {
      type: QueryTypes.SELECT
    });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 2. CREAR (POST)

/**
 * @swagger
 * /api/inventario:
 *   post:
 *     summary: Crear nuevo producto en inventario
 *     tags: [Inventario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - stock_actual
 *               - unidad_medida
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Router GPON ONT"
 *               descripcion:
 *                 type: string
 *                 example: "Router óptico para clientes residenciales"
 *               stock_actual:
 *                 type: integer
 *                 example: 50
 *               unidad_medida:
 *                 type: string
 *                 example: "Unidades"
 *     responses:
 *       200:
 *         description: Producto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item creado correctamente"
 *                 id_producto:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Error interno al crear producto
 *     security:
 *       - bearerAuth: []
 */

export const crearItem = async (req, res) => {
  const { nombre, descripcion, stock_actual, unidad_medida } = req.body;
  
  try {
    
    const [result] = await db.query(
      'INSERT INTO inventario (nombre, descripcion, stock_actual, unidad_medida, activo) VALUES (?, ?, ?, ?, 1)',
      {
        replacements: [nombre, descripcion, stock_actual, unidad_medida],
        type: QueryTypes.INSERT
      }
    );

    
    res.json({ 
      message: 'Producto creado correctamente', 
      id_producto: result 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 3. ACTUALIZAR (PUT)

/**
 * @swagger
 * /api/inventario/{id}:
 *   put:
 *     summary: Actualizar producto del inventario por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Cable fibra óptica 200m"
 *               descripcion:
 *                 type: string
 *                 example: "Cable monomodo actualizado"
 *               stock_actual:
 *                 type: integer
 *                 example: 30
 *               unidad_medida:
 *                 type: string
 *                 example: "metros"
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventario actualizado"
 *       500:
 *         description: Error interno al actualizar producto
 *     security:
 *       - bearerAuth: []
 */
export const actualizarItem = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, stock_actual, unidad_medida } = req.body;
  
  try {
    await db.query(
      'UPDATE inventario SET nombre = ?, descripcion = ?, stock_actual = ?, unidad_medida = ? WHERE id_producto = ?',
      {
        replacements: [nombre, descripcion, stock_actual, unidad_medida, id],
        type: QueryTypes.UPDATE
      }
    );
    res.json({ message: 'Inventario actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 4. ELIMINAR (DELETE)

/**
 * @swagger
 * /api/inventario/{id}:
 *   delete:
 *     summary: Desactivar producto del inventario por ID (soft delete)
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID del producto a desactivar
 *     responses:
 *       200:
 *         description: Producto desactivado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item eliminado"
 *       500:
 *         description: Error interno al eliminar producto
 *     security:
 *       - bearerAuth: []
 */
export const eliminarItem = async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query(
      'UPDATE inventario SET activo = 0 WHERE id_producto = ?',
      {
        replacements: [id],
        type: QueryTypes.UPDATE
      }
    );
    res.json({ message: 'Item eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};