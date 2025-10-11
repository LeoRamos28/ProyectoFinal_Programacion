import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function verificarToken(req, res, next) {
    // 1. Obtener el token del header Authorization: Bearer <token>
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Token requerido" });

    try {
        // 2. Verificar el token y decodificar el payload
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // 3. Almacenar el payload decodificado (id, email, id_rol) en req.usuario
        req.usuario = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

// Middleware opcional: solo master
export function soloMaster(req, res, next) {
    // ⚠️ CRÍTICO: Revisamos el ID numérico del rol, que debe ser 1 (Master)
    if (req.usuario && req.usuario.id_rol === 1) {
        next();
    } else {
        // Devolvemos 403 Forbidden
        return res.status(403).json({ error: "Acceso solo para master" });
    }
}
