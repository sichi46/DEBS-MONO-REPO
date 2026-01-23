import { Link, useLocation } from "react-router-dom";
import {
    Menu,
    LayoutDashboard,
    Users,
    FileText,
    ClipboardList,
    CreditCard,
    Settings,
    LogOut,
    Shield,
} from "lucide-react";
import { useState } from "react";

import { mockAdminUser } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
    { name: "Analytics", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Policies", path: "/admin/policies", icon: FileText },
    { name: "Claims", path: "/admin/claims", icon: ClipboardList },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminMobileHeader() {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const displayUser = mockAdminUser;

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const handleNavClick = () => {
        setOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">DEBS Admin</span>
                </div>
            </div>

            {/* Hamburger Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0">
                    <SheetHeader className="p-4 border-b border-border">
                        <SheetTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-lg font-bold text-primary">
                                    DEBS Admin
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                    Admin Portal
                                </Badge>
                            </div>
                        </SheetTitle>
                    </SheetHeader>

                    {/* Navigation */}
                    <nav className="flex flex-col p-4 space-y-1">
                        {navigationItems.map((item) => {
                            const isActive =
                                item.path === "/admin"
                                    ? location.pathname === "/admin"
                                    : location.pathname.startsWith(item.path);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer with User Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                {displayUser.avatarInitials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-foreground truncate">
                                    {displayUser.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    Administrator
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="h-5 w-5 mr-2" />
                            Logout
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}
