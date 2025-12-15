import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGINS,
            credentials: true,
        },
    });

    // Middleware de autenticación
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("No se proporcionó token"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            socket.data.user = decoded;
            next();
        } catch (error) {
            next(new Error("Token inválido"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.user.id;
        logger.info(`Usuario conectado: ${userId}`);

        // Unirse a una sala de chat
        socket.on("join_chat", (chatId: string) => {
            socket.join(`chat_${chatId}`);
            logger.info(`Usuario ${userId} se unió al chat ${chatId}`);
        });

        // Salir de una sala de chat
        socket.on("leave_chat", (chatId: string) => {
            socket.leave(`chat_${chatId}`);
            logger.info(`Usuario ${userId} salió del chat ${chatId}`);
        });

        // Usuario está escribiendo
        socket.on("typing", (data: { chatId: string }) => {
            socket.to(`chat_${data.chatId}`).emit("user_typing", {
                userId,
                chatId: data.chatId,
            });
        });

        // Usuario dejó de escribir
        socket.on("stop_typing", (data: { chatId: string }) => {
            socket.to(`chat_${data.chatId}`).emit("user_stop_typing", {
                userId,
                chatId: data.chatId,
            });
        });

        socket.on("disconnect", () => {
            logger.info(`Usuario desconectado: ${userId}`);
        });
    });

    return io;
};
