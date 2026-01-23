import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";

import { mockAdminUser } from "@/lib/mock-data";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// Map routes to page titles
const pageTitles: Record<string, string> = {
    "/admin": "Analytics Dashboard",
    "/admin/users": "User Management",
    "/admin/policies": "All Policies",
    "/admin/claims": "Claims Management",
    "/admin/payments": "Payments Overview",
    "/admin/settings": "Admin Settings",
};

export function AdminHeader() {
    const location = useLocation();
    const displayUser = mockAdminUser;

    // Get page title from route
    const getPageTitle = () => {
        if (pageTitles[location.pathname]) {
            return pageTitles[location.pathname];
        }
        if (location.pathname.startsWith("/admin/users/")) {
            return "User Details";
        }
        if (location.pathname.startsWith("/admin/policies/")) {
            return "Policy Details";
        }
        if (location.pathname.startsWith("/admin/claims/")) {
            return "Claim Details";
        }
        return "Admin Dashboard";
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
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-64 pl-8 h-9"
                    />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* User Greeting */}
                <span className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{displayUser.name}</span>
                </span>
            </div>
        </header>
    );
}
