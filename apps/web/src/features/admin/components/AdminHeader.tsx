import { useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { Search } from "lucide-react";

import { userAtom } from "@/features/auth";
import { Input } from "@/components/ui/input";

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
  const user = useRecoilValue(userAtom);

  const getPageTitle = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    if (location.pathname.startsWith("/admin/users/")) return "User Details";
    if (location.pathname.startsWith("/admin/policies/"))
      return "Policy Details";
    if (location.pathname.startsWith("/admin/claims/")) return "Claim Details";
    return "Admin Dashboard";
  };

  return (
    <header className="hidden lg:flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-lg font-semibold text-foreground">
        {getPageTitle()}
      </h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8 h-9"
          />
        </div>

        {/* User */}
        <span className="text-sm font-medium text-foreground">
          {user?.name || "Admin"}
        </span>
      </div>
    </header>
  );
}
