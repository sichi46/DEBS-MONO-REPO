import { api } from "@/lib/axios";

export const adminApi = {
  getDashboardStats: () => api.get("/admin/stats").then((r) => r.data.data),

  getMonthlyData: (year?: number) =>
    api
      .get("/admin/stats/monthly", { params: year ? { year } : undefined })
      .then((r) => r.data.data),

  getPolicyDistribution: () =>
    api.get("/admin/stats/policy-distribution").then((r) => r.data.data),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => api.get("/admin/users", { params }).then((r) => r.data.data),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.data),

  updateUserStatus: (id: string, status: string) =>
    api.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data.data),

  getPolicies: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get("/admin/policies", { params }).then((r) => r.data.data),

  getClaims: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get("/admin/claims", { params }).then((r) => r.data.data),

  updateClaimStatus: (id: string, status: string) =>
    api
      .patch(`/admin/claims/${id}/status`, { status })
      .then((r) => r.data.data),

  getPayments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get("/admin/payments", { params }).then((r) => r.data.data),
};
