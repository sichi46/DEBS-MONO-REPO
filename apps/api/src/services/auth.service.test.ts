import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, UserStatus } from "@prisma/client";

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh";

vi.mock("../lib/prisma.js", () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    passwordReset: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { prisma };
});

vi.mock("../utils/password.js", () => ({
  comparePassword: vi.fn(async () => true),
  hashPassword: vi.fn(async () => "hashed"),
  generateResetToken: vi.fn(() => "reset"),
  getResetTokenExpiry: vi.fn(() => new Date()),
}));

import { authService } from "./auth.service.js";
import { hashRefreshToken, generateTokenPair } from "../utils/jwt.js";
import { prisma } from "../lib/prisma.js";

const baseUser = {
  id: "user-1",
  email: "user@example.com",
  password: "hashed",
  name: "User",
  phone: null,
  address: null,
  avatarUrl: null,
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  emailVerified: false,
  createdAt: new Date(),
  lastLoginAt: null,
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores hashed refresh token on login", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(baseUser as never);
    vi.mocked(prisma.user.update).mockResolvedValue(baseUser as never);
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);

    const result = await authService.login({
      email: baseUser.email,
      password: "password",
    });

    expect(prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tokenHash: hashRefreshToken(result.tokens.refreshToken),
          userId: baseUser.id,
        }),
      }),
    );
  });

  it("looks up refresh tokens by hash", async () => {
    const tokens = generateTokenPair({
      userId: baseUser.id,
      email: baseUser.email,
      role: baseUser.role,
    });

    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
      id: "rt-1",
      tokenHash: hashRefreshToken(tokens.refreshToken),
      userId: baseUser.id,
      expiresAt: new Date(Date.now() + 1000 * 60),
      user: {
        id: baseUser.id,
        email: baseUser.email,
        role: baseUser.role,
        status: baseUser.status,
      },
    } as never);
    vi.mocked(prisma.refreshToken.delete).mockResolvedValue({} as never);
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);

    await authService.refreshToken(tokens.refreshToken);

    expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: hashRefreshToken(tokens.refreshToken) },
      }),
    );
  });

  it("revokes refresh tokens on password change", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(baseUser as never);
    vi.mocked(prisma.user.update).mockResolvedValue(baseUser as never);
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({} as never);

    await authService.changePassword(baseUser.id, "current", "next");

    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: baseUser.id },
      }),
    );
  });
});
