import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDTO, LoginDTO } from "./auth.model";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: RegisterDTO = req.body;

      // Validaciones básicas
      if (!data.email || !data.password || !data.role) {
        res.status(400).json({
          success: false,
          message: "Email, contraseña y rol son requeridos",
          error: "VALIDATION_ERROR",
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        res.status(400).json({
          success: false,
          message: "Formato de email inválido",
          error: "VALIDATION_ERROR",
        });
        return;
      }

      // Validar longitud de contraseña
      if (data.password.length < 6) {
        res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
          error: "VALIDATION_ERROR",
        });
        return;
      }

      const result = await this.authService.register(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al registrar usuario",
        error: error.message,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginDTO = req.body;

      // Validaciones básicas
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email y contraseña son requeridos",
          error: "VALIDATION_ERROR",
        });
        return;
      }

      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Credenciales inválidas") {
        res.status(401).json({
          success: false,
          message: error.message,
          error: "INVALID_CREDENTIALS",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error al iniciar sesión",
        error: error.message,
      });
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      // El userId viene del middleware de autenticación
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "No autorizado",
          error: "UNAUTHORIZED",
        });
        return;
      }

      const user = await this.authService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: "Usuario obtenido exitosamente",
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error al obtener usuario",
        error: error.message,
      });
    }
  };
}
