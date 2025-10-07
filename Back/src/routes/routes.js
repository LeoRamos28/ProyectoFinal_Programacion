import express from "express";
import { registrar, login, listar, eliminarUsuario } from "../controllers/usuarioController.js";
import { verificarToken, soloMaster } from "../middlewares/auth.js";

const router = express.Router();

// Rutas de usuarios
router.post("/register", registrar);        // registra usuario
router.post("/login", login);              // login
router.get("/", verificarToken, listar);    // listar usuarios (protegida)
router.delete("/:id", verificarToken, soloMaster, eliminarUsuario); // eliminar solo master

export default router;