import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ModerationStatus } from "@prisma/client";
import { moderationService } from "./moderation.service";
import { RejectSubmissionDTO } from "./moderation.model";
import notificationService from "../notifications/notification.service";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "../../services/moderationEmails";
import { getIO } from "../../index";
import logger from "../../utils/logger";

class ModerationController {
  async listSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const status = (req.query.status as ModerationStatus) || "PENDING";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await moderationService.listSubmissions(status, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { providerId } = req.params;
      const { providerUserId, providerEmail } =
        await moderationService.approveSubmission(providerId, req.user!.userId);

      await this.notify(providerUserId, providerEmail, {
        type: "application_approved",
        title: "Your post was approved",
        body: "A moderator approved your video post. It's now visible to contractors.",
        email: () => sendApplicationApprovedEmail(providerEmail),
      });

      res.json({ success: true, message: "Submission approved" });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { providerId } = req.params;
      const dto = plainToClass(RejectSubmissionDTO, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const { providerUserId, providerEmail, reason } =
        await moderationService.rejectSubmission(
          providerId,
          req.user!.userId,
          dto.reason,
        );

      await this.notify(providerUserId, providerEmail, {
        type: "application_rejected",
        title: "Your post needs changes",
        body: `Your post was rejected: ${reason}`,
        email: () => sendApplicationRejectedEmail(providerEmail, reason),
      });

      res.json({ success: true, message: "Submission rejected" });
    } catch (error) {
      next(error);
    }
  }

  // Shared side-effect helper: in-app notification (+ socket) and email.
  // Failures here are logged but never fail the request.
  private async notify(
    userId: string,
    _email: string,
    opts: { type: string; title: string; body: string; email: () => Promise<void> },
  ) {
    try {
      const notification = await notificationService.create({
        userId,
        type: opts.type,
        title: opts.title,
        body: opts.body,
      });
      getIO().to(`user_${userId}`).emit("new_notification", notification);
    } catch (error) {
      logger.error("Failed to create/emit moderation notification:", error);
    }

    try {
      await opts.email();
    } catch (error) {
      logger.error("Failed to send moderation email:", error);
    }
  }
}

export const moderationController = new ModerationController();
