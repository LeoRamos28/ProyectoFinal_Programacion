import db from "../config/database.js";
import { QueryTypes } from "sequelize"; // Importamos esto por seguridad para las queries

// 1. LISTAR (GET)
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
export const crearItem = async (req, res) => {
  const { nombre, descripcion, stock_actual, unidad_medida } = req.body;
  
  try {
    
    const [result] = await db.query(
      'INSERT INTO inventario (nombre, descripcion, stock_actual, unidad_medida) VALUES (?, ?, ?, ?)',
      {
        replacements: [nombre, descripcion, stock_actual, unidad_medida],
        type: QueryTypes.INSERT
      }
    );

    
    res.json({ 
      message: 'Item creado correctamente', 
      id_producto: result 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 3. ACTUALIZAR (PUT)
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