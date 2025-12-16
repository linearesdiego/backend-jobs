import { Request, Response } from "express";
import { profileService } from "./profile.service";

export const profileController = {
  async getProfile(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.userId;
      const profile = await profileService.getProfile(usuarioId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al obtener el perfil",
      });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const usuarioId = req.user?.userId;
      const data = req.body;

      const profile = await profileService.updateProfile(usuarioId, data);

      res.status(200).json({
        success: true,
        data: profile,
        message: "Perfil actualizado exitosamente",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al actualizar el perfil",
      });
    }
  },
};
