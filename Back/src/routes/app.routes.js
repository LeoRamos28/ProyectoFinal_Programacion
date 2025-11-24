import express from "express";
import { verificarToken, soloMaster, masterOrAtencion, masterOrTecnico, masterTecnicoAtencion } from "../middlewares/auth.js";

// Importa TODOS los controladores de clientes
import {
  getClientes,
  createCliente,
  buscarClientes,
  deleteCliente,
  updateCliente
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
  eliminarItem
} from "../controllers/inventarioController.js";

const router = express.Router();

// ------- Rutas clientes -------
router.get("/clientes", verificarToken, masterOrAtencion, getClientes);
router.get("/clientes/buscar", verificarToken, masterOrAtencion, buscarClientes);
router.post("/clientes", verificarToken, masterOrAtencion, createCliente);
router.put("/clientes/:id", verificarToken, masterOrAtencion, updateCliente);
router.delete("/clientes/:id", verificarToken, masterOrAtencion, deleteCliente);

// ------- Rutas ordenes -------
router.get("/ordenes", verificarToken, masterTecnicoAtencion, getOrdenes);
router.get("/ordenes/carga-trabajo", verificarToken, masterOrAtencion, getTecnicosCarga); 
router.get("/ordenes/tecnico", verificarToken, masterOrTecnico, getOrdenesTecnico);
router.post("/ordenes", verificarToken, masterOrAtencion, createOrden);
router.patch("/ordenes/:id", verificarToken, masterOrTecnico, updateEstadoOrden);

// ------- Rutas usuarios -------
router.get("/usuarios", verificarToken, getUsuarios);
router.post("/usuarios", verificarToken, soloMaster, createUsuario);
router.put("/usuarios/:id", verificarToken, soloMaster, updateUsuario);
router.delete("/usuarios/:id", verificarToken, soloMaster, deleteUsuario);

router.post("/usuarios/login", login);
router.post("/usuarios/register", registrar);

// ------- Rutas inventario -------

router.get("/inventario", verificarToken, masterTecnicoAtencion, getInventario);
router.post("/inventario", verificarToken, masterOrAtencion, crearItem);
router.put("/inventario/:id", verificarToken, masterOrAtencion, actualizarItem);
router.delete("/inventario/:id", verificarToken, soloMaster, eliminarItem); // Quizás borrar solo lo deba hacer el Master

export default router;
