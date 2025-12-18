import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";

class ChatService {
  // Crear o obtener chat para una postulación
  async obtenerOCrearChat(postulacionId: string, usuarioId: string) {
    // Verificar que la postulación existe
    const postulacion = await prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        proveedor: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!postulacion) throw new CustomError("Postulación no encontrada", 404);

    // Verificar que el usuario es el proveedor de la postulación o un contratador
    const esProveedor = postulacion.proveedor.usuario.id === usuarioId;

    // Obtener solo el rol del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true },
    });

    if (!usuario) throw new CustomError("Usuario no encontrado", 404);

    // Verificar permisos según el rol
    if (usuario.rol === "PROVEEDOR" && !esProveedor)
      throw new CustomError("No tienes permiso para acceder a este chat", 403);

    // Buscar chat existente
    let chat = await prisma.chat.findFirst({
      where: { postulacionId },
      include: {
        postulacion: {
          include: {
            proveedor: true,
          },
        },
        mensajes: {
          orderBy: { creadoEn: "asc" },
          include: {
            remitente: {
              select: {
                id: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    // Si no existe, crear uno nuevo
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          postulacionId,
        },
        include: {
          postulacion: {
            include: {
              proveedor: true,
            },
          },
          mensajes: {
            include: {
              remitente: {
                select: {
                  id: true,
                  email: true,
                  rol: true,
                },
              },
            },
          },
        },
      });
    }

    return chat;
  }

  // Enviar mensaje
  async enviarMensaje(data: {
    chatId: string;
    remitenteId: string;
    texto?: string;
    urlAdjunto?: string;
    tipoAdjunto?: string;
  }) {
    const { chatId, remitenteId, texto, urlAdjunto, tipoAdjunto } = data;

    // Verificar que el chat existe
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        postulacion: {
          include: {
            proveedor: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });

    if (!chat) throw new CustomError("Chat no encontrado", 404);

    // Verificar que el usuario tiene permiso para enviar mensajes en este chat
    const esProveedor = chat.postulacion.proveedor.usuario.id === remitenteId;

    // Obtener solo el rol del remitente
    const remitente = await prisma.usuario.findUnique({
      where: { id: remitenteId },
      select: { rol: true },
    });

    if (!remitente) throw new CustomError("Usuario no encontrado", 404);

    // Solo proveedores dueños de la postulación y contratadores pueden enviar mensajes
    const esContratador = remitente.rol === "CONTRATADOR";

    if (!esProveedor && !esContratador)
      throw new CustomError(
        "No tienes permiso para enviar mensajes en este chat",
        403
      );

    if (!texto && !urlAdjunto)
      throw new CustomError("Debes proporcionar texto o un adjunto", 400);

    const mensaje = await prisma.mensaje.create({
      data: {
        chatId,
        remitenteId,
        texto,
        urlAdjunto,
        tipoAdjunto,
      },
      include: {
        remitente: {
          select: {
            id: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    return mensaje;
  }

  // Obtener mensajes de un chat
  async obtenerMensajes(chatId: string, usuarioId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        postulacion: {
          include: {
            proveedor: {
              include: {
                usuario: true,
              },
            },
          },
        },
        mensajes: {
          orderBy: { creadoEn: "asc" },
          include: {
            remitente: {
              select: {
                id: true,
                email: true,
                rol: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new CustomError("Chat no encontrado", 404);
    }

    // Verificar permisos
    const esProveedor = chat.postulacion.proveedor.usuario.id === usuarioId;

    // Obtener solo el rol del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true },
    });

    if (!usuario) throw new CustomError("Usuario no encontrado", 404);

    // Si es proveedor, debe ser el dueño de la postulación
    if (usuario.rol === "PROVEEDOR" && !esProveedor)
      throw new CustomError("No tienes permiso para ver este chat", 403);

    // Si es contratador, debe haber participado en el chat
    if (usuario.rol === "CONTRATADOR") {
      const haParticipadoEnChat = chat.mensajes.some(
        (mensaje) => mensaje.remitenteId === usuarioId
      );

      if (!haParticipadoEnChat)
        throw new CustomError(
          "No tienes permiso para ver este chat. Debes enviar al menos un mensaje primero.",
          403
        );
    }

    return chat.mensajes;
  }

  // Obtener todos los chats de un usuario
  async obtenerChatsUsuario(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfilProveedor: true,
        perfilContratador: true,
      },
    });

    if (!usuario) throw new CustomError("Usuario no encontrado", 404);

    // Tipo para los chats retornados
    type ChatWithLastMessage = {
      id: string;
      postulacionId: string;
      creadoEn: Date;
      postulacion: {
        id: string;
        titulo: string;
      };
      mensajes: Array<{
        id: string;
        chatId: string;
        remitenteId: string;
        texto: string | null;
        urlAdjunto: string | null;
        tipoAdjunto: string | null;
        creadoEn: Date;
        remitente: {
          id: string;
          email: string;
          rol: string;
        };
      }>;
    };

    let chats: ChatWithLastMessage[] = [];

    if (usuario.rol === "PROVEEDOR" && usuario.perfilProveedor) {
      // Obtener chats de postulaciones del proveedor
      chats = await prisma.chat.findMany({
        where: {
          postulacion: {
            proveedorId: usuario.perfilProveedor.id,
          },
        },
        select: {
          id: true,
          postulacionId: true,
          creadoEn: true,
          postulacion: {
            select: {
              id: true,
              titulo: true,
            },
          },
          mensajes: {
            orderBy: { creadoEn: "desc" },
            take: 1,
            select: {
              id: true,
              chatId: true,
              remitenteId: true,
              texto: true,
              urlAdjunto: true,
              tipoAdjunto: true,
              creadoEn: true,
              remitente: {
                select: {
                  id: true,
                  email: true,
                  rol: true,
                },
              },
            },
          },
        },
        orderBy: {
          creadoEn: "desc",
        },
      });
    } else if (usuario.rol === "CONTRATADOR") {
      // Para contratadores, obtener solo chats donde han participado
      chats = await prisma.chat.findMany({
        where: {
          mensajes: {
            some: {
              remitenteId: usuarioId,
            },
          },
        },
        select: {
          id: true,
          postulacionId: true,
          creadoEn: true,
          postulacion: {
            select: {
              id: true,
              titulo: true,
            },
          },
          mensajes: {
            orderBy: { creadoEn: "desc" },
            take: 1,
            select: {
              id: true,
              chatId: true,
              remitenteId: true,
              texto: true,
              urlAdjunto: true,
              tipoAdjunto: true,
              creadoEn: true,
              remitente: {
                select: {
                  id: true,
                  email: true,
                  rol: true,
                },
              },
            },
          },
        },
        orderBy: {
          creadoEn: "desc",
        },
      });
    }
    return chats;
  }
}

export default new ChatService();
