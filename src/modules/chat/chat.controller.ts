import { Request, Response, NextFunction } from "express";
import chatService from "./chat.service";
import { getIO } from "../../index";

class ChatController {
  // Get or create chat for a provider
  async getOrCreateChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { providerId } = req.params;
      const userId = req.user?.userId;

      const chat = await chatService.getOrCreateChat(
        providerId,
        userId
      );

      res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  }

  // Send message (HTTP)
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const { text, attachmentUrl, attachmentType } = req.body;
      const senderId = req.user?.userId;

      const message = await chatService.sendMessage({
        chatId,
        senderId,
        text,
        attachmentUrl,
        attachmentType,
      });

      // Emit message to all users in chat
      const io = getIO();
      io.to(`chat_${chatId}`).emit("new_message", message);

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get messages from a chat
  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const userId = req.user?.userId;

      const messages = await chatService.getMessages(chatId, userId);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all user chats
  async getUserChats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const chats = await chatService.getUserChats(userId);
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
