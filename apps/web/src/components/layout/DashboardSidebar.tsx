import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  LayoutDashboard,
  Shield,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  userAtom,
  accessTokenAtom,
  refreshTokenAtom,
  isAuthenticatedAtom,
} from "@/features/auth";
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
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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

function DebsMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id="sb-shield"
          x1="24"
          y1="3.5"
          x2="24"
          y2="39"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2D6BD4" />
          <stop offset="1" stopColor="#0D3C85" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5l15 5.2v10.8c0 9.7-6.4 16.8-15 19.5C15.4 36.3 9 29.2 9 19.5V8.7z"
        fill="url(#sb-shield)"
      />
      <path
        d="M15.5 27.5L24 19l8.5 8.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".95"
        fill="none"
      />
      <path
        d="M15.5 21L24 12.5l8.5 8.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".42"
        fill="none"
      />
      <circle cx="24" cy="11" r="2.4" fill="#DB8E2C" />
    </svg>
  );
}

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Policies", path: "/dashboard/policies", icon: Shield },
  { name: "Claims", path: "/dashboard/claims", icon: FileText },
  { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
];

const discoverItems = [
  {
    name: "Browse Plans",
    path: "/dashboard/browse",
    icon: SearchIcon,
    badge: "New",
  },
];

const accountItems = [
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const user = useRecoilValue(userAtom);
  const setUser = useSetRecoilState(userAtom);
  const setAccessToken = useSetRecoilState(accessTokenAtom);
  const setRefreshToken = useSetRecoilState(refreshTokenAtom);
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const navItemClass = (active: boolean) =>
    [
      "text-[14.5px] transition-colors",
      active
        ? "font-bold text-sidebar-accent-foreground bg-sidebar-accent"
        : "font-semibold text-muted-foreground hover:text-sidebar-foreground",
    ].join(" ");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* ── Header ── */}
      <SidebarHeader className="h-14 px-3 flex flex-row items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <DebsMark size={26} />
          {!isCollapsed && (
            <span className="text-[15px] font-bold text-sidebar-foreground truncate">
              Debs{" "}
              <span className="text-[color:var(--color-brand-accent)]">
                Insurance
              </span>
            </span>
          )}
        </div>
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="h-6 w-6 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="py-3 overflow-hidden">
        {/* MENU */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] font-bold tracking-[.12em] uppercase text-muted-foreground/70 px-3 mb-1">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path} className="relative">
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
                    )}
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={navItemClass(active)}
                    >
                      <Link to={item.path}>
                        <Icon className="h-[18px] w-[18px]" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* DISCOVER */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10.5px] font-bold tracking-[.12em] uppercase text-muted-foreground/70 px-3 mb-1">
            Discover
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {discoverItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path} className="relative">
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
                    )}
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={navItemClass(active)}
                    >
                      <Link to={item.path}>
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="flex-1">{item.name}</span>
                        {!isCollapsed && item.badge && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground leading-none">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ACCOUNT */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10.5px] font-bold tracking-[.12em] uppercase text-muted-foreground/70 px-3 mb-1">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path} className="relative">
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
                    )}
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={navItemClass(active)}
                    >
                      <Link to={item.path}>
                        <Icon className="h-[18px] w-[18px]" />
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

      {/* ── Footer ── */}
      <SidebarFooter
        className={`overflow-hidden ${isCollapsed ? "p-2" : "p-4"}`}
      >
        {!isCollapsed && <Separator className="mb-3" />}

        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
            {getInitials(user?.name)}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </span>
            </div>
          )}
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setShowLogoutDialog(true)}
              tooltip="Logout"
              className="text-[14px] font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

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
    </Sidebar>
  );
}
