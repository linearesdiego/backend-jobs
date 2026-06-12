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

describe("edit reverts moderation to DRAFT", () => {
  const approved = {
    id: "p1",
    userId: "u1",
    profileComplete: true,
    category: "Plumbing",
    videoUrl: "http://files/old.mp4",
    videoKey: "http://files/old.mp4",
    moderationStatus: "APPROVED",
  };

  it("updateProviderApplication resets APPROVED to DRAFT", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue(approved);
    prismaMock.providerProfile.update.mockImplementation(async (a: any) => ({
      ...approved,
      ...a.data,
    }));

    await profileService.updateProviderApplication("u1", {
      category: "Electrical",
    });

    const data = prismaMock.providerProfile.update.mock.calls[0][0].data;
    expect(data.moderationStatus).toBe("DRAFT");
    expect(data.submittedAt).toBeNull();
  });

  it("updateApplicationVideo resets APPROVED to DRAFT", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue(approved);
    prismaMock.providerProfile.update.mockImplementation(async (a: any) => ({
      ...approved,
      ...a.data,
    }));

    await profileService.updateApplicationVideo("u1", {
      filename: "new.mp4",
      mimetype: "video/mp4",
    } as any);

    const data = prismaMock.providerProfile.update.mock.calls[0][0].data;
    expect(data.moderationStatus).toBe("DRAFT");
  });

  it("deleteApplicationVideo resets APPROVED to DRAFT", async () => {
    prismaMock.providerProfile.findUnique.mockResolvedValue(approved);
    prismaMock.providerProfile.update.mockImplementation(async (a: any) => ({
      ...approved,
      ...a.data,
    }));

    await profileService.deleteApplicationVideo("u1");

    const data = prismaMock.providerProfile.update.mock.calls[0][0].data;
    expect(data.moderationStatus).toBe("DRAFT");
  });
});
