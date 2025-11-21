import jwt from "jsonwebtoken";
import config from "../config/config.js";

/**
 * Middleware de Autenticación: Verifica y decodifica el token JWT.
 * Almacena el payload (id, email, id_rol) en req.usuario.
 */
export function verificarToken(req, res, next) {
    // 1. Obtener el token del header Authorization: Bearer <token>
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Token requerido" });

    try {
        // 2. Verificar el token y decodificar el payload
        const decoded = jwt.verify(token, config.jwt.secret);
        console.log('Payload recibido:', decoded); // Debe mostrar id_rol: 1

        // 3. Almacenar el payload decodificado (id, email, id_rol) en req.usuario
        req.usuario = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}


// -------------------------------------------------------------
// MIDDLEWARES DE AUTORIZACIÓN (SOLO ROL ESPECÍFICO)
// -------------------------------------------------------------

/**
 * Middleware de Autorización: Permite el acceso solo al rol Master (id_rol = 1).
 */
export function soloMaster(req, res, next) {
    // Revisa el ID numérico del rol (1)
    if (req.usuario && req.usuario.id_rol === 1) {
        next();
    } else {
        return res.status(403).json({ error: "Acceso solo para Master (id_rol = 1)." });
    }
}

/**
 * Middleware de Autorización: Permite el acceso solo al Personal de Atención (id_rol = 3).
 * Este es el middleware que faltaba y causaba el error.
 */
export function esPersonalAtencion(req, res, next) {
    // Revisa el ID numérico del rol (3)
    if (req.usuario && req.usuario.id_rol === 3) {
        next();
    } else {
        return res.status(403).json({ error: "Acceso solo para Personal de Atención (id_rol = 3)." });
    }
}

/**
 * Middleware de Autorización: Permite el acceso solo al Técnico (id_rol = 2).
 */
export function esTecnico(req, res, next) {
    // Revisa el ID numérico del rol (2)
    if (req.usuario && req.usuario.id_rol === 2) {
        next();
    } else {
        return res.status(403).json({ error: "Acceso solo para Técnico (id_rol = 2)." });
    }
}

// Funciones nuevas para aplicar restricciones segun rol
export function masterOrAtencion(req, res, next) {
  if (req.usuario && (req.usuario.id_rol === 1 || req.usuario.id_rol === 3)) {
    return next();
  }
  return res.status(403).json({ error: "Acceso solo para Master o Atención." });
}

export function masterOrTecnico(req, res, next) {
  if (req.usuario && (req.usuario.id_rol === 1 || req.usuario.id_rol === 2)) {
    return next();
  }
  return res.status(403).json({ error: "Acceso solo para Master o Técnico." });
}

export function masterTecnicoAtencion(req, res, next) {
  if (req.usuario && [1, 2, 3].includes(req.usuario.id_rol)) {
    return next();
  }
  return res.status(403).json({ error: "Acceso solo para Master, Técnico o Atención." });
}