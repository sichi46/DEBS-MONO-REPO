import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useState } from "react";
import {
  Menu,
  LayoutDashboard,
  Shield,
  FileText,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

import {
  userAtom,
  accessTokenAtom,
  refreshTokenAtom,
  isAuthenticatedAtom,
} from "@/features/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Policies", path: "/dashboard/policies", icon: Shield },
  { name: "Claims", path: "/dashboard/claims", icon: FileText },
  { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);
  const setUser = useSetRecoilState(userAtom);
  const setAccessToken = useSetRecoilState(accessTokenAtom);
  const setRefreshToken = useSetRecoilState(refreshTokenAtom);
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Generate user initials
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
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
        <span className="text-lg font-bold text-primary">Debs Insurance</span>
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
              <span className="text-lg font-bold text-primary">
                Debs Insurance
              </span>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col p-3 space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
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
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {getInitials(user?.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowLogoutDialog(true)}
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5 mr-2" />
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
              again to access your account.
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
