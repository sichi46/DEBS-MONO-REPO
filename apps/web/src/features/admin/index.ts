// Layout
export { AdminLayout } from "./components/AdminLayout";
export { AdminSidebar } from "./components/AdminSidebar";
export { AdminHeader } from "./components/AdminHeader";
export { AdminMobileHeader } from "./components/AdminMobileHeader";

// Pages
export { AnalyticsDashboard } from "./components/AnalyticsDashboard";
export { UsersPage } from "./components/UsersPage";
export { AdminPoliciesPage } from "./components/AdminPoliciesPage";
export { AdminClaimsPage } from "./components/AdminClaimsPage";
export { PaymentsOverviewPage } from "./components/PaymentsOverviewPage";
export { AdminSettingsPage } from "./components/AdminSettingsPage";

// API
export { adminApi } from "./api";

// Hooks
export {
  useAdminStats,
  useMonthlyData,
  usePolicyDistribution,
  useAdminUsers,
  useAdminPolicies,
  useAdminClaims,
  useAdminPayments,
  useUpdateUserRole,
  useUpdateUserStatus,
  useUpdateClaimStatus,
} from "./hooks/useAdmin";
