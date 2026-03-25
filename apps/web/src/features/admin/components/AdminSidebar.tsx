import { Link, useLocation } from "react-router-dom";
import { useRecoilValue, useResetRecoilState } from "recoil";
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

import {
  userAtom,
  accessTokenAtom,
  refreshTokenAtom,
  isAuthenticatedAtom,
} from "@/features/auth/state/atoms";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { name: "Analytics", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Policies", path: "/admin/policies", icon: FileText },
  { name: "Claims", path: "/admin/claims", icon: ClipboardList },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
    window.location.href = "/login";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header — h-14 matches top bar height for alignment */}
      <SidebarHeader className="h-14 px-4 flex flex-row items-center gap-3 border-b border-sidebar-border">
        <SidebarTrigger className="shrink-0" />
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold text-primary truncate">
              DEBS Admin
            </span>
            <Badge variant="secondary" className="w-fit text-xs">
              Admin Portal
            </Badge>
          </div>
        )}
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent className="py-4 overflow-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive =
                  item.path === "/admin"
                    ? location.pathname === "/admin"
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
      <SidebarFooter
        className={`overflow-hidden ${isCollapsed ? "p-2" : "p-4"}`}
      >
        {!isCollapsed && <Separator className="mb-4" />}

        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
            {avatarInitials}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || "Admin"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Administrator
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
