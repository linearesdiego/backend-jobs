import bcrypt from "bcrypt";
import { AdPlacement, Role } from "@prisma/client";
import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";
import cloudinaryService from "../../utils/cloudinary.service";
import { json } from "zod";

export const adminService = {
  async logAction(
    action: string,
    performedById: string,
    targetUserId?: string,
    targetUserEmail?: string,
    targetAdId?: string,
    details?: object,
  ) {
    await prisma.adminLog.create({
      data: {
        action,
        performedById,
        targetUserId,
        targetUserEmail,
        targetAdId,
        details: details ? JSON.stringify(details) : undefined,
      },
    });
  },

  async listUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? { email: { contains: search } } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
          providerProfile: {
            select: {
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  },

  async banUser(
    targetUserId: string,
    performedById: string,
    reason?: string,
    targetUserEmail?: string,
  ) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) throw new CustomError("User not found", 404);
    if (target.role === "ADMIN")
      throw new CustomError("Cannot ban an ADMIN", 403);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: true },
    });

    await this.logAction(
      "BAN_USER",
      performedById,
      targetUserId,
      targetUserEmail,
      undefined,
      {
        reason,
      },
    );
  },

  async unbanUser(
    targetUserId: string,
    targetUserEmail: string,
    performedById: string,
  ) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) throw new CustomError("User not found", 404);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: false },
    });

    await this.logAction(
      "UNBAN_USER",
      performedById,
      targetUserId,
      targetUserEmail,
    );
  },

  async createMod(email: string, password: string, performedById: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new CustomError("Email already in use", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const mod = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "MOD" as Role,
        isVerified: false,
      },
      select: { id: true, email: true, role: true },
    });

    await this.logAction("CREATE_MOD", performedById, mod.email);
    return mod;
  },

  async uploadAd(
    title: string,
    placement: AdPlacement | undefined,
    fileBuffer: Buffer,
    mimeType: string,
    linkUrl: string | undefined,
    uploadedById: string,
  ) {
    let mediaUrl: string;
    let mediaKey: string;
    const mediaType = mimeType.startsWith("image/") ? "image" : "video";

    if (mediaType === "image") {
      const result = (await cloudinaryService.subirImagen(
        fileBuffer,
        "banners/images",
      )) as any;
      mediaUrl = result.imageUrl;
      mediaKey = result.imageClave;
    } else {
      const result = (await cloudinaryService.subirVideo(
        fileBuffer,
        "banners/videos",
      )) as any;
      mediaUrl = result.videoUrl;
      mediaKey = result.videoClave;
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        mediaUrl,
        mediaKey,
        mediaType,
        placement,
        isActive: true,
        linkUrl,
        uploadedById,
      },
    });

    await this.logAction(
      "UPLOAD_AD",
      uploadedById,
      undefined,
      undefined,
      ad.id,
      { title, placement },
    );
    return ad;
  },

  async listAds(placement?: AdPlacement, activeOnly?: boolean) {
    const where: any = {};
    if (placement) where.placement = placement;
    if (activeOnly) where.isActive = true;

    return prisma.ad.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { uploadedBy: { select: { id: true, email: true } } },
    });
  },

  async updateAd(
    adId: string,
    data: Partial<{
      title: string;
      placement: AdPlacement;
      isActive: boolean;
      linkUrl: string;
    }>,
    performedById: string,
  ) {
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new CustomError("Ad not found", 404);

    const updated = await prisma.ad.update({
      where: { id: adId },
      data,
    });

    await this.logAction(
      "UPDATE_AD",
      performedById,
      undefined,
      undefined,
      adId,
      data,
    );
    return updated;
  },

  async deleteAd(adId: string, performedById: string) {
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) throw new CustomError("Ad not found", 404);

    if (ad.mediaType === "image") {
      await cloudinaryService.eliminarImagen(ad.mediaKey);
    } else {
      await cloudinaryService.eliminarVideo(ad.mediaKey);
    }

    await prisma.ad.delete({ where: { id: adId } });
    await this.logAction(
      "DELETE_AD",
      performedById,
      undefined,
      undefined,
      adId,
      { title: ad.title },
    );
  },

  async getLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          performedBy: { select: { id: true, email: true } },
        },
      }),
      prisma.adminLog.count(),
    ]);

    return { logs, total, page, limit };
  },
};
