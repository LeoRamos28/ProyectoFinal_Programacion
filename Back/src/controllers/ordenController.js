import OrdenTrabajo from '../models/OrdenTrabajo.js'; 
import Usuario from '../models/Usuario.js'; 
import Cliente from '../models/Cliente.js'; 
import { Op } from 'sequelize';

const ID_ROL_ADMIN = 1; 
const ESTADOS_PENDIENTES = ['asignada', 'en_proceso'];


export const getOrdenes = async (req, res) => {
    try {
        const { id_usuario_atencion } = req.query;

        const whereClause = {};
        if (id_usuario_atencion) {
            whereClause.id_usuario_atencion = id_usuario_atencion;
        }

        const ordenesRaw = await OrdenTrabajo.findAll({
            where: whereClause,
            include: [
                {
                    model: Cliente,
                    as: 'cliente', 
                    attributes: ['nombre', 'apellido']
                },
                {
                    model: Usuario,
                    as: 'tecnico',
                    attributes: ['nombre', 'apellido']
                }
            ],
            order: [['fecha_creacion', 'DESC']]
        });

        const ordenes = ordenesRaw.map(o => ({
            ...o.toJSON(),
            cliente_nombre: o.cliente?.nombre || '',
            cliente_apellido: o.cliente?.apellido || '',
            tecnico_nombre: o.tecnico ? `${o.tecnico.nombre} ${o.tecnico.apellido}` : null
        }));

        res.json(ordenes);

    } catch (error) {
        console.error('Error al listar órdenes:', error);
        res.status(500).json({ error: 'Fallo interno al listar órdenes.' });
    }
};


export const getOrdenesTecnico = async (req, res) => {
        try {
            const id_usuario_logueado = req.usuario.id;
            const id_rol_logueado = req.usuario.id_rol; 
    
            let whereClause = {};
    
            // Logica para el Master/Admin (ver todo) vs Tecnico (ver solo lo suyo)
            if (id_rol_logueado !== ID_ROL_ADMIN) {
                // Si NO es Admin, filtra estrictamente por el ID del técnico.
                whereClause.id_tecnico_asignado = id_usuario_logueado;
            }
            // El filtro de estado se aplica para ambos (Admin solo quiere ver las activas)
            whereClause.estado = {
                [Op.in]: ESTADOS_PENDIENTES
            };
            
            const ordenesRaw = await OrdenTrabajo.findAll({
                where: whereClause, 
                include: [ 
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['nombre', 'apellido']
                    },
                   
                    {
                        model: Usuario,
                        as: 'tecnico',
                        attributes: ['nombre', 'apellido']
                    }
                ],
                order: [['fecha_asignacion', 'ASC']]
            });
            
            const ordenes = ordenesRaw.map(o => ({
                ...o.toJSON(),
                cliente_nombre: o.cliente?.nombre || '',
                cliente_apellido: o.cliente?.apellido || '',
            }));
    
            res.json(ordenes);
    
        } catch (error) {
            console.error('Error al listar órdenes del técnico/master:', error);
            res.status(500).json({ error: 'Fallo interno al listar órdenes del técnico.' });
        }
    };
    

// 2. Obtener la carga de trabajo de los técnicos (GET /api/ordenes/carga-trabajo)
export const getTecnicosCarga = async (req, res) => {
    try {
        // Primero, obtener todos los usuarios que son técnicos (id_rol = 2)
        const tecnicos = await Usuario.findAll({
            where: { id_rol: 2, estado: true }, // Solo técnicos activos
            attributes: ['id_usuario', 'nombre', 'apellido', 'email'],
            raw: true
        });

        // ordenes pendientes para cada tecnico
        const tecnicosConCarga = await Promise.all(tecnicos.map(async (tecnico) => {
            const conteo = await OrdenTrabajo.count({
                where: {
                    id_tecnico_asignado: tecnico.id_usuario,
                    estado: {
                        [Op.in]: ESTADOS_PENDIENTES
                    }
                }
            });
            // Añadir el conteo al objeto técnico
            return {
                ...tecnico,
                ordenes_pendientes: conteo 
            };
        }));

        res.json(tecnicosConCarga);

    } catch (error) {
        console.error('Error al obtener carga de técnicos:', error);
        res.status(500).json({ error: 'Fallo interno al obtener la carga de trabajo.' });
    }
};

export const createOrden = async (req, res) => {
    try {
        const {
            id_cliente,
            id_tecnico_asignado,
            tipo, 
            descripcion,
            direccion_trabajo,
            fecha_asignacion 

        } = req.body;

        const id_usuario_atencion = req.usuario.id; 

        // campos obligatorios
        if (!id_cliente || !tipo || !descripcion || !direccion_trabajo || !id_usuario_atencion) {
             return res.status(400).json({ error: "Faltan datos de la orden o el usuario logueado." });
        }
        
                // Si se asigna un técnico, verifica su carga antes de crear la orden
        if (id_tecnico_asignado) {
            const ordenesAsignadas = await OrdenTrabajo.count({
                where: {
                    id_tecnico_asignado: id_tecnico_asignado,
                    estado: { [Op.in]: ['pendiente', 'asignada'] } // ajusta los estados si usas diferentes
                }
            });
            if (ordenesAsignadas >= 10) {
                return res.status(400).json({ error: "El técnico ya tiene la carga máxima de órdenes pendientes/asignadas." });
            }
        }

        // Determinar el estado inicial: 'pendiente' si no se asigna técnico, 'asignada' si se asigna.
        const estadoInicial = id_tecnico_asignado ? 'asignada' : 'pendiente';

        const nuevaOrden = await OrdenTrabajo.create({
            id_cliente,
            id_usuario_atencion,
            id_tecnico_asignado: id_tecnico_asignado || null, 
            tipo,
            descripcion,
            direccion_trabajo,
            estado: estadoInicial,
            fecha_asignacion: fecha_asignacion || null 


            
        });

        res.status(201).json({ 
            mensaje: "Orden creada exitosamente.", 
            orden: nuevaOrden 
        });

    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({ error: 'Fallo interno al crear la orden.' });
    }
};


// Actualizar estado de orden 
export const updateEstadoOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, solucion_reclamo } = req.body;
        const id_tecnico_logueado = req.usuario.id; 

        let estadoNormalizado = estado === 'completada' ? 'finalizada' : estado;

        const ESTADOS_PERMITIDOS = ['en_proceso', 'finalizada', 'cancelada']; 
        if (!estadoNormalizado || !ESTADOS_PERMITIDOS.includes(estadoNormalizado)) {
            return res.status(400).json({ 
                error: "Estado no válido o no proporcionado. Debe ser: en_proceso, finalizada o cancelada." 
            });
        }

        const datosAActualizar = { estado: estadoNormalizado };

        if (estadoNormalizado === 'finalizada') {
            if (!solucion_reclamo || solucion_reclamo.length < 5) {
                return res.status(400).json({ 
                    error: "La solución del reclamo es obligatoria para finalizar la orden." 
                });
            }
            datosAActualizar.solucion_reclamo = solucion_reclamo;
            datosAActualizar.fecha_finalizacion = new Date();
        }        
        const [filasActualizadas] = await OrdenTrabajo.update(
            datosAActualizar,
            { 
                where: { 
                    id_orden: id,
                    id_tecnico_asignado: id_tecnico_logueado 
                } 
            }
        );

        if (filasActualizadas === 0) {
            return res.status(403).json({ 
                error: "Acceso denegado. La orden no existe o no está asignada a tu usuario." 
            });
        }
        
        res.json({ mensaje: "Estado de orden actualizado exitosamente." });

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Fallo interno al actualizar el estado de la orden.' });
    }
};
