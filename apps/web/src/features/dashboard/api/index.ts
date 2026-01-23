import {
    mockDashboardStats,
    mockPolicies,
    mockClaims,
    mockAvailablePolicies,
} from "@/lib/mock-data";
import type { DashboardData } from "../types";

// Simulated API delay for realistic loading states
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardApi = {
    /**
     * Fetch all dashboard data
     * TODO: Replace with real API call when backend is ready
     */
    getDashboardData: async (): Promise<DashboardData> => {
        await delay(500); // Simulate network delay
        return {
            stats: mockDashboardStats,
            recentPolicies: mockPolicies.slice(0, 3),
            recentClaims: mockClaims.slice(0, 3),
            availablePolicies: mockAvailablePolicies,
        };
    },

    /**
     * Fetch dashboard stats only
     */
    getStats: async () => {
        await delay(300);
        return mockDashboardStats;
    },

    /**
     * Fetch recent policies
     */
    getRecentPolicies: async () => {
        await delay(300);
        return mockPolicies.slice(0, 3);
    },

    /**
     * Fetch recent claims
     */
    getRecentClaims: async () => {
        await delay(300);
        return mockClaims.slice(0, 3);
    },
};
