import { describe, it, expect, beforeEach, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    providerProfile: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("../../config/prisma", () => ({ default: prismaMock }));
vi.mock("../../utils/storage.service", () => ({
  buildPublicUrl: vi.fn(() => "http://files/test.mp4"),
  deleteFile: vi.fn(async () => undefined),
}));

import { profileService } from "./profile.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitApplication", () => {
  const completeProfile = {
    id: "p1",
    userId: "u1",
    profileComplete: true,
    category: "Plumbing",
    videoUrl: "http://files/test.mp4",
    moderationStatus: "DRAFT",
  };

  it("transitions a complete DRAFT to PENDING and sets submittedAt", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue(completeProfile);
    prismaMock.providerProfile.update.mockImplementation(async (args: any) => ({
      ...completeProfile,
      ...args.data,
    }));

    const result = await profileService.submitApplication("u1");

    expect(prismaMock.providerProfile.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({
        moderationStatus: "PENDING",
        rejectionReason: null,
        submittedAt: expect.any(Date),
      }),
    });
    expect(result.moderationStatus).toBe("PENDING");
  });

  it("rejects when category or video is missing", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue({
      ...completeProfile,
      category: null,
    });
    await expect(profileService.submitApplication("u1")).rejects.toThrow(
      /complete/i,
    );
    expect(prismaMock.providerProfile.update).not.toHaveBeenCalled();
  });

  it("rejects when already PENDING", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue({
      ...completeProfile,
      moderationStatus: "PENDING",
    });
    await expect(profileService.submitApplication("u1")).rejects.toThrow(
      /already under review/i,
    );
  });
});
