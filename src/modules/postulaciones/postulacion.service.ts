import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";
import cloudinaryService from "../../utils/cloudinary.service";
import {
  CrearPostulacionDTO,
  ActualizarPostulacionDTO,
  FiltrosPostulaciones,
} from "./postulacion.model";
import { PostulacionEstado } from "@prisma/client";

class PostulacionService {
  // Obtener todas las postulaciones (públicas con filtros)
  async obtenerPostulaciones(filtros?: FiltrosPostulaciones) {
    const where: any = {};

    // Aplicar filtros
    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.busqueda) {
      where.OR = [
        { titulo: { contains: filtros.busqueda } },
        { descripcion: { contains: filtros.busqueda } },
      ];
    }

    const postulaciones = await prisma.postulacion.findMany({
      where,
      include: {
        proveedor: {
          include: {
            usuario: {
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

    return postulaciones;
  }

  // Obtener postulaciones del proveedor autenticado
  async obtenerMisPostulaciones(usuarioId: string) {
    // Obtener el perfil del proveedor
    const perfilProveedor = await prisma.perfilProveedor.findUnique({
      where: { usuarioId },
    });

    if (!perfilProveedor) {
      throw new CustomError(
        "You must have a provider profile to view your applications",
        403
      );
    }

    const postulaciones = await prisma.postulacion.findMany({
      where: {
        proveedorId: perfilProveedor.id,
      },
      include: {
        proveedor: true,
        chats: {
          select: {
            id: true,
            creadoEn: true,
          },
        },
      },
      orderBy: {
        creadoEn: "desc",
      },
    });

    return postulaciones;
  }

  // Obtener una postulación por ID
  async obtenerPostulacionPorId(id: string) {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id },
      include: {
        proveedor: {
          include: {
            usuario: {
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

    if (!postulacion) {
      throw new CustomError("Postulación no encontrada", 404);
    }

    return postulacion;
  }

  // Crear una nueva postulación
  async crearPostulacion(
    usuarioId: string,
    data: CrearPostulacionDTO,
    videoFile?: Express.Multer.File
  ) {
    // Verificar que el usuario es un proveedor
    const perfilProveedor = await prisma.perfilProveedor.findUnique({
      where: { usuarioId },
    });

    if (!perfilProveedor) {
      throw new CustomError(
        "You must have a provider profile to create applications",
        403
      );
    }

    // Validar que el perfil esté completo
    if (!perfilProveedor.perfilCompleto) {
      throw new CustomError(
        "You must complete your profile before creating applications",
        400
      );
    }

    // Datos base de la postulación
    const postulacionData: any = {
      proveedorId: perfilProveedor.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      categoria: data.categoria,
      // Convertir precioEstimado a número si viene como string
      precioEstimado: data.precioEstimado
        ? typeof data.precioEstimado === 'string'
          ? parseFloat(data.precioEstimado)
          : data.precioEstimado
        : undefined,
      estado: PostulacionEstado.ACTIVA,
    };

    // Si hay un video, subirlo a Cloudinary
    if (videoFile) {
      try {
        const videoData = await cloudinaryService.subirVideo(
          videoFile.buffer,
          "postulaciones/videos",
          `postulacion_${Date.now()}`
        ) as {
          videoUrl: string;
          videoClave: string;
          videoUrlMiniatura: string;
          videoDuracionSegundos: number;
          videoTipoMime: string;
        };

        // Agregar datos del video a la postulación
        postulacionData.videoUrl = videoData.videoUrl;
        postulacionData.videoClave = videoData.videoClave;
        postulacionData.videoUrlMiniatura = videoData.videoUrlMiniatura;
        postulacionData.videoDuracionSegundos =
          videoData.videoDuracionSegundos;
        postulacionData.videoTipoMime = videoData.videoTipoMime;
      } catch (error: any) {
        throw new CustomError(
          `Error al subir el video: ${error.message}`,
          500
        );
      }
    }

    // Crear la postulación
    const postulacion = await prisma.postulacion.create({
      data: postulacionData,
      include: {
        proveedor: true,
      },
    });

    return postulacion;
  }

  // Actualizar una postulación
  async actualizarPostulacion(
    id: string,
    usuarioId: string,
    data: ActualizarPostulacionDTO
  ) {
    // Verificar que la postulación existe
    const postulacion = await prisma.postulacion.findUnique({
      where: { id },
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

    // Verificar que el usuario es el dueño de la postulación
    if (postulacion.proveedor.usuario.id !== usuarioId) {
      throw new CustomError(
        "You don't have permission to edit this application",
        403
      );
    }

    // Actualizar la postulación
    const postulacionActualizada = await prisma.postulacion.update({
      where: { id },
      data: {
        ...(data.titulo && { titulo: data.titulo }),
        ...(data.descripcion && { descripcion: data.descripcion }),
        ...(data.categoria !== undefined && {
          categoria: data.categoria,
        }),
        ...(data.precioEstimado !== undefined && {
          precioEstimado: data.precioEstimado,
        }),
        ...(data.estado && { estado: data.estado }),
      },
      include: {
        proveedor: true,
      },
    });

    return postulacionActualizada;
  }

  // Eliminar una postulación
  async eliminarPostulacion(id: string, usuarioId: string) {
    // Verificar que la postulación existe
    const postulacion = await prisma.postulacion.findUnique({
      where: { id },
      include: {
        proveedor: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!postulacion) {
      throw new CustomError("Application not found", 404);
    }

    // Verificar que el usuario es el dueño de la postulación
    if (postulacion.proveedor.usuario.id !== usuarioId) {
      throw new CustomError(
        "You don't have permission to delete this application",
        403
      );
    }

    // Si hay un video en Cloudinary, eliminarlo
    if (postulacion.videoClave) {
      try {
        await cloudinaryService.eliminarVideo(postulacion.videoClave);
      } catch (error) {
        // Log del error pero no detener la eliminación
        console.error("Error al eliminar video de Cloudinary:", error);
      }
    }

    // Eliminar la postulación
    await prisma.postulacion.delete({
      where: { id },
    });

    return { message: "Application deleted successfully" };
  }

  // Cambiar estado de una postulación
  async cambiarEstado(
    id: string,
    usuarioId: string,
    estado: PostulacionEstado
  ) {
    return this.actualizarPostulacion(id, usuarioId, { estado });
  }

  // Obtener categorías disponibles
  async obtenerCategorias() {
    const categorias = await prisma.postulacion.findMany({
      where: {
        categoria: {
          not: null,
        },
      },
      select: {
        categoria: true,
      },
      distinct: ["categoria"],
    });

    return categorias
      .map((c) => c.categoria)
      .filter((c) => c !== null)
      .sort();
  }
}

export default new PostulacionService();
