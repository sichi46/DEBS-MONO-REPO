import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

// Types
export interface CreatePolicyParams {
    userId: string;
    policyTypeId: string;
    coverageAmount: number;
    premiumAmount: number; // Initially calculated/estimated
    paymentFrequency: "Monthly" | "Quarterly" | "Annually"; // Added to params logic if needed
    beneficiaries: {
        name: string;
        relationship: string;
        percentage: number;
        phone?: string;
        email?: string;
    }[];
}

export interface GetPoliciesParams {
    userId: string;
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
}

export const policiesService = {
    /**
     * Get all policies for a user with pagination and filtering
     */
    async getUserPolicies(params: GetPoliciesParams) {
        const { userId, page = 1, limit = 10, status, type } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.PolicyWhereInput = {
            userId,
            ...(status && { status: status as any }),
            ...(type && { policyTypeId: type }),
        };

        const [policies, total] = await Promise.all([
            prisma.policy.findMany({
                where,
                skip,
                take: limit,
                include: {
                    policyType: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.policy.count({ where }),
        ]);

        return {
            policies,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Get a single policy by ID
     */
    async getPolicyById(id: string, userId: string) {
        const policy = await prisma.policy.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                policyType: true,
                beneficiaries: true,
                payments: {
                    take: 5,
                    orderBy: { date: "desc" }, // Wait, checking schema for 'date' field
                },
                claims: {
                    take: 5,
                    orderBy: { submittedAt: "desc" },
                },
            },
        });

        return policy;
    },

    /**
     * Get a single policy by Policy Number
     */
    async getPolicyByNumber(policyNumber: string, userId: string) {
        return prisma.policy.findFirst({
            where: {
                policyNumber,
                userId,
            },
            include: {
                policyType: true,
                beneficiaries: true,
            },
        });
    },

    /**
     * Create a new policy application
     */
    async createPolicy(data: CreatePolicyParams) {
        if (data.coverageAmount <= 0) {
            throw new Error("Coverage amount must be positive");
        }

        const policyType = await prisma.policyType.findUnique({
            where: { id: data.policyTypeId },
            select: { minPremium: true },
        });

        if (!policyType) {
            throw new Error("Invalid policy type");
        }

        const premiumAmount = new Prisma.Decimal(data.premiumAmount);
        if (premiumAmount.lessThan(policyType.minPremium)) {
            throw new Error("Premium amount below minimum for policy type");
        }

        // Generate a unique policy number
        const year = new Date().getFullYear();
        const random = Math.floor(100000 + Math.random() * 900000);
        // Fetch policy type code/prefix if needed, for now hardcode generic prefix
        const policyNumber = `POL-${year}-${random}`;

        return prisma.policy.create({
            data: {
                policyNumber,
                userId: data.userId,
                policyTypeId: data.policyTypeId,
                coverageAmount: data.coverageAmount,
                premiumAmount: data.premiumAmount,
                status: "PENDING",
                startDate: null, // Set upon approval
                endDate: null,
                beneficiaries: {
                    create: data.beneficiaries,
                },
            },
            include: {
                policyType: true,
                beneficiaries: true,
            },
        });
    },
};
