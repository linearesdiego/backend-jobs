import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";

export const profileService = {
  async getProfile(usuarioId: string) {
    // Buscar el usuario con sus perfiles
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfilContratador: true,
        perfilProveedor: true,
      },
    });

    if (!usuario) {
      throw new CustomError("Usuario no encontrado", 404);
    }

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      perfil:
        usuario.rol === "CONTRATADOR"
          ? usuario.perfilContratador
          : usuario.perfilProveedor,
    };
  },

  async updateProfile(usuarioId: string, data: any) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfilContratador: true,
        perfilProveedor: true,
      },
    });

    if (!usuario) {
      throw new CustomError("User not found", 404);
    }

    if (usuario.rol === "CONTRATADOR") {
      if (!usuario.perfilContratador) {
        throw new CustomError("Contractor profile not found", 404);
      }

      const perfilActualizado = await prisma.perfilContratador.update({
        where: { id: usuario.perfilContratador.id },
        data: {
          nombreCompleto: data.nombreCompleto,
          nombreUsuario: data.nombreUsuario,
          cuit: data.cuit,
          direccion: data.direccion,
          ciudad: data.ciudad,
          codigoPostal: data.codigoPostal,
          telefono: data.telefono,
        },
      });

      return perfilActualizado;
    } else if (usuario.rol === "PROVEEDOR") {
      if (!usuario.perfilProveedor) {
        throw new CustomError("Provider profile not found", 404);
      }

      const perfilActualizado = await prisma.perfilProveedor.update({
        where: { id: usuario.perfilProveedor.id },
        data: {
          nombreCompleto: data.nombreCompleto,
          nombreUsuario: data.nombreUsuario,
          rubro: data.rubro,
          experiencia: data.experiencia ? parseInt(data.experiencia) : null,
          descripcion: data.descripcion,
          telefono: data.telefono,
          direccion: data.direccion,
          ciudad: data.ciudad,
          codigoPostal: data.codigoPostal,
          perfilCompleto: true, // Marcar como completo al actualizar
        },
      });

      return perfilActualizado;
    }

    throw new CustomError("Invalid user role", 400);
  },
};
