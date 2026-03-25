import { useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { userAtom } from "@/features/auth";

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
  const user = useRecoilValue(userAtom);

  const getPageTitle = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    if (location.pathname.startsWith("/dashboard/policies/"))
      return "Policy Details";
    if (location.pathname.startsWith("/dashboard/claims/"))
      return "Claim Details";
    return "Dashboard";
  };

  return (
    <header className="hidden lg:flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-lg font-semibold text-foreground">
        {getPageTitle()}
      </h1>

      <span className="text-sm text-muted-foreground">
        Welcome,{" "}
        <span className="font-medium text-foreground">
          {user?.name || "User"}
        </span>
      </span>
    </header>
  );
}
