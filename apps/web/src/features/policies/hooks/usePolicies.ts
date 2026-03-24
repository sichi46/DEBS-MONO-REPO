import { useQuery } from "@tanstack/react-query";
import { policiesApi } from "../api";

export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn: () => policiesApi.getPolicies(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePolicyDetails(id: string) {
  return useQuery({
    queryKey: ["policies", id],
    queryFn: () => policiesApi.getPolicyById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
