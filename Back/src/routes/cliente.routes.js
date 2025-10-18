import express from "express";
import { verificarToken } from "../middlewares/auth.js";
import { getClientes, createCliente } from "../controllers/clienteController.js";

const router = express.Router();

router.get("/", verificarToken, getClientes);
router.post("/", verificarToken, createCliente);

export default router;
