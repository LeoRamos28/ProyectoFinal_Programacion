import OrdenTrabajo from '../models/OrdenTrabajo.js'; 
import Usuario from '../models/Usuario.js'; 
import Cliente from '../models/Cliente.js'; 
import { Op } from 'sequelize';
import db from '../config/database.js'; //Imports para el inventario del terrrrnico
import { QueryTypes } from 'sequelize';

const ID_ROL_ADMIN = 1; 
const ESTADOS_PENDIENTES = ['asignada', 'en_proceso'];



/**
 * @swagger
 * /api/ordenes:
 *   get:
 *     summary: Listar todas las órdenes (filtrado por usuario de atención)
 *     tags: [Órdenes de Trabajo]
 *     parameters:
 *       - in: query
 *         name: id_usuario_atencion
 *         schema:
 *           type: integer
 *         description: Filtrar órdenes por usuario de atención
 *     responses:
 *       200:
 *         description: Lista de órdenes con clientes y técnicos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       500:
 *         description: Fallo interno al listar órdenes
 *     security:
 *       - bearerAuth: []
 */
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


/**
 * @swagger
 * /api/ordenes/tecnico:
 *   get:
 *     summary: Órdenes asignadas al técnico logueado (o todas para Admin)
 *     tags: [Órdenes de Trabajo]
 *     responses:
 *       200:
 *         description: Órdenes pendientes del técnico logueado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       500:
 *         description: Fallo interno al listar órdenes del técnico
 *     security:
 *       - bearerAuth: []
 */

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

/**
 * @swagger
 * /api/ordenes/carga-trabajo:
 *   get:
 *     summary: Carga de trabajo de todos los técnicos activos
 *     tags: [Órdenes de Trabajo]
 *     responses:
 *       200:
 *         description: Lista de técnicos con cantidad de órdenes pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       500:
 *         description: Fallo interno al obtener carga de trabajo
 *     security:
 *       - bearerAuth: []
 */

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

/**
 * @swagger
 * /api/ordenes:
 *   post:
 *     summary: Crear nueva orden de trabajo
 *     tags: [Órdenes de Trabajo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_cliente
 *               - tipo
 *               - descripcion
 *               - direccion_trabajo
 *             properties:
 *               id_cliente:
 *                 type: integer
 *                 example: 1
 *               id_tecnico_asignado:
 *                 type: integer
 *                 example: 2
 *               tipo:
 *                 type: string
 *                 example: "Instalación"
 *               descripcion:
 *                 type: string
 *                 example: "Nueva instalación"
 *               direccion_trabajo:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *               fecha_asignacion:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 orden:
 *       400:
 *         description: Faltan datos obligatorios o técnico con carga máxima
 *       500:
 *         description: Fallo interno al crear orden
 *     security:
 *       - bearerAuth: []
 */

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

/**
 * @swagger
 * /api/ordenes/{id}:
 *   patch:
 *     summary: Actualizar estado de orden (solo técnico asignado)
 *     tags: [Órdenes de Trabajo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: ["en_proceso", "finalizada", "cancelada"]
 *               solucion_reclamo:
 *                 type: string
 *                 example: "Reclamo resuelto instalando nuevo router"
 *               materiales:
 *                 type: array
 *                 items:
 *     responses:
 *       200:
 *         description: Estado actualizado y stock descontado exitosamente
 *       400:
 *         description: Estado inválido o datos faltantes
 *       403:
 *         description: Acceso denegado (no es el técnico asignado)
 *       500:
 *         description: Fallo interno al actualizar estado
 *     security:
 *       - bearerAuth: []
 */
export const updateEstadoOrden = async (req, res) => {
    try {
        const { id } = req.params;
        // Agregamos 'materiales' al destructuring del body
        const { estado, solucion_reclamo, materiales } = req.body;
        const id_tecnico_logueado = req.usuario.id; 

        let estadoNormalizado = estado === 'completada' ? 'finalizada' : estado;

        const ESTADOS_PERMITIDOS = ['en_proceso', 'finalizada', 'cancelada']; 
        if (!estadoNormalizado || !ESTADOS_PERMITIDOS.includes(estadoNormalizado)) {
            return res.status(400).json({ 
                error: "Estado no válido o no proporcionado. Debe ser: en_proceso, finalizada o cancelada." 
            });
        }

        const datosAActualizar = { estado: estadoNormalizado };

        //Estados
        if (estadoNormalizado === 'finalizada') {
            
            // 1. Validación de Solución
            if (!solucion_reclamo || solucion_reclamo.length < 5) {
                return res.status(400).json({ 
                    error: "La solución del reclamo es obligatoria para finalizar la orden." 
                });
            }
            datosAActualizar.solucion_reclamo = solucion_reclamo;
            datosAActualizar.fecha_finalizacion = new Date(); // Usamos fecha actual de JS, Sequelize la formatea

            // Solo procesamos si hay materiales y si el estado es finalizada
            if (materiales && materiales.length > 0) {
                try {
                    for (const item of materiales) {
                        // A) Insertar en materiales_usados
                        await db.query(
                            `INSERT INTO materiales_usados (id_orden, id_producto, cantidad_usada, fecha_registro) 
                             VALUES (?, ?, ?, NOW())`,
                            { 
                                replacements: [id, item.id_producto, item.cantidad_usada],
                                type: QueryTypes.INSERT
                            }
                        );

                        // B) Descontar del inventario
                        await db.query(
                            `UPDATE inventario SET stock_actual = stock_actual - ? WHERE id_producto = ?`,
                            { 
                                replacements: [item.cantidad_usada, item.id_producto],
                                type: QueryTypes.UPDATE
                            }
                        );
                    }
                } catch (invError) {
                    console.error("Error al procesar inventario:", invError);
                    // Opcional: Podrías hacer return res.status(500)... si quieres que falle todo si falla el stock
                }
            }
        }       
        
        // --- Actualización de la oredn por Squelize
        const [filasActualizadas] = await OrdenTrabajo.update(
            datosAActualizar,
            { 
                where: { 
                    id_orden: id,
                    // Solo el técnico asignado puede cambiar su orden
                    id_tecnico_asignado: id_tecnico_logueado 
                } 
            }
        );

        if (filasActualizadas === 0) {
            return res.status(403).json({ 
                error: "Acceso denegado. La orden no existe o no está asignada a tu usuario." 
            });
        }
        
        res.json({ mensaje: "Estado de orden actualizado exitosamente y stock descontado." });

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Fallo interno al actualizar el estado de la orden.' });
    }
};