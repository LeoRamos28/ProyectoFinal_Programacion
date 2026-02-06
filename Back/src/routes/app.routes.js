import express from "express";
import {
  verificarToken,
  soloMaster,
  masterOrAtencion,
  masterOrTecnico,
  masterTecnicoAtencion,
  esTecnico,
  esPersonalAtencion,
} from "../middlewares/auth.js";

import {
  getClientes,
  createCliente,
  buscarClientes,
  deleteCliente,
  updateCliente,
} from "../controllers/clienteController.js";

import {
  getOrdenes,
  createOrden,
  updateEstadoOrden,
  getTecnicosCarga,
  getOrdenesTecnico,
} from "../controllers/ordenController.js";

import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  login,
  registrar,
} from "../controllers/usuarioController.js";

import {
  getInventario,
  crearItem,
  actualizarItem,
  eliminarItem,
  getAlertasStock,
  resolverAlerta,
} from "../controllers/inventarioController.js";

import {
  getMetricasMaster,
  getMetricasTecnico,
  getMetricasAtencion,
  getClientesMasterDetalle,
  getUsuariosMasterDetalle,
  getStockBajoMasterDetalle,
  getOrdenesTecnicoDetalle,
  getReclamosTecnicoDetalle,
  getReclamosAtencionDetalle,
  getSolicitudesPendientesAtencion,
  getSolicitudesAsignadasAtencion,
  getOrdenesTotales,
} from "../controllers/metricasController.js";

import Cliente from "../models/Cliente.js";
import Usuario from "../models/Usuario.js";
import OrdenTrabajo from "../models/OrdenTrabajo.js";
import Inventario from "../models/inventario.js";
import sequelize from "../config/database.js";

const router = express.Router();

// ------- Rutas métricas -------
router.get("/dashboard/master", verificarToken, soloMaster, getMetricasMaster);
router.get(
  "/dashboard/tecnico",
  verificarToken,
  masterOrTecnico,
  getMetricasTecnico
);
router.get(
  "/dashboard/atencion",
  verificarToken,
  masterOrAtencion,
  getMetricasAtencion
);

// ------- Rutas clientes -------
router.get("/clientes", verificarToken, masterOrAtencion, getClientes);
router.get(
  "/clientes/buscar",
  verificarToken,
  masterOrAtencion,
  buscarClientes
);
router.post("/clientes", verificarToken, masterOrAtencion, createCliente);
router.put("/clientes/:id", verificarToken, masterOrAtencion, updateCliente);
router.delete("/clientes/:id", verificarToken, masterOrAtencion, deleteCliente);

// ------- Rutas ordenes -------
router.get("/ordenes", verificarToken, masterTecnicoAtencion, getOrdenes);
router.get(
  "/ordenes/carga-trabajo",
  verificarToken,
  masterOrAtencion,
  getTecnicosCarga
);
router.get(
  "/ordenes/tecnico",
  verificarToken,
  masterOrTecnico,
  getOrdenesTecnico
);
router.post("/ordenes", verificarToken, masterOrAtencion, createOrden);
router.patch(
  "/ordenes/:id",
  verificarToken,
  masterOrTecnico,
  updateEstadoOrden
);

// ------- Rutas usuarios -------
router.get("/usuarios", verificarToken, masterOrAtencion, getUsuarios);
router.post("/usuarios", verificarToken, soloMaster, createUsuario);
router.put("/usuarios/:id", verificarToken, soloMaster, updateUsuario);
router.delete("/usuarios/:id", verificarToken, soloMaster, deleteUsuario);

router.post("/usuarios/login", login);
router.post("/usuarios/register", registrar);

// ------- Rutas inventario -------
router.get("/inventario", verificarToken, masterTecnicoAtencion, getInventario);
router.post("/inventario", verificarToken, masterOrAtencion, crearItem);
router.put("/inventario/:id", verificarToken, masterOrAtencion, actualizarItem);
router.delete(
  "/inventario/:id",
  verificarToken,
  masterOrAtencion,
  eliminarItem
);
router.get("/alertas-stock", verificarToken, masterOrAtencion, getAlertasStock);
router.put(
  "/alertas-stock/:id/resolver",
  verificarToken,
  masterOrAtencion,
  resolverAlerta
);

// MASTER detalle
router.get(
  "/metricas/master/clientes",
  verificarToken,
  masterOrAtencion,
  getClientesMasterDetalle
);

router.get(
  "/metricas/master/usuarios",
  verificarToken,
  soloMaster,
  getUsuariosMasterDetalle
);

router.get(
  "/metricas/ordenes-totales",
  verificarToken,
  soloMaster,
  getOrdenesTotales
);

router.get(
  "/metricas/master/stock-bajo",
  verificarToken,
  soloMaster,
  getStockBajoMasterDetalle
);

// TÉCNICO detalle
router.get(
  "/metricas/tecnico/ordenes",
  verificarToken,
  esTecnico,
  getOrdenesTecnicoDetalle
);

router.get(
  "/metricas/tecnico/reclamos",
  verificarToken,
  esTecnico,
  getReclamosTecnicoDetalle
);

router.get(
  "/metricas/atencion/reclamos",
  verificarToken,
  esPersonalAtencion,
  getReclamosAtencionDetalle
);

router.get(
  "/metricas/atencion/solicitudes-pendientes",
  verificarToken,
  esPersonalAtencion,
  getSolicitudesPendientesAtencion
);

router.get(
  "/metricas/atencion/solicitudes-asignadas",
  verificarToken,
  esPersonalAtencion,
  getSolicitudesAsignadasAtencion
);


export default router;
