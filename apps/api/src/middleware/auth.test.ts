import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh";

vi.mock("../lib/prisma.js", () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };
  return { prisma };
});

vi.mock("../utils/jwt.js", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("../utils/response.js", () => ({
  sendError: vi.fn(),
}));

import {
  authenticate,
  requireRole,
  requireAdmin,
  requireStaff,
} from "./auth.js";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

function mockReq(overrides: Record<string, unknown> = {}): Request {
  return {
    headers: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function mockRes(): Response {
  return {} as unknown as Response;
}

function mockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects if no auth header", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await authenticate(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, "Access token required", 401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects if invalid token", async () => {
    const req = mockReq({
      headers: { authorization: "Bearer invalid-token" },
    });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(verifyAccessToken).mockReturnValue(null as never);

    await authenticate(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      "Invalid or expired access token",
      401,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects if user not found", async () => {
    const req = mockReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(verifyAccessToken).mockReturnValue({
      userId: "user-1",
      email: "user@example.com",
      role: UserRole.USER,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, "User not found", 401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects if user is not active (status SUSPENDED)", async () => {
    const req = mockReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(verifyAccessToken).mockReturnValue({
      userId: "user-1",
      email: "user@example.com",
      role: UserRole.USER,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      status: "SUSPENDED",
      role: UserRole.USER,
    } as never);

    await authenticate(req, res, next);

    expect(sendError).toHaveBeenCalledWith(res, "Account is not active", 403);
    expect(next).not.toHaveBeenCalled();
  });

  it("succeeds and sets req.user for valid token", async () => {
    const payload = {
      userId: "user-1",
      email: "user@example.com",
      role: UserRole.USER,
    };
    const req = mockReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(verifyAccessToken).mockReturnValue(payload as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      status: "ACTIVE",
      role: UserRole.USER,
    } as never);

    await authenticate(req, res, next);

    expect((req as unknown as { user: unknown }).user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });

  it("uses the DB role, not the JWT role, when they differ", async () => {
    const req = mockReq({
      headers: { authorization: "Bearer valid-token" },
    });
    const res = mockRes();
    const next = mockNext();

    vi.mocked(verifyAccessToken).mockReturnValue({
      userId: "user-1",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      status: "ACTIVE",
      role: UserRole.USER,
    } as never);

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as unknown as { user: { role: UserRole } }).user?.role).toBe(
      UserRole.USER,
    );
    expect(sendError).not.toHaveBeenCalled();
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects if user role not in allowed roles", () => {
    const middleware = requireRole(UserRole.ADMIN);
    const req = mockReq({
      user: {
        userId: "user-1",
        email: "user@example.com",
        role: UserRole.USER,
      },
    });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      "Insufficient permissions",
      403,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("allows if user role is in allowed roles", () => {
    const middleware = requireRole(UserRole.ADMIN, UserRole.AGENT);
    const req = mockReq({
      user: {
        userId: "user-1",
        email: "agent@example.com",
        role: UserRole.AGENT,
      },
    });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admin users", () => {
    const req = mockReq({
      user: {
        userId: "user-1",
        email: "user@example.com",
        role: UserRole.USER,
      },
    });
    const res = mockRes();
    const next = mockNext();

    requireAdmin(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      "Insufficient permissions",
      403,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("allows admin users", () => {
    const req = mockReq({
      user: {
        userId: "admin-1",
        email: "admin@example.com",
        role: UserRole.ADMIN,
      },
    });
    const res = mockRes();
    const next = mockNext();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });
});

describe("requireStaff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-staff users", () => {
    const req = mockReq({
      user: {
        userId: "user-1",
        email: "user@example.com",
        role: UserRole.USER,
      },
    });
    const res = mockRes();
    const next = mockNext();

    requireStaff(req, res, next);

    expect(sendError).toHaveBeenCalledWith(
      res,
      "Insufficient permissions",
      403,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("allows admin users", () => {
    const req = mockReq({
      user: {
        userId: "admin-1",
        email: "admin@example.com",
        role: UserRole.ADMIN,
      },
    });
    const res = mockRes();
    const next = mockNext();

    requireStaff(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });

  it("allows agent users", () => {
    const req = mockReq({
      user: {
        userId: "agent-1",
        email: "agent@example.com",
        role: UserRole.AGENT,
      },
    });
    const res = mockRes();
    const next = mockNext();

    requireStaff(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(sendError).not.toHaveBeenCalled();
  });
});
