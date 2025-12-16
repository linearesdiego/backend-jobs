import { Socket } from "socket.io";
import logger from "../utils/logger";

/**
 * Manejadores de eventos de Socket.IO para notificaciones generales
 */
export const notificationSocketHandlers = (socket: Socket) => {
  const userId = socket.data.user.userId;

  // Unirse a sala personal para notificaciones
  socket.join(`user_${userId}`);
  logger.info(`Usuario ${userId} unido a su sala de notificaciones`);

  // Evento para cuando el usuario quiere marcar todas las notificaciones como leídas
  socket.on("mark_all_notifications_read", () => {
    logger.info(`Usuario ${userId} marcó todas las notificaciones como leídas`);
    // Aquí podrías actualizar la base de datos si tienes un sistema de notificaciones
  });

  logger.info(
    `Manejadores de notificaciones registrados para usuario ${userId}`
  );
};
