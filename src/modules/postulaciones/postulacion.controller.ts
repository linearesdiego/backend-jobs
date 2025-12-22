import { Request, Response, NextFunction } from "express";
import postulacionService from "./postulacion.service";
import { PostulacionEstado } from "@prisma/client";

class PostulacionController {
  // Obtener todas las postulaciones (públicas)
  async obtenerPostulaciones(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoria, estado, busqueda } = req.query;

      const filtros = {
        categoria: categoria as string | undefined,
        estado: estado as PostulacionEstado | undefined,
        busqueda: busqueda as string | undefined,
      };

      const postulaciones = await postulacionService.obtenerPostulaciones(
        filtros
      );

      res.status(200).json({
        success: true,
        data: postulaciones,
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener postulaciones del proveedor autenticado
  async obtenerMisPostulaciones(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const usuarioId = req.user?.userId;

      const postulaciones = await postulacionService.obtenerMisPostulaciones(
        usuarioId
      );

      res.status(200).json({
        success: true,
        data: postulaciones,
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener una postulación por ID
  async obtenerPostulacionPorId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const postulacion = await postulacionService.obtenerPostulacionPorId(id);

      res.status(200).json({
        success: true,
        data: postulacion,
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear una nueva postulación
  async crearPostulacion(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user?.userId;
      const data = req.body;

      const postulacion = await postulacionService.crearPostulacion(
        usuarioId,
        data
      );

      res.status(201).json({
        success: true,
        data: postulacion,
        message: "Application created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar una postulación
  async actualizarPostulacion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.userId;
      const data = req.body;

      const postulacion = await postulacionService.actualizarPostulacion(
        id,
        usuarioId,
        data
      );

      res.status(200).json({
        success: true,
        data: postulacion,
        message: "Application updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar una postulación
  async eliminarPostulacion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.userId;

      await postulacionService.eliminarPostulacion(id, usuarioId);

      res.status(200).json({
        success: true,
        message: "Application deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Cambiar estado de una postulación
  async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.userId;
      const { estado } = req.body;

      if (!estado || !Object.values(PostulacionEstado).includes(estado)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const postulacion = await postulacionService.cambiarEstado(
        id,
        usuarioId,
        estado
      );

      res.status(200).json({
        success: true,
        data: postulacion,
        message: "Status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener categorías disponibles
  async obtenerCategorias(req: Request, res: Response, next: NextFunction) {
    try {
      const categorias = await postulacionService.obtenerCategorias();

      res.status(200).json({
        success: true,
        data: categorias,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostulacionController();
