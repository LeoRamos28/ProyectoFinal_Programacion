import Cliente from '../models/Cliente.js'; 
import { Op } from 'sequelize';

export const getClientes = async (req, res) => {
    try {
        // listar todos los clientes
        const clientes = await Cliente.findAll({
            attributes: [
                'id_cliente', 
                'nombre', 
                'apellido', 
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

// Registra  cliente
export const createCliente = async (req, res) => {
    try {
        const { 
            nombre, 
            apellido, 
            provincia, 
            localidad, 
            direccion 
        } = req.body;

        if (!nombre || !apellido || !provincia || !localidad || !direccion) {
            return res.status(400).json({ error: "Faltan campos obligatorios del cliente." });
        }
        
        
        const nuevoCliente = await Cliente.create({
            nombre,
            apellido,
            provincia,
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
