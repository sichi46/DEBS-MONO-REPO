import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useRecoilValue, useResetRecoilState } from "recoil";

import {
  userAtom,
  accessTokenAtom,
  refreshTokenAtom,
  isAuthenticatedAtom,
} from "@/features/auth/state/atoms";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const user = useRecoilValue(userAtom);
  const resetUser = useResetRecoilState(userAtom);
  const resetAccessToken = useResetRecoilState(accessTokenAtom);
  const resetRefreshToken = useResetRecoilState(refreshTokenAtom);
  const resetIsAuthenticated = useResetRecoilState(isAuthenticatedAtom);

  const avatarInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    resetUser();
    resetAccessToken();
    resetRefreshToken();
    resetIsAuthenticated();
    setOpen(false);
    setShowLogoutDialog(false);
    navigate("/login");
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
        <span className="text-lg font-bold text-primary">DEBS Admin</span>
      </div>

      {/* Hamburger Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-56 p-0 flex flex-col">
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
          <nav className="flex-1 flex flex-col p-3 space-y-1">
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer with User Info */}
          <div className="mt-auto p-3 border-t border-border bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {avatarInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {user?.name || "Admin"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Administrator
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowLogoutDialog(true)}
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and will need to sign in
              again to access the admin portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
