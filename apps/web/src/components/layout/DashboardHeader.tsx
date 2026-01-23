import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

import { mockUser } from "@/lib/mock-data";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Map routes to page titles
const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/policies": "My Policies",
    "/dashboard/claims": "Claims",
    "/dashboard/payments": "Payments",
    "/dashboard/browse": "Browse Policies",
    "/dashboard/settings": "Settings",
};

export function DashboardHeader() {
    const location = useLocation();

    // Use mock user for UI development
    const displayUser = mockUser;

    // Get page title from route
    const getPageTitle = () => {
        // Check for exact match first
        if (pageTitles[location.pathname]) {
            return pageTitles[location.pathname];
        }
        // Check for policy details page
        if (location.pathname.startsWith("/dashboard/policies/")) {
            return "Policy Details";
        }
        return "Dashboard";
    };

    return (
        <header className="hidden lg:flex h-14 items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-6" />

                {/* Page Title */}
                <h1 className="text-lg font-semibold text-foreground">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* User Greeting */}
                <span className="text-sm text-muted-foreground">
                    Welcome, <span className="font-medium text-foreground">{displayUser.name}</span>
                </span>
            </div>
        </header>
    );
}
