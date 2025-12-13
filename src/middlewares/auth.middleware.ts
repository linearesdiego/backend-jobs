import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../modules/auth/auth.model";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Token no proporcionado",
        error: "NO_TOKEN",
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar el token
    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Agregar la información del usuario a la request
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expirado",
        error: "TOKEN_EXPIRED",
      });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Token inválido",
        error: "INVALID_TOKEN",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al verificar token",
      error: error.message,
    });
  }
};

// Middleware para verificar roles específicos
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user as JWTPayload;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "No autorizado",
          error: "UNAUTHORIZED",
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "No tienes permisos para acceder a este recurso",
          error: "FORBIDDEN",
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
        error: error.message,
      });
    }
  };
};
