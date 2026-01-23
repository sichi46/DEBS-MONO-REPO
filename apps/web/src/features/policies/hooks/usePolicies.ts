import { useQuery } from "@tanstack/react-query";
import { policiesApi } from "../api";

export function usePolicies() {
    return useQuery({
        queryKey: ["policies"],
        queryFn: policiesApi.getPolicies,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function usePolicyDetails(policyNumber: string) {
    return useQuery({
        queryKey: ["policies", policyNumber],
        queryFn: () => policiesApi.getPolicyDetails(policyNumber),
        staleTime: 1000 * 60 * 5,
        enabled: !!policyNumber,
    });
}
