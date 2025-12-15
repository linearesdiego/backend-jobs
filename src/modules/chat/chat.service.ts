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

        // Verificar que el usuario es el proveedor de la postulación
        const esProveedor = postulacion.proveedor.usuario.id === usuarioId;

        // O verificar si es un contratador que puede ver esta postulación
        // (aquí puedes agregar lógica adicional según tu modelo de negocio)

        // Buscar chat existente
        let chat = await prisma.chat.findFirst({
            where: { postulacionId },
            include: {
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
        // Aquí puedes agregar verificación para contratadores

        if (!texto && !urlAdjunto) {
            throw new CustomError(
                "Debes proporcionar texto o un adjunto",
                400
            );
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
        // Aquí puedes agregar verificación para contratadores

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

        let chats;

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
        } else {
            // Para contratadores, aquí puedes implementar la lógica
            // según cómo determines qué chats puede ver un contratador
            chats = [];
        }

        return chats;
    }
}

export default new ChatService();
