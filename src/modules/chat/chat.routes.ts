import { Router } from "express";
import chatController from "./chat.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los chats del usuario autenticado
router.get("/", chatController.obtenerChatsUsuario);

// Obtener o crear chat para una postulación
router.get("/postulacion/:postulacionId", chatController.obtenerOCrearChat);

// Obtener mensajes de un chat
router.get("/:chatId/mensajes", chatController.obtenerMensajes);

// Enviar mensaje (también se puede hacer via Socket.IO)
router.post("/:chatId/mensajes", chatController.enviarMensaje);

export default router;
