import Cliente from "../models/Cliente.js";
import OrdenTrabajo from "../models/OrdenTrabajo.js";
import Inventario from "../models/inventario.js";
import Usuario from "../models/Usuario.js";
import sequelize from "../config/database.js";

// ================== MÉTRICAS  ==================
// MASTER (rol 1)
export const getMetricasMaster = async (req, res) => {
  try {
    const totalClientes = await Cliente.count();
    const totalUsuarios = await Usuario.count();

    const ordenesPorEstado = await OrdenTrabajo.findAll({
      attributes: [
        "estado",
        [sequelize.fn("COUNT", sequelize.col("id_orden")), "cantidad"],
      ],
      group: ["estado"],
    });

    const reclamosAbiertos = await OrdenTrabajo.count({
      where: { tipo: "reclamo", estado: "pendiente" },
    });

    const stockBajo = await Inventario.count({
      where: sequelize.where(
        sequelize.col("stock_actual"),
        "<",
        sequelize.col("stock_minimo")
      ),
    });

    const instalacionesPendientes = await OrdenTrabajo.count({
      where: { tipo: "instalacion", estado: "pendiente" },
    });

    res.json({
      totalClientes,
      totalUsuarios,
      ordenesPorEstado,
      reclamosAbiertos,
      stockBajo,
      instalacionesPendientes,
    });
  } catch (error) {
    console.error("Error métricas master:", error);
    res.status(500).json({ error: "Error al obtener métricas master." });
  }
};

// TÉCNICO (rol 2)
export const getMetricasTecnico = async (req, res) => {
  try {
    const idTecnico = req.usuario.id;

    const ordenesPorEstado = await OrdenTrabajo.findAll({
      attributes: [
        "estado",
        [sequelize.fn("COUNT", sequelize.col("id_orden")), "cantidad"],
      ],
      where: {
        id_tecnico_asignado: idTecnico,
      },
      group: ["estado"],
    });

    const reclamosPendientes = await OrdenTrabajo.count({
      where: {
        id_tecnico_asignado: idTecnico,
        tipo: "reclamo",
        estado: "pendiente",
      },
    });

    const instalacionesPendientes = await OrdenTrabajo.count({
      where: {
        id_tecnico_asignado: idTecnico,
        tipo: "instalacion",
        estado: "pendiente",
      },
    });

    const ordenesPendientes = await OrdenTrabajo.count({
      where: {
        id_tecnico_asignado: idTecnico,
        estado: "pendiente",
      },
    });

    res.json({
      ordenesPorEstado,
      ordenesPendientes,
      reclamosPendientes,
      instalacionesPendientes,
    });
  } catch (error) {
    console.error("Error métricas técnico:", error);
    res.status(500).json({ error: "Error al obtener métricas técnico." });
  }
};

// ATENCIÓN (rol 3)
export const getMetricasAtencion = async (req, res) => {
  try {
    const totalClientes = await Cliente.count();

    const reclamosAbiertos = await OrdenTrabajo.count({
      where: { tipo: "reclamo", estado: "pendiente" },
    });

    const nuevasSolicitudes = await OrdenTrabajo.count({
      where: { tipo: "instalacion", estado: "pendiente" },
    });

    res.json({
      totalClientes,
      reclamosAbiertos,
      nuevasSolicitudes,
    });
  } catch (error) {
    console.error("Error métricas atención:", error);
    res.status(500).json({ error: "Error al obtener métricas atención." });
  }
};

// ================== DETALLES MASTER ==================
export const getClientesMasterDetalle = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    console.error("Error detalle clientes master:", error);
    res.status(500).json({ error: "Error al obtener clientes." });
  }
};
export const getUsuariosMasterDetalle = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });
    res.json(usuarios);
  } catch (error) {
    console.error("Error detalle usuarios master:", error);
    res.status(500).json({ error: "Error al obtener usuarios." });
  }
};

export const getOrdenesTotales = async (req, res) => {
  try {
    const ordenes = await OrdenTrabajo.findAll({
      include: [
        {
          model: Cliente,
          as: "cliente",
        },
        {
          model: Usuario,
          as: "tecnico",
          attributes: ["nombre", "apellido"],
        },
      ],
      order: [["fecha_creacion", "ASC"]],
    });

    res.json(ordenes);
  } catch (error) {
    console.error("Error cargando todas las órdenes:", error);
    res.status(500).json({ error: "Error al obtener todas las órdenes" });
  }
};

export const getOrdenesAbiertasMasterDetalle = async (req, res) => {
  try {
    const ordenes = await OrdenTrabajo.findAll({
      where: { tipo: "instalacion", estado: "pendiente" },
      include: [
        { model: Cliente, as: "cliente", attributes: ["nombre", "apellido"] },
      ],
    });
    res.json(ordenes);
  } catch (error) {
    console.error("Error detalle órdenes abiertas master:", error);
    res.status(500).json({ error: "Error al obtener órdenes abiertas." });
  }
};

export const getReclamosAbiertosMasterDetalle = async (req, res) => {
  try {
    const reclamos = await OrdenTrabajo.findAll({
      where: { tipo: "reclamo", estado: "pendiente" },
      include: [
        { model: Cliente, as: "cliente", attributes: ["nombre", "apellido"] },
      ],
    });
    res.json(reclamos);
  } catch (error) {
    console.error("Error detalle reclamos abiertos master:", error);
    res.status(500).json({ error: "Error al obtener reclamos abiertos." });
  }
};

export const getStockBajoMasterDetalle = async (req, res) => {
  try {
    const items = await Inventario.findAll({
      where: sequelize.where(
        sequelize.col("stock_actual"),
        "<",
        sequelize.col("stock_minimo")
      ),
    });
    res.json(items);
  } catch (error) {
    console.error("Error detalle stock bajo master:", error);
    res.status(500).json({ error: "Error al obtener stock bajo." });
  }
};

// ================== DETALLES TÉCNICO ==================
export const getOrdenesTecnicoDetalle = async (req, res) => {
  try {
    const idTecnico = req.usuario.id;
    const ordenes = await OrdenTrabajo.findAll({
      where: { id_tecnico_asignado: idTecnico },
    });
    res.json(ordenes);
  } catch (error) {
    console.error("Error detalle órdenes técnico:", error);
    res.status(500).json({ error: "Error al obtener órdenes del técnico." });
  }
};

export const getReclamosTecnicoDetalle = async (req, res) => {
  try {
    const idTecnico = req.usuario.id;
    const reclamos = await OrdenTrabajo.findAll({
      where: {
        id_tecnico_asignado: idTecnico,
        tipo: "reclamo",
        estado: "pendiente",
      },
    });
    res.json(reclamos);
  } catch (error) {
    console.error("Error detalle reclamos técnico:", error);
    res.status(500).json({ error: "Error al obtener reclamos del técnico." });
  }
};

// ================== DETALLES ATENCIÓN ==================
export const getReclamosAtencionDetalle = async (req, res) => {
  try {
    const reclamos = await OrdenTrabajo.findAll({
      where: { tipo: "reclamo", estado: "pendiente" },
      include: [
        { model: Cliente, as: "cliente", attributes: ["nombre", "apellido"] },
      ],
    });
    res.json(reclamos);
  } catch (error) {
    console.error("Error detalle reclamos atención:", error);
    res.status(500).json({ error: "Error al obtener reclamos de atención." });
  }
};

export const getSolicitudesPendientesAtencion = async (req, res) => {
  try {
    const solicitudes = await OrdenTrabajo.findAll({
      where: { tipo: "instalacion", estado: "pendiente" },
      include: [
        { model: Cliente, as: "cliente", attributes: ["nombre", "apellido"] },
      ],
    });
    res.json(solicitudes);
  } catch (error) {
    console.error("Error detalle solicitudes pendientes atención:", error);
    res.status(500).json({ error: "Error al obtener solicitudes pendientes." });
  }
};

export const getSolicitudesAsignadasAtencion = async (req, res) => {
  try {
    const solicitudes = await OrdenTrabajo.findAll({
      where: { tipo: "instalacion", estado: "asignada" },
      include: [
        { model: Cliente, as: "cliente", attributes: ["nombre", "apellido"] },
      ],
    });
    res.json(solicitudes);
  } catch (error) {
    console.error("Error detalle solicitudes asignadas atención:", error);
    res.status(500).json({ error: "Error al obtener solicitudes asignadas." });
  }
};
