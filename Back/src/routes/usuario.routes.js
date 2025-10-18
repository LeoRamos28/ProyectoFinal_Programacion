import express from "express";
import { 
    getUsuarios, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario, 
    login,
    registrar
} from "../controllers/usuarioController.js";
import { verificarToken, soloMaster } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verificarToken, getUsuarios);
router.post("/", verificarToken, soloMaster, createUsuario); 
router.put("/:id", verificarToken, soloMaster, updateUsuario);
router.delete("/:id", verificarToken, soloMaster, deleteUsuario); 


router.post("/login", login); 
router.post("/register", registrar);      

export default router;


