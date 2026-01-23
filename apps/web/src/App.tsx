import { Route, Routes, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
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
            <Routes>
                {/* Redirect root to dashboard for now */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard Routes - No protection during UI development */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardOverview />} />
                    <Route path="policies" element={<PoliciesPage />} />
                    <Route path="policies/:policyNumber" element={<PolicyDetailsPage />} />
                    <Route path="claims" element={<ClaimsPage />} />
                    <Route path="claims/:claimId" element={<ClaimDetailsPage />} />
                    <Route path="browse" element={<BrowsePoliciesPage />} />
                    <Route path="browse/:policyId" element={<PolicyInfoPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Admin Routes - RBAC will be implemented with backend */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AnalyticsDashboard />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="policies" element={<AdminPoliciesPage />} />
                    <Route path="claims" element={<AdminClaimsPage />} />
                    <Route path="payments" element={<PaymentsOverviewPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;


