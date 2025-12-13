import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);

// Rutas protegidas
router.get("/me", authMiddleware, authController.me);

export default router;
