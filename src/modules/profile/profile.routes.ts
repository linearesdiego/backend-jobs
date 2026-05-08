import { Router } from "express";
import { profileController } from "./profile.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import upload, { uploadProfileImage } from "../../middlewares/upload.middleware";

const router = Router();

// ==================== RUTAS PÚBLICAS ====================

// GET /api/v1/profile/proveedores - Obtener lista de proveedores activos
router.get("/providers", profileController.getProviders);

// GET /api/v1/profile/proveedores/:id - Obtener proveedor por ID
router.get("/proveedores/:id", profileController.getProviderById);

// GET /api/v1/profile/categorias - Obtener categorías disponibles
router.get("/categorias", profileController.getCategories);

// ==================== RUTAS AUTENTICADAS ====================

// Todas las rutas siguientes requieren autenticación
router.use(authMiddleware);

// GET /api/v1/profile - Obtener perfil del usuario autenticado
router.get("/", profileController.getProfile);

// GET /api/v1/profile/providers/:username - Obtener proveedor por username
router.get("/providers/:username", profileController.getProviderByUsername);

// PUT /api/v1/profile - Actualizar perfil
router.put("/", profileController.updateProfile);

// PUT /api/v1/profile/image - Subir/actualizar imagen de perfil
router.put(
  "/image",
  uploadProfileImage.single("image"),
  profileController.updateProfileImage
);

// DELETE /api/v1/profile/image - Eliminar imagen de perfil
router.delete("/image", profileController.deleteProfileImage);

// ==================== RUTAS DE POSTULACIÓN (PROVEEDOR) ====================

// PUT /api/v1/profile/proveedor/postulacion - Actualizar datos de postulación
router.put("/proveedor/postulacion", profileController.updateApplication);

// PUT /api/v1/profile/proveedor/postulacion/video - Subir/actualizar video
router.put(
  "/proveedor/postulacion/video",
  upload.single("videoUrl"),
  profileController.updateApplicationVideo
);

// DELETE /api/v1/profile/proveedor/postulacion/video - Eliminar video
router.delete(
  "/proveedor/postulacion/video",
  profileController.deleteApplicationVideo
);

// PATCH /api/v1/profile/proveedor/postulacion/estado - Cambiar estado
router.patch(
  "/proveedor/postulacion/estado",
  profileController.changeApplicationStatus
);

export default router;
