import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api";

export function useDashboardData() {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: dashboardApi.getDashboardData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useDashboardStats() {
    return useQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: dashboardApi.getStats,
        staleTime: 1000 * 60 * 5,
    });
}

export function useRecentPolicies() {
    return useQuery({
        queryKey: ["dashboard", "recentPolicies"],
        queryFn: dashboardApi.getRecentPolicies,
        staleTime: 1000 * 60 * 5,
    });
}

export function useRecentClaims() {
    return useQuery({
        queryKey: ["dashboard", "recentClaims"],
        queryFn: dashboardApi.getRecentClaims,
        staleTime: 1000 * 60 * 5,
    });
}
