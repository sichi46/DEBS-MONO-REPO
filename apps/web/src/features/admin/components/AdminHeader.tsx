import { useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { Search, Sun, Moon, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { userAtom } from "@/features/auth";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/admin": "Analytics Dashboard",
  "/admin/users": "User Management",
  "/admin/policies": "All Policies",
  "/admin/claims": "Claims Management",
  "/admin/payments": "Payments Overview",
  "/admin/settings": "Admin Settings",
};

function useDarkMode() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  };
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);
  return { dark, toggle };
}

export function AdminHeader() {
  const location = useLocation();
  const user = useRecoilValue(userAtom);
  const { dark, toggle } = useDarkMode();

  const getPageTitle = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    if (location.pathname.startsWith("/admin/users/")) return "User Details";
    if (location.pathname.startsWith("/admin/policies/"))
      return "Policy Details";
    if (location.pathname.startsWith("/admin/claims/")) return "Claim Details";
    return "Admin Dashboard";
  };

  return (
    <header className="hidden lg:flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6 gap-4">
      <h1 className="text-base font-semibold text-foreground shrink-0">
        {getPageTitle()}
      </h1>

      {/* Search bar */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full h-8 pl-9 pr-4 text-sm bg-muted/60 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <div className="ml-2 h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          {(user?.name ?? "AD")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <span className="text-sm font-medium text-foreground ml-1.5">
          {user?.name?.split(" ")[0] ?? "Admin"}
        </span>
      </div>
    </header>
  );
}
