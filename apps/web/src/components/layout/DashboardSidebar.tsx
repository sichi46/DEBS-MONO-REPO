import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Shield,
    FileText,
    CreditCard,
    Settings,
    LogOut,
} from "lucide-react";

import { mockUser } from "@/lib/mock-data";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
    useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Policies", path: "/dashboard/policies", icon: Shield },
    { name: "Claims", path: "/dashboard/claims", icon: FileText },
    { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
    const location = useLocation();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    // Use mock user for UI development
    const displayUser = mockUser;

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            {/* Header with Logo */}
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-primary">
                            Debs Insurance
                        </span>
                    )}
                </div>
            </SidebarHeader>

            <Separator className="mx-4" />

            {/* Navigation Menu */}
            <SidebarContent className="px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => {
                                const isActive =
                                    item.path === "/dashboard"
                                        ? location.pathname === "/dashboard"
                                        : location.pathname.startsWith(item.path);
                                const Icon = item.icon;

                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.name}
                                        >
                                            <Link to={item.path}>
                                                <Icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with User Info and Logout */}
            <SidebarFooter className="p-4">
                <Separator className="mb-4" />

                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
                        {displayUser.avatarInitials || displayUser.name?.charAt(0) || "U"}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-sidebar-foreground truncate">
                                {displayUser.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {displayUser.email}
                            </span>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Logout"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
