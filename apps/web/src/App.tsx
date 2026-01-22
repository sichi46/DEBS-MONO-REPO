import { Route, Routes } from "react-router-dom";
import { AuthRoutes } from "./features/auth";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

function App() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            <Routes>
                {/* Public & Auth Routes */}
                <Route path="/*" element={<AuthRoutes />} />

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="policies" element={<div>Policies Page</div>} />
                        <Route path="claims" element={<div>Claims Page</div>} />
                        <Route path="payments" element={<div>Payments Page</div>} />
                    </Route>
                </Route>
            </Routes>
        </div>
    );
}

function DashboardHome() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Policies</h3>
                    <p className="text-2xl font-bold mt-2">12</p>
                </div>
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Pending Claims</h3>
                    <p className="text-2xl font-bold mt-2">2</p>
                </div>
                <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Next Payment</h3>
                    <p className="text-2xl font-bold mt-2">$145.00</p>
                    <p className="text-xs text-muted-foreground mt-1">Due in 5 days</p>
                </div>
            </div>
        </div>
    );
}

export default App;
