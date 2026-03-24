import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getDashboardStats,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMonthlyData(year?: number) {
  return useQuery({
    queryKey: ["admin", "monthly", year],
    queryFn: () => adminApi.getMonthlyData(year),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePolicyDistribution() {
  return useQuery({
    queryKey: ["admin", "policyDistribution"],
    queryFn: adminApi.getPolicyDistribution,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.getUsers(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminPolicies(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin", "policies", params],
    queryFn: () => adminApi.getPolicies(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminClaims(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin", "claims", params],
    queryFn: () => adminApi.getClaims(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin", "payments", params],
    queryFn: () => adminApi.getPayments(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateClaimStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "claims"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
