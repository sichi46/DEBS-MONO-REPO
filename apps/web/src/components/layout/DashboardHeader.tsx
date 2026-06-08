import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  Sun,
  Moon,
  Bell,
  Search,
  LayoutDashboard,
  Shield,
  FileText,
  CreditCard,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { userAtom } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { usePolicies } from "@/features/policies";
import { useClaims } from "@/features/claims";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/policies": "My Policies",
  "/dashboard/claims": "Claims",
  "/dashboard/payments": "Payments",
  "/dashboard/browse": "Browse Policies",
  "/dashboard/settings": "Settings",
};

const NAV_SHORTCUTS = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "My Policies", path: "/dashboard/policies", Icon: Shield },
  { label: "Claims", path: "/dashboard/claims", Icon: FileText },
  { label: "Payments", path: "/dashboard/payments", Icon: CreditCard },
];

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

export function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);
  const { dark, toggle } = useDarkMode();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: policiesData } = usePolicies();
  const { data: claimsData } = useClaims();

  const policies = Array.isArray(policiesData) ? policiesData : [];
  const claims = claimsData?.claims ?? [];

  const q = query.toLowerCase().trim();

  const matchedPages = q
    ? NAV_SHORTCUTS.filter((p) => p.label.toLowerCase().includes(q))
    : NAV_SHORTCUTS;

  const matchedPolicies =
    q.length >= 2
      ? policies
          .filter(
            (p) =>
              p.policyNumber.toLowerCase().includes(q) ||
              (p.policyType?.name ?? "").toLowerCase().includes(q),
          )
          .slice(0, 3)
      : [];

  const matchedClaims =
    q.length >= 2
      ? claims
          .filter(
            (c) =>
              c.claimId.toLowerCase().includes(q) ||
              c.claimType.toLowerCase().includes(q) ||
              c.policyNumber.toLowerCase().includes(q),
          )
          .slice(0, 3)
      : [];

  const hasResults =
    matchedPages.length > 0 ||
    matchedPolicies.length > 0 ||
    matchedClaims.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setQuery("");
    setOpen(false);
  };

  const getPageTitle = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    if (location.pathname.startsWith("/dashboard/policies/"))
      return "Policy Details";
    if (location.pathname.startsWith("/dashboard/claims/"))
      return "Claim Details";
    return "Dashboard";
  };

  return (
    <header className="hidden lg:flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6 gap-4">
      <h1 className="text-base font-semibold text-foreground shrink-0">
        {getPageTitle()}
      </h1>

      {/* Search bar */}
      <div className="flex-1 max-w-sm relative" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
            }}
            className="w-full h-8 pl-9 pr-8 text-sm bg-muted/60 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
          {query && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden py-1">
            {!hasResults && (
              <p className="text-sm text-muted-foreground px-4 py-3">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {matchedPages.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-4 pt-2 pb-1">
                  Pages
                </p>
                {matchedPages.map((page) => (
                  <button
                    key={page.path}
                    onClick={() => handleSelect(page.path)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <page.Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    {page.label}
                  </button>
                ))}
              </>
            )}

            {matchedPolicies.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-4 pt-2 pb-1">
                  Policies
                </p>
                {matchedPolicies.map((policy) => (
                  <button
                    key={policy.id}
                    onClick={() =>
                      handleSelect(`/dashboard/policies/${policy.policyNumber}`)
                    }
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{policy.policyNumber}</span>
                    {policy.policyType?.name && (
                      <span className="text-muted-foreground text-xs">
                        {policy.policyType.name}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}

            {matchedClaims.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-4 pt-2 pb-1">
                  Claims
                </p>
                {matchedClaims.map((claim) => (
                  <button
                    key={claim.claimId}
                    onClick={() =>
                      handleSelect(`/dashboard/claims/${claim.claimId}`)
                    }
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{claim.claimId}</span>
                    <span className="text-muted-foreground text-xs">
                      {claim.claimType}
                    </span>
                  </button>
                ))}
              </>
            )}

            <div className="border-t border-border mt-1 px-4 py-1.5">
              <p className="text-[11px] text-muted-foreground">
                Press{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">
                  Esc
                </kbd>{" "}
                to close
              </p>
            </div>
          </div>
        )}
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
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-accent" />
        </Button>
        <div className="ml-2 h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          {(user?.name ?? "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <span className="text-sm font-medium text-foreground ml-1.5">
          {user?.name?.split(" ")[0] ?? "User"}
        </span>
      </div>
    </header>
  );
}
