import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { AdPlacement } from "@prisma/client";
import { adminService } from "./admin.service";
import { CreateModDTO, CreateAdDTO, UpdateAdDTO } from "./admin.model";

export class AdminController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      const result = await adminService.listUsers(page, limit, search);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await adminService.banUser(id, req.user!.userId, reason);
      res.json({ success: true, message: "User banned" });
    } catch (error) {
      next(error);
    }
  }

  async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.unbanUser(id, req.user!.userId);
      res.json({ success: true, message: "User unbanned" });
    } catch (error) {
      next(error);
    }
  }

  async createMod(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = plainToClass(CreateModDTO, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const mod = await adminService.createMod(dto.email, dto.password, req.user!.userId);
      res.status(201).json({ success: true, data: mod });
    } catch (error) {
      next(error);
    }
  }

  async uploadAd(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "Media file is required" });
        return;
      }

      const dto = plainToClass(CreateAdDTO, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const ad = await adminService.uploadAd(
        dto.title,
        dto.placement,
        req.file.buffer,
        req.file.mimetype,
        dto.linkUrl,
        req.user!.userId
      );

      res.status(201).json({ success: true, data: ad });
    } catch (error) {
      next(error);
    }
  }

  async listAds(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = req.query.placement as AdPlacement | undefined;
      const ads = await adminService.listAds(placement);
      res.json({ success: true, data: ads });
    } catch (error) {
      next(error);
    }
  }

  async getActiveAds(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = req.query.placement as AdPlacement | undefined;
      const ads = await adminService.listAds(placement, true);
      res.json({ success: true, data: ads });
    } catch (error) {
      next(error);
    }
  }

  async updateAd(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dto = plainToClass(UpdateAdDTO, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const ad = await adminService.updateAd(id, dto, req.user!.userId);
      res.json({ success: true, data: ad });
    } catch (error) {
      next(error);
    }
  }

  async deleteAd(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteAd(id, req.user!.userId);
      res.json({ success: true, message: "Ad deleted" });
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getLogs(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
