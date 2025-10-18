import express from "express";
import { verificarToken } from "../middlewares/auth.js";

import { 
  getOrdenes, 
  createOrden, 
  updateEstadoOrden, 
  getTecnicosCarga,
  getOrdenesTecnico 
} from "../controllers/ordenController.js";

const router = express.Router();

router.get("/carga-trabajo", verificarToken, getTecnicosCarga);
router.get("/tecnico", verificarToken, getOrdenesTecnico); 
router.get("/", verificarToken, getOrdenes);
router.post("/", verificarToken, createOrden);
router.patch("/:id", verificarToken, updateEstadoOrden);


export default router;