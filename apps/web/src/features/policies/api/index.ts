import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Policy, PolicyDetails, CreatePolicyData } from "../types";

export const policiesApi = {
  /**
   * Fetch all policies for the user
   */
  getPolicies: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<Policy[]> => {
    const { data } = await api.get<
      ApiResponse<{ policies: Policy[]; pagination: any }>
    >("/policies", { params });
    return data.data.policies;
  },

  /**
   * Fetch a single policy by ID (backend uses ID, not policy number for single fetch route usually, checking routes...)
   * Route is /:id. The previous mock used policyNumber.
   * Let's adapt client to use ID if possible, or search by number if backend supports it.
   * Backend service has getPolicyByNumber but controller uses getPolicyById on /:id.
   * I will assume we use ID here.
   */
  getPolicyById: async (id: string): Promise<PolicyDetails> => {
    const { data } = await api.get<ApiResponse<{ policy: PolicyDetails }>>(
      `/policies/${id}`,
    );
    return data.data.policy;
  },

  /**
   * Create a new policy
   */
  createPolicy: async (
    policyData: CreatePolicyData,
  ): Promise<ApiResponse<{ policy: Policy }>> => {
    const { data } = await api.post<ApiResponse<{ policy: Policy }>>(
      "/policies",
      policyData,
    );
    return data;
  },
};
