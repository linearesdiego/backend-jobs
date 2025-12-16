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

    if (!postulacion) {
      throw new CustomError("Postulación no encontrada", 404);
    }

    // Verificar que el usuario es el proveedor de la postulación o un contratador
    const esProveedor = postulacion.proveedor.usuario.id === usuarioId;

    // Obtener el usuario para verificar su rol
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new CustomError("Usuario no encontrado", 404);
    }

    // Verificar permisos según el rol
    if (usuario.rol === "PROVEEDOR" && !esProveedor) {
      throw new CustomError("No tienes permiso para acceder a este chat", 403);
    }

    // Para contratadores, permitir acceso (pueden iniciar conversación con cualquier proveedor)
    // La verificación de participación se hará en obtenerMensajes y obtenerChatsUsuario

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

    if (!chat) {
      throw new CustomError("Chat no encontrado", 404);
    }

    // Verificar que el usuario tiene permiso para enviar mensajes en este chat
    const esProveedor = chat.postulacion.proveedor.usuario.id === remitenteId;

    // Obtener información del remitente para verificar su rol
    const remitente = await prisma.usuario.findUnique({
      where: { id: remitenteId },
    });

    if (!remitente) {
      throw new CustomError("Usuario no encontrado", 404);
    }

    // Solo proveedores dueños de la postulación y contratadores pueden enviar mensajes
    const esContratador = remitente.rol === "CONTRATADOR";
    const esAdmin = remitente.rol === "ADMIN";

    if (!esProveedor && !esContratador && !esAdmin) {
      throw new CustomError(
        "No tienes permiso para enviar mensajes en este chat",
        403
      );
    }

    if (!texto && !urlAdjunto) {
      throw new CustomError("Debes proporcionar texto o un adjunto", 400);
    }

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

    // Obtener el usuario para verificar su rol
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new CustomError("Usuario no encontrado", 404);
    }

    // Si es proveedor, debe ser el dueño de la postulación
    if (usuario.rol === "PROVEEDOR" && !esProveedor) {
      throw new CustomError("No tienes permiso para ver este chat", 403);
    }

    // Si es contratador, debe haber participado en el chat
    if (usuario.rol === "CONTRATADOR") {
      const haParticipadoEnChat = chat.mensajes.some(
        (mensaje) => mensaje.remitenteId === usuarioId
      );

      if (!haParticipadoEnChat) {
        throw new CustomError(
          "No tienes permiso para ver este chat. Debes enviar al menos un mensaje primero.",
          403
        );
      }
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

    if (!usuario) {
      throw new CustomError("Usuario no encontrado", 404);
    }

    let chats: any[] = [];

    if (usuario.rol === "PROVEEDOR" && usuario.perfilProveedor) {
      // Obtener chats de postulaciones del proveedor
      chats = await prisma.chat.findMany({
        where: {
          postulacion: {
            proveedorId: usuario.perfilProveedor.id,
          },
        },
        include: {
          postulacion: {
            select: {
              id: true,
              titulo: true,
            },
          },
          mensajes: {
            orderBy: { creadoEn: "desc" },
            take: 1,
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
        include: {
          postulacion: {
            select: {
              id: true,
              titulo: true,
            },
          },
          mensajes: {
            orderBy: { creadoEn: "desc" },
            take: 1,
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
        orderBy: {
          creadoEn: "desc",
        },
      });
    } else {
      // Para admins, obtener todos los chats
      chats = await prisma.chat.findMany({
        include: {
          postulacion: {
            select: {
              id: true,
              titulo: true,
            },
          },
          mensajes: {
            orderBy: { creadoEn: "desc" },
            take: 1,
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
        orderBy: {
          creadoEn: "desc",
        },
      });
    }

    return chats;
  }
}

export default new ChatService();
