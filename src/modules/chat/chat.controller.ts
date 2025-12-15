import { Request, Response, NextFunction } from "express";

// Extiende la interfaz Request para incluir la propiedad 'user'
interface AuthenticatedRequest extends Request {
    user?: { id: string };
}
import chatService from "./chat.service";
import { getIO } from "../../index";

class ChatController {
    // Obtener o crear chat para una postulación
    async obtenerOCrearChat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { postulacionId } = req.params;
            const usuarioId = req.user!.id;

            const chat = await chatService.obtenerOCrearChat(
                postulacionId,
                usuarioId
            );

            res.status(200).json({
                success: true,
                data: chat,
            });
        } catch (error) {
            next(error);
        }
    }

    // Enviar mensaje (HTTP)
    async enviarMensaje(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { chatId } = req.params;
            const { texto, urlAdjunto, tipoAdjunto } = req.body;
            const remitenteId = req.user!.id;

            const mensaje = await chatService.enviarMensaje({
                chatId,
                remitenteId,
                texto,
                urlAdjunto,
                tipoAdjunto,
            });

            // Emitir el mensaje a todos los usuarios en el chat
            const io = getIO();
            io.to(`chat_${chatId}`).emit("nuevo_mensaje", mensaje);

            res.status(201).json({
                success: true,
                data: mensaje,
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener mensajes de un chat
    async obtenerMensajes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { chatId } = req.params;
            const usuarioId = req.user!.id;

            const mensajes = await chatService.obtenerMensajes(chatId, usuarioId);

            res.status(200).json({
                success: true,
                data: mensajes,
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener todos los chats del usuario
    async obtenerChatsUsuario(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const usuarioId = req.user!.id;

            const chats = await chatService.obtenerChatsUsuario(usuarioId);

            res.status(200).json({
                success: true,
                data: chats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ChatController();
