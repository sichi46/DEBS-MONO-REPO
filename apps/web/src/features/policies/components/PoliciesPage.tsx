import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import {
  Shield,
  Plus,
  HeartPulse,
  Activity,
  Car,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolicies } from "../hooks/usePolicies";
import type { Policy, PolicyStatus } from "../types";

type FilterTab = "all" | "active" | "pending";

function getCategoryTone(
  name?: string | null,
): "danger" | "success" | "info" | "primary" {
  if (!name) return "primary";
  const n = name.toLowerCase();
  if (n.includes("life")) return "danger";
  if (n.includes("health")) return "success";
  if (n.includes("auto") || n.includes("motor") || n.includes("car"))
    return "info";
  return "primary";
}

function getCategoryIcon(name?: string | null) {
  if (!name) return Shield;
  const n = name.toLowerCase();
  if (n.includes("life")) return HeartPulse;
  if (n.includes("health")) return Activity;
  if (n.includes("auto") || n.includes("motor") || n.includes("car"))
    return Car;
  return Shield;
}

function StatusBadgeDot({ status }: { status: PolicyStatus }) {
  const map: Record<
    PolicyStatus,
    { dot: string; text: string; badge: string }
  > = {
    ACTIVE: {
      dot: "bg-success",
      text: "Active",
      badge: "bg-success/10 text-success border-success/20",
    },
    PENDING: {
      dot: "bg-warning",
      text: "Pending",
      badge: "bg-warning/10 text-warning border-warning/20",
    },
    EXPIRED: {
      dot: "bg-destructive",
      text: "Expired",
      badge: "bg-destructive/10 text-destructive border-destructive/20",
    },
    CANCELLED: {
      dot: "bg-muted-foreground",
      text: "Cancelled",
      badge: "bg-muted text-muted-foreground border-border",
    },
  };
  const s = map[status] ?? map.EXPIRED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border",
        s.badge,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
      {s.text}
    </span>
  );
}

function formatCurrency(val: string | number) {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  return `ZMW ${num.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PolicyCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-[18px] animate-pulse">
      <div className="flex items-center gap-[14px]">
        <Skeleton className="h-[52px] w-[52px] rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="border-t border-border mt-[18px] pt-4">
        <div className="flex gap-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PoliciesPage() {
  const navigate = useNavigate();
  const { data: policies = [], isLoading, error } = usePolicies();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const totalMonthly = policies
    .filter((p: Policy) => p.status === "ACTIVE")
    .reduce((sum: number, p: Policy) => {
      const val =
        typeof p.premiumAmount === "string"
          ? parseFloat(p.premiumAmount)
          : p.premiumAmount;
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

  const filtered = policies.filter((p: Policy) => {
    if (activeFilter === "active") return p.status === "ACTIVE";
    if (activeFilter === "pending") return p.status === "PENDING";
    return true;
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-destructive font-medium">
          Failed to load policies. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[18px] animate-fade-up" data-testid="policies-page">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Segmented filter */}
        <div
          className="bg-muted rounded-lg p-1 flex gap-1"
          style={{ width: 320, maxWidth: "100%" }}
        >
          {(["all", "active", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
                activeFilter === f
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Total monthly + CTA */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">
              Total monthly
            </p>
            <p
              className="text-[18px] font-extrabold text-primary leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              ZMW{" "}
              {isLoading
                ? "—"
                : totalMonthly.toLocaleString("en-ZM", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/browse")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add cover
          </Button>
        </div>
      </div>

      {/* Policy grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <PolicyCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            {filtered.map((policy: Policy) => {
              const tone = getCategoryTone(policy.policyType?.name);
              const Icon = getCategoryIcon(policy.policyType?.name);
              return (
                <div
                  key={policy.policyNumber}
                  onClick={() =>
                    navigate(`/dashboard/policies/${policy.policyNumber}`)
                  }
                  className="bg-card border border-border rounded-2xl p-[18px] cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Top row */}
                  <div className="flex items-center gap-[14px]">
                    <IconChip
                      icon={Icon}
                      tone={tone}
                      size="lg"
                      className="h-[52px] w-[52px] rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[16px] text-foreground leading-snug">
                          {policy.policyType?.name ?? "Insurance Policy"}
                        </span>
                        <StatusBadgeDot status={policy.status} />
                      </div>
                      <p className="text-[12.5px] text-muted-foreground mt-0.5 truncate">
                        {policy.policyNumber}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>

                  {/* Divider + mini stats */}
                  <div className="border-t border-border mt-[18px] pt-4">
                    <div className="flex gap-7 flex-wrap">
                      {[
                        {
                          label: "Premium",
                          value: formatCurrency(policy.premiumAmount),
                        },
                        {
                          label: "Cover",
                          value: formatCurrency(policy.coverageAmount),
                        },
                        {
                          label: "Next due",
                          value: policy.endDate
                            ? new Date(policy.endDate).toLocaleDateString(
                                "en-ZM",
                                { day: "2-digit", month: "short" },
                              )
                            : "—",
                        },
                        {
                          label: "Beneficiaries",
                          value: policy.beneficiaries?.length ?? 0,
                        },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <p className="text-[11.5px] text-muted-foreground">
                            {stat.label}
                          </p>
                          <p
                            className="text-[14px] font-bold leading-snug"
                            style={{ fontFamily: "var(--font-serif)" }}
                          >
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add cover CTA card */}
          <div
            onClick={() => navigate("/dashboard/browse")}
            className="border-2 border-dashed border-border rounded-2xl p-[18px] cursor-pointer flex items-center gap-3 hover:border-primary/40 transition-colors"
          >
            <IconChip
              icon={Plus}
              tone="accent"
              className="h-[44px] w-[44px] rounded-xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground">Add new cover</p>
              <p className="text-xs text-muted-foreground">
                Browse plans for your family
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Shield className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-base font-semibold">
            {activeFilter === "all"
              ? "No policies yet"
              : `No ${activeFilter} policies`}
          </p>
          <p className="text-sm text-muted-foreground">
            Start protecting what matters most
          </p>
          <Button
            className="mt-1 gap-2"
            onClick={() => navigate("/dashboard/browse")}
          >
            <Plus className="h-4 w-4" />
            Browse plans
          </Button>
        </div>
      )}
    </div>
  );
}
