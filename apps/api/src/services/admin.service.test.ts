import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole, UserStatus } from "@prisma/client";

process.env.JWT_ACCESS_SECRET = "test";
process.env.JWT_REFRESH_SECRET = "test";

vi.mock("../lib/prisma.js", () => {
  const prisma = {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    policy: {
      count: vi.fn(),
    },
    claim: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    payment: {
      aggregate: vi.fn(),
    },
    policyType: {
      findMany: vi.fn(),
    },
  };
  return { prisma };
});

import { adminService } from "./admin.service.js";
import { prisma } from "../lib/prisma.js";

describe("adminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDashboardStats", () => {
    it("returns correct aggregated stats", async () => {
      // First Promise.all: 10 calls for totals
      (prisma.user.count as any)
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(80); // activeUsers
      (prisma.policy.count as any)
        .mockResolvedValueOnce(50) // totalPolicies
        .mockResolvedValueOnce(40); // activePolicies
      (prisma.claim.count as any)
        .mockResolvedValueOnce(30) // totalClaims
        .mockResolvedValueOnce(10) // pendingClaims
        .mockResolvedValueOnce(15) // approvedClaims
        .mockResolvedValueOnce(5); // rejectedClaims
      (prisma.payment.aggregate as any)
        .mockResolvedValueOnce({ _sum: { amount: 50000 } }) // revenueResult
        .mockResolvedValueOnce({ _sum: { amount: 5000 } }); // monthlyRevenueResult
      (prisma.claim.aggregate as any)
        .mockResolvedValueOnce({ _sum: { amount: 20000 } }) // payoutsResult
        .mockResolvedValueOnce({ _sum: { amount: 2000 } }); // monthlyPayoutsResult

      const stats = await adminService.getDashboardStats();

      expect(stats.totalUsers).toBe(100);
      expect(stats.activeUsers).toBe(80);
      expect(stats.totalPolicies).toBe(50);
      expect(stats.activePolicies).toBe(40);
      expect(stats.totalClaims).toBe(30);
      expect(stats.pendingClaims).toBe(10);
      expect(stats.approvedClaims).toBe(15);
      expect(stats.rejectedClaims).toBe(5);
      expect(stats.totalRevenue).toContain("50,000");
      expect(stats.totalPayouts).toContain("20,000");
      expect(stats.monthlyRevenue).toContain("5,000");
      expect(stats.monthlyPayouts).toContain("2,000");
    });
  });

  describe("getUsers", () => {
    it("returns paginated user list", async () => {
      const mockUsers = [
        {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+260971234567",
          address: "Lusaka",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          createdAt: new Date("2025-01-15"),
          lastLoginAt: null,
          _count: { policies: 2 },
        },
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);
      (prisma.user.count as any).mockResolvedValue(1);

      const result = await adminService.getUsers({ page: 1, limit: 20 });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].id).toBe("user-1");
      expect(result.users[0].name).toBe("John Doe");
      expect(result.users[0].avatarInitials).toBe("JD");
      expect(result.users[0].role).toBe("user");
      expect(result.users[0].status).toBe("active");
      expect(result.users[0].policiesCount).toBe(2);
      expect(result.users[0].lastActive).toBe("Never");
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("filters by role", async () => {
      (prisma.user.findMany as any).mockResolvedValue([]);
      (prisma.user.count as any).mockResolvedValue(0);

      await adminService.getUsers({ role: "admin" });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: "ADMIN",
          }),
        }),
      );
    });
  });

  describe("updateUserRole", () => {
    it("prevents changing own role", async () => {
      await expect(
        adminService.updateUserRole("admin-1", UserRole.USER, "admin-1"),
      ).rejects.toThrow("Cannot change your own role");
    });

    it("updates user role successfully", async () => {
      const updatedUser = {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        role: UserRole.AGENT,
        status: UserStatus.ACTIVE,
      };

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        role: UserRole.USER,
      });
      (prisma.user.update as any).mockResolvedValue(updatedUser);

      const result = await adminService.updateUserRole(
        "user-1",
        UserRole.AGENT,
        "admin-1",
      );

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { role: UserRole.AGENT },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });
    });

    it("throws if user not found", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        adminService.updateUserRole("missing-user", UserRole.AGENT, "admin-1"),
      ).rejects.toThrow("User not found");
    });
  });

  describe("updateUserStatus", () => {
    it("prevents changing own status", async () => {
      await expect(
        adminService.updateUserStatus(
          "admin-1",
          UserStatus.SUSPENDED,
          "admin-1",
        ),
      ).rejects.toThrow("Cannot change your own status");
    });

    it("updates user status successfully", async () => {
      const updatedUser = {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        role: UserRole.USER,
        status: UserStatus.SUSPENDED,
      };

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        status: UserStatus.ACTIVE,
      });
      (prisma.user.update as any).mockResolvedValue(updatedUser);

      const result = await adminService.updateUserStatus(
        "user-1",
        UserStatus.SUSPENDED,
        "admin-1",
      );

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { status: UserStatus.SUSPENDED },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });
    });

    it("throws if user not found", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        adminService.updateUserStatus(
          "missing-user",
          UserStatus.SUSPENDED,
          "admin-1",
        ),
      ).rejects.toThrow("User not found");
    });
  });
});
