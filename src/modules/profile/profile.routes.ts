import { Router } from "express";
import { profileController } from "./profile.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/v1/profile - Obtener perfil del usuario autenticado
router.get("/", profileController.getProfile);

// PUT /api/v1/profile - Actualizar perfil
router.put("/", profileController.updateProfile);

export default router;
