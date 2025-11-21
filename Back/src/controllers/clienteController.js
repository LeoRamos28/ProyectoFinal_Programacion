import Cliente from '../models/Cliente.js'; 
import { Op } from 'sequelize';

export const getClientes = async (req, res) => {
    try {
        // Listar todos los clientes
        const clientes = await Cliente.findAll({
            attributes: [
                'id_cliente', 
                'nombre', 
                'apellido', 
                'dni',
                'provincia', 
                'localidad', 
                'direccion'
            ],
            order: [['apellido', 'ASC']] 
        });

        res.json(clientes);
    } catch (error) {
        console.error('Error al listar clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes.' });
    }
};

// Registra cliente
export const createCliente = async (req, res) => {
    try {
        const { 
            nombre, 
            apellido,
            dni, 
            provincia, 
            localidad, 
            direccion 
        } = req.body;

        if (!nombre || !apellido || !provincia || !dni || !localidad || !direccion) {
            return res.status(400).json({ error: "Faltan campos obligatorios del cliente." });
        }
        
        const nuevoCliente = await Cliente.create({
            nombre,
            apellido,
            provincia,
            dni,
            localidad,
            direccion
        });

        res.status(201).json({ 
            mensaje: "Cliente registrado exitosamente.", 
            cliente: nuevoCliente 
        });

    } catch (error) {
        console.error('Error en registro de cliente:', error);
        res.status(500).json({ error: 'Fallo interno al registrar el cliente.' });
    }
};

// Buscar cliente
export const buscarClientes = async (req, res) => {
    const { query } = req.query;
    if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'No se proporcionó el dato de búsqueda.' });
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
                    { direccion: { [Op.like]: `%${query}%` } }
                ]
            },
            attributes: [
                'id_cliente', 
                'nombre', 
                'apellido', 
                'dni',
                'provincia', 
                'localidad', 
                'direccion'
            ],
            order: [['apellido', 'ASC']]
        });
        res.json(clientes);
    } catch (error) {
        console.error('Error al buscar clientes:', error);
        res.status(500).json({ error: 'Fallo interno al buscar clientes.' });
    }
};

// Eliminar cliente
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
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Fallo interno al eliminar el cliente.' });
  }
};

// Editar cliente
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
    console.error('Error al editar cliente:', error);
    res.status(500).json({ error: 'Fallo interno al editar el cliente.' });
  }
}
