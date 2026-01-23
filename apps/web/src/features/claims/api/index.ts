import {
    mockClaims,
    mockClaimStats,
    mockPolicies,
    getClaimById,
} from "@/lib/mock-data";
import type { Claim, ClaimStats, Policy } from "@/lib/mock-data";

// Simulated API delay for realistic loading states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ClaimsData {
    claims: Claim[];
    stats: ClaimStats;
}

export interface NewClaimPayload {
    policyNumber: string;
    claimType: string;
    amount: number;
    dateOfIncident: string;
    description: string;
}

export const claimsApi = {
    /**
     * Fetch all claims for the user
     */
    getClaims: async (): Promise<ClaimsData> => {
        await delay(400);
        return {
            claims: mockClaims,
            stats: mockClaimStats,
        };
    },

    /**
     * Fetch a single claim by ID
     */
    getClaimById: async (claimId: string): Promise<Claim | null> => {
        await delay(300);
        return getClaimById(claimId) || null;
    },

    /**
     * Fetch policies for claim selection dropdown
     */
    getPoliciesForClaim: async (): Promise<Policy[]> => {
        await delay(200);
        // Only return active policies
        return mockPolicies.filter((p) => p.status === "Active");
    },

    /**
     * Submit a new claim
     */
    submitClaim: async (payload: NewClaimPayload): Promise<Claim> => {
        await delay(800);
        // In real app, this would POST to backend
        const newClaim: Claim = {
            claimId: `CLM-${Date.now()}`,
            policyNumber: payload.policyNumber,
            policyType: mockPolicies.find((p) => p.policyNumber === payload.policyNumber)?.policyType || "Unknown",
            claimType: payload.claimType,
            status: "Pending",
            claimAmount: `ZMW ${payload.amount.toLocaleString()}`,
            dateSubmitted: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            dateProcessed: "—",
            description: payload.description,
        };
        return newClaim;
    },
};
