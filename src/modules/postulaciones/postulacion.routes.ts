import { Router } from "express";
import postulacionController from "./postulacion.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Rutas públicas
router.get("/", postulacionController.obtenerPostulaciones);
router.get("/categorias", postulacionController.obtenerCategorias);

// Rutas protegidas (requieren autenticación)
// IMPORTANTE: Esta ruta debe ir antes de /:id para evitar conflictos
router.get(
  "/mis-postulaciones",
  authMiddleware,
  postulacionController.obtenerMisPostulaciones
);

router.post("/", authMiddleware, postulacionController.crearPostulacion);

router.put("/:id", authMiddleware, postulacionController.actualizarPostulacion);

router.delete(
  "/:id",
  authMiddleware,
  postulacionController.eliminarPostulacion
);

router.patch(
  "/:id/estado",
  authMiddleware,
  postulacionController.cambiarEstado
);

// Esta ruta va al final para no interferir con otras rutas
router.get("/:id", postulacionController.obtenerPostulacionPorId);

export default router;
