// Re-export types from mock-data for use in dashboard components
export type {
    Policy,
    Claim,
    DashboardStats,
    AvailablePolicy,
    PolicyStatus,
    ClaimStatus,
} from "@/lib/mock-data";

// Dashboard-specific types
export interface DashboardData {
    stats: import("@/lib/mock-data").DashboardStats;
    recentPolicies: import("@/lib/mock-data").Policy[];
    recentClaims: import("@/lib/mock-data").Claim[];
    availablePolicies: import("@/lib/mock-data").AvailablePolicy[];
}
