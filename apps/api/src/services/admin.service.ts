import { Prisma, UserRole, UserStatus, ClaimStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const POLICY_TYPE_COLORS: Record<string, string> = {
  "Life Insurance": "#0057B7",
  "Health Insurance": "#22C55E",
  "Auto Insurance": "#F59E0B",
  "Home Insurance": "#8B5CF6",
  "Travel Insurance": "#EC4899",
  "Business Insurance": "#06B6D4",
};

function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString("en-US")}`;
}

export const adminService = {
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalPolicies,
      activePolicies,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      revenueResult,
      payoutsResult,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.policy.count(),
      prisma.policy.count({ where: { status: "ACTIVE" } }),
      prisma.claim.count(),
      prisma.claim.count({ where: { status: "PENDING" } }),
      prisma.claim.count({ where: { status: "APPROVED" } }),
      prisma.claim.count({ where: { status: "REJECTED" } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID" },
      }),
      prisma.claim.aggregate({
        _sum: { amount: true },
        where: { status: "APPROVED" },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.amount || 0);
    const totalPayouts = Number(payoutsResult._sum.amount || 0);

    // Monthly figures (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [monthlyRevenueResult, monthlyPayoutsResult] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID", paidAt: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.claim.aggregate({
        _sum: { amount: true },
        where: {
          status: "APPROVED",
          processedAt: { gte: monthStart, lt: monthEnd },
        },
      }),
    ]);

    const monthlyRevenue = Number(monthlyRevenueResult._sum.amount || 0);
    const monthlyPayouts = Number(monthlyPayoutsResult._sum.amount || 0);

    return {
      totalUsers,
      activeUsers,
      totalPolicies,
      activePolicies,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      totalRevenue: formatZMW(totalRevenue),
      monthlyRevenue: formatZMW(monthlyRevenue),
      totalPayouts: formatZMW(totalPayouts),
      monthlyPayouts: formatZMW(monthlyPayouts),
    };
  },

  async getMonthlyData(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = [];

    for (let month = 0; month < 12; month++) {
      const start = new Date(targetYear, month, 1);
      const end = new Date(targetYear, month + 1, 1);

      const [revenueRes, payoutsRes, newPolicies, claims] = await Promise.all([
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: "PAID", paidAt: { gte: start, lt: end } },
        }),
        prisma.claim.aggregate({
          _sum: { amount: true },
          where: { status: "APPROVED", processedAt: { gte: start, lt: end } },
        }),
        prisma.policy.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.claim.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);

      result.push({
        month: months[month],
        revenue: Number(revenueRes._sum.amount || 0),
        payouts: Number(payoutsRes._sum.amount || 0),
        newPolicies,
        claims,
      });
    }

    return result;
  },

  async getPolicyDistribution() {
    const policyTypes = await prisma.policyType.findMany({
      include: { _count: { select: { policies: true } } },
    });

    const totalPolicies = policyTypes.reduce(
      (sum, pt) => sum + pt._count.policies,
      0,
    );

    return policyTypes.map((pt) => ({
      type: pt.name,
      count: pt._count.policies,
      percentage:
        totalPolicies > 0
          ? Math.round((pt._count.policies / totalPolicies) * 100)
          : 0,
      color: POLICY_TYPE_COLORS[pt.name] || "#6B7280",
    }));
  },

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, search, role, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(role && role !== "all" && { role: role.toUpperCase() as UserRole }),
      ...(status &&
        status !== "all" && { status: status.toUpperCase() as UserStatus }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { policies: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      avatarInitials: u.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      role: u.role.toLowerCase(),
      status: u.status.toLowerCase(),
      joinDate: u.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastActive: u.lastLoginAt ? getRelativeTime(u.lastLoginAt) : "Never",
      policiesCount: u._count.policies,
      totalPremiums: "ZMW 0", // Would need aggregation per user
    }));

    return {
      users: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateUserRole(userId: string, role: UserRole, adminUserId: string) {
    if (userId === adminUserId) {
      throw new Error("Cannot change your own role");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  },

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    adminUserId: string,
  ) {
    if (userId === adminUserId) {
      throw new Error("Cannot change your own status");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    return prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  },

  async getAllPolicies(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PolicyWhereInput = {
      ...(status &&
        status !== "all" && { status: status.toUpperCase() as any }),
      ...(search && {
        OR: [
          { policyNumber: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        skip,
        take: limit,
        include: {
          policyType: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.policy.count({ where }),
    ]);

    const formatted = policies.map((p) => ({
      policyNumber: p.policyNumber,
      policyType: p.policyType.name,
      status: p.status.charAt(0) + p.status.slice(1).toLowerCase(),
      coverageAmount: formatZMW(Number(p.coverageAmount)),
      premiumAmount: formatZMW(Number(p.premiumAmount)),
      paymentFrequency: "Monthly" as const,
      startDate: p.startDate
        ? p.startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Pending Approval",
      endDate: p.endDate
        ? p.endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
      userId: p.user.id,
      userName: p.user.name,
      userEmail: p.user.email,
    }));

    return {
      policies: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getAllClaims(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ClaimWhereInput = {
      ...(status &&
        status !== "all" && {
          status: status.toUpperCase().replace(" ", "_") as any,
        }),
      ...(search && {
        OR: [
          { claimNumber: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          {
            policy: { policyNumber: { contains: search, mode: "insensitive" } },
          },
        ],
      }),
    };

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: limit,
        include: {
          policy: { include: { policyType: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.claim.count({ where }),
    ]);

    const statusMap: Record<string, string> = {
      PENDING: "Pending",
      UNDER_REVIEW: "Under Review",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    };

    const formatted = claims.map((c) => ({
      claimId: c.claimNumber,
      policyNumber: c.policy.policyNumber,
      policyType: c.policy.policyType.name,
      claimType: c.claimType,
      status: statusMap[c.status] || c.status,
      claimAmount: formatZMW(Number(c.amount)),
      dateSubmitted: c.submittedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      dateProcessed: c.processedAt
        ? c.processedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
      description: c.description,
      userId: c.user.id,
      userName: c.user.name,
      userEmail: c.user.email,
    }));

    return {
      claims: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    adminUserId: string,
  ) {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) throw new Error("Claim not found");

    return prisma.claim.update({
      where: { id: claimId },
      data: {
        status,
        processedAt: new Date(),
        processedBy: adminUserId,
      },
    });
  },

  async getAllPayments(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(status &&
        status !== "all" && { status: status.toUpperCase() as any }),
      ...(search && {
        OR: [
          {
            policy: { policyNumber: { contains: search, mode: "insensitive" } },
          },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          policy: { include: { policyType: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    const methodMap: Record<string, string> = {
      MOBILE_MONEY: "Mobile Money",
      BANK_TRANSFER: "Bank Transfer",
      CARD: "Card",
    };

    const statusMap: Record<string, string> = {
      PAID: "Paid",
      PENDING: "Pending",
      FAILED: "Failed",
    };

    const formatted = payments.map((p) => ({
      id: p.id,
      date: (p.paidAt || p.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      amount: formatZMW(Number(p.amount)),
      status: statusMap[p.status] || p.status,
      method: methodMap[p.method] || p.method,
      policyNumber: p.policy.policyNumber,
      policyType: p.policy.policyType.name,
      userId: p.user.id,
      userName: p.user.name,
    }));

    return {
      payments: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
