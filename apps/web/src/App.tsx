import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Landing
import { LandingPage } from "./features/landing/LandingPage";

// Auth
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  ProtectedRoute,
  AdminRoute,
  AuthInitializer,
} from "./features/auth";

// Dashboard Features
import { DashboardOverview } from "./features/dashboard";
import { PoliciesPage, PolicyDetailsPage } from "./features/policies";
import { ClaimsPage, ClaimDetailsPage } from "./features/claims";
import { BrowsePoliciesPage, PolicyInfoPage } from "./features/browse";
import { PaymentsPage } from "./features/payments";
import { SettingsPage } from "./features/settings";

// Admin imports
import {
  AdminLayout,
  AnalyticsDashboard,
  UsersPage,
  AdminPoliciesPage,
  AdminClaimsPage,
  PaymentsOverviewPage,
  AdminSettingsPage,
} from "./features/admin";

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      {/* Hydrates user state from the API on page load if a token exists */}
      <AuthInitializer />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        containerStyle={{
          top: 20,
          zIndex: 99999,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "420px",
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
            maxWidth: "420px",
            width: "calc(100% - 2rem)",
            margin: "0 auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          success: {
            iconTheme: {
              primary: "hsl(var(--success, 142 76% 36%))",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "hsl(var(--destructive))",
              secondary: "white",
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route
              path="policies/:policyNumber"
              element={<PolicyDetailsPage />}
            />
            <Route path="claims" element={<ClaimsPage />} />
            <Route path="claims/:claimId" element={<ClaimDetailsPage />} />
            <Route path="browse" element={<BrowsePoliciesPage />} />
            <Route path="browse/:policyId" element={<PolicyInfoPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Admin Routes - requires ADMIN role */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AnalyticsDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="policies" element={<AdminPoliciesPage />} />
            <Route path="claims" element={<AdminClaimsPage />} />
            <Route path="payments" element={<PaymentsOverviewPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
