import { describe, it, expect, beforeEach, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { notification: { create: vi.fn() } },
}));
vi.mock("../../config/prisma", () => ({ default: prismaMock }));

import notificationService from "./notification.service";

beforeEach(() => vi.clearAllMocks());

describe("create", () => {
  it("creates a notification with the given fields", async () => {
    prismaMock.notification.create.mockImplementation(async (a: any) => ({
      id: "n1",
      ...a.data,
    }));

    const result = await notificationService.create({
      userId: "u1",
      type: "application_approved",
      title: "Approved",
      body: "Your post is live",
    });

    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        type: "application_approved",
        title: "Approved",
        body: "Your post is live",
        isRead: false,
      },
    });
    expect(result.id).toBe("n1");
  });
});
