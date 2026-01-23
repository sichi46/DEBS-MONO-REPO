import {
    mockPolicies,
    getPolicyByNumber,
    getBeneficiariesForPolicy,
    getPaymentHistoryForPolicy,
    getClaimsForPolicy,
} from "@/lib/mock-data";
import type { Policy, Beneficiary, PaymentRecord, Claim } from "@/lib/mock-data";

// Simulated API delay for realistic loading states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PolicyDetails extends Policy {
    beneficiaries: Beneficiary[];
    paymentHistory: PaymentRecord[];
    claims: Claim[];
}

export const policiesApi = {
    /**
     * Fetch all policies for the user
     */
    getPolicies: async (): Promise<Policy[]> => {
        await delay(400);
        return mockPolicies;
    },

    /**
     * Fetch a single policy by policy number with full details
     */
    getPolicyDetails: async (policyNumber: string): Promise<PolicyDetails | null> => {
        await delay(400);
        const policy = getPolicyByNumber(policyNumber);
        if (!policy) return null;

        return {
            ...policy,
            beneficiaries: getBeneficiariesForPolicy(policyNumber),
            paymentHistory: getPaymentHistoryForPolicy(policyNumber),
            claims: getClaimsForPolicy(policyNumber),
        };
    },
};
