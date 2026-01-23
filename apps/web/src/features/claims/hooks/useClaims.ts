import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { claimsApi, type NewClaimPayload } from "../api";

export function useClaims() {
    return useQuery({
        queryKey: ["claims"],
        queryFn: claimsApi.getClaims,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useClaimDetails(claimId: string) {
    return useQuery({
        queryKey: ["claims", claimId],
        queryFn: () => claimsApi.getClaimById(claimId),
        staleTime: 1000 * 60 * 5,
        enabled: !!claimId,
    });
}

export function usePoliciesForClaim() {
    return useQuery({
        queryKey: ["policies", "forClaim"],
        queryFn: claimsApi.getPoliciesForClaim,
        staleTime: 1000 * 60 * 5,
    });
}

export function useSubmitClaim() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: NewClaimPayload) => claimsApi.submitClaim(payload),
        onSuccess: () => {
            // Invalidate claims cache to refetch
            queryClient.invalidateQueries({ queryKey: ["claims"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}
