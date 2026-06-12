import { ModerationStatus } from "@prisma/client";
import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";
import { adminService } from "../admin/admin.service";

export const moderationService = {
  async listSubmissions(
    status: ModerationStatus = "PENDING",
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where = { moderationStatus: status };

    const [submissions, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "asc" },
        include: { user: { select: { id: true, email: true } } },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return { submissions, total, page, limit };
  },

  async approveSubmission(providerId: string, reviewerId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!provider) throw new CustomError("Submission not found", 404);
    if (provider.moderationStatus !== "PENDING") {
      throw new CustomError("Submission is not pending review", 400);
    }

    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        moderationStatus: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        rejectionReason: null,
      },
    });

    await adminService.logAction(
      "APPROVE_APPLICATION",
      reviewerId,
      provider.user.id,
      provider.user.email,
    );

    return { providerUserId: provider.user.id, providerEmail: provider.user.email };
  },

  async rejectSubmission(
    providerId: string,
    reviewerId: string,
    reason: string,
  ) {
    if (!reason || !reason.trim()) {
      throw new CustomError("A rejection reason is required", 400);
    }

    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!provider) throw new CustomError("Submission not found", 404);
    if (provider.moderationStatus !== "PENDING") {
      throw new CustomError("Submission is not pending review", 400);
    }

    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        moderationStatus: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        rejectionReason: reason.trim(),
      },
    });

    await adminService.logAction(
      "REJECT_APPLICATION",
      reviewerId,
      provider.user.id,
      provider.user.email,
      undefined,
      { reason: reason.trim() },
    );

    return {
      providerUserId: provider.user.id,
      providerEmail: provider.user.email,
      reason: reason.trim(),
    };
  },
};
