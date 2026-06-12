import { describe, it, expect, beforeEach, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    providerProfile: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  },
}));
vi.mock("../../config/prisma", () => ({ default: prismaMock }));
vi.mock("../admin/admin.service", () => ({
  adminService: { logAction: vi.fn(async () => undefined) },
}));

import { moderationService } from "./moderation.service";
import { adminService } from "../admin/admin.service";

beforeEach(() => vi.clearAllMocks());

const pending = {
  id: "p1",
  userId: "u1",
  moderationStatus: "PENDING",
  user: { id: "u1", email: "prov@test.com" },
};

describe("approveSubmission", () => {
  it("sets APPROVED + reviewer + logs, returns provider user", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue(pending);
    prismaMock.providerProfile.update.mockImplementation(async (a: any) => ({
      ...pending,
      ...a.data,
    }));

    const result = await moderationService.approveSubmission("p1", "mod1");

    const data = prismaMock.providerProfile.update.mock.calls[0][0].data;
    expect(data.moderationStatus).toBe("APPROVED");
    expect(data.reviewedById).toBe("mod1");
    expect(data.rejectionReason).toBeNull();
    expect(data.reviewedAt).toBeInstanceOf(Date);
    expect(adminService.logAction).toHaveBeenCalledWith(
      "APPROVE_APPLICATION", "mod1", "u1", "prov@test.com",
    );
    expect(result.providerUserId).toBe("u1");
    expect(result.providerEmail).toBe("prov@test.com");
  });

  it("rejects approving a non-PENDING submission", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue({
      ...pending,
      moderationStatus: "DRAFT",
    });
    await expect(moderationService.approveSubmission("p1", "mod1")).rejects.toThrow(
      /not pending/i,
    );
  });
});

describe("rejectSubmission", () => {
  it("requires a reason", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue(pending);
    await expect(moderationService.rejectSubmission("p1", "mod1", "  ")).rejects.toThrow(
      /reason/i,
    );
    expect(prismaMock.providerProfile.update).not.toHaveBeenCalled();
  });

  it("sets REJECTED + reason + logs", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue(pending);
    prismaMock.providerProfile.update.mockImplementation(async (a: any) => ({
      ...pending,
      ...a.data,
    }));

    await moderationService.rejectSubmission("p1", "mod1", "Video too blurry");

    const data = prismaMock.providerProfile.update.mock.calls[0][0].data;
    expect(data.moderationStatus).toBe("REJECTED");
    expect(data.rejectionReason).toBe("Video too blurry");
    expect(adminService.logAction).toHaveBeenCalledWith(
      "REJECT_APPLICATION", "mod1", "u1", "prov@test.com",
      undefined, { reason: "Video too blurry" },
    );
  });
});

describe("listSubmissions", () => {
  it("queries by status with pagination", async () => {
    prismaMock.providerProfile.count.mockResolvedValue(0);
    prismaMock.providerProfile.findMany.mockResolvedValue([]);

    await moderationService.listSubmissions("PENDING", 2, 5);

    const args = prismaMock.providerProfile.findMany.mock.calls[0][0];
    expect(args.where.moderationStatus).toBe("PENDING");
    expect(args.skip).toBe(5);
    expect(args.take).toBe(5);
  });
});
