import { Router } from "express";
import chatController from "./chat.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  validate,
  validateParams,
} from "../../middlewares/validate.middleware";
import {
  PostulacionIdParamDTO,
  ChatIdParamDTO,
  EnviarMensajeDTO,
} from "./chat.model";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los chats del usuario autenticado
router.get("/", chatController.obtenerChatsUsuario);

// Obtener o crear chat para una postulación
router.get(
  "/postulacion/:postulacionId",
  validateParams(PostulacionIdParamDTO),
  chatController.obtenerOCrearChat
);

// Obtener mensajes de un chat
router.get(
  "/:chatId/mensajes",
  validateParams(ChatIdParamDTO),
  chatController.obtenerMensajes
);

// Enviar mensaje (también se puede hacer via Socket.IO)
router.post(
  "/:chatId/mensajes",
  validateParams(ChatIdParamDTO),
  validate(EnviarMensajeDTO),
  chatController.enviarMensaje
);

export default router;
