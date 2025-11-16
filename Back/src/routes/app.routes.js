import express from "express";
import { verificarToken, soloMaster } from "../middlewares/auth.js";

import {
  getClientes,
  createCliente,
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

const router = express.Router();

// Rutas clientes
router.get("/clientes", verificarToken, getClientes);
router.post("/clientes", verificarToken, createCliente);

// Rutas ordenes
router.get("/ordenes/carga-trabajo", verificarToken, getTecnicosCarga);
router.get("/ordenes/tecnico", verificarToken, getOrdenesTecnico);
router.get("/ordenes", verificarToken, getOrdenes);
router.post("/ordenes", verificarToken, createOrden);
router.patch("/ordenes/:id", verificarToken, updateEstadoOrden);

// Rutas usuarios
router.get("/usuarios", verificarToken, getUsuarios);
router.post("/usuarios", verificarToken, soloMaster, createUsuario);
router.put("/usuarios/:id", verificarToken, soloMaster, updateUsuario);
router.delete("/usuarios/:id", verificarToken, soloMaster, deleteUsuario);

router.post("/usuarios/login", login);
router.post("/usuarios/register", registrar);

export default router;
