import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  ClipboardList,
  Plus,
  HeartPulse,
  Building2,
  Car,
  AlertTriangle,
} from "lucide-react";
import { IconChip } from "@/components/ui/icon-chip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClaims } from "../hooks/useClaims";
import type { ClaimStatus } from "@/lib/mock-data";
import type { LucideIcon } from "lucide-react";

function claimTypeIcon(claimType: string): LucideIcon {
  switch (claimType) {
    case "Medical":
      return HeartPulse;
    case "Hospital":
      return Building2;
    case "Accident":
      return Car;
    case "Critical Illness":
      return AlertTriangle;
    default:
      return ClipboardList;
  }
}

function stageFromStatus(status: ClaimStatus): number {
  switch (status) {
    case "Approved":
      return 4;
    case "Under Review":
      return 3;
    case "Pending":
      return 2;
    case "Rejected":
      return 1;
    default:
      return 1;
  }
}

function statusBadgeTone(status: ClaimStatus): string {
  switch (status) {
    case "Approved":
      return "bg-success/10 text-success border-success/20";
    case "Pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "Under Review":
      return "bg-primary/10 text-primary border-primary/20";
    case "Rejected":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

const STAGE_LABELS = ["Submitted", "Reviewing", "Assessment", "Paid out"];

function ClaimCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-[18px] space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton
          className="rounded-xl shrink-0"
          style={{ width: 50, height: 50 }}
        />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-1 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-[5px] rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function ClaimsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useClaims();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "in-progress" | "settled"
  >("all");

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">
          Failed to load claims. Please try again later.
        </p>
      </div>
    );
  }

  const allClaims = data?.claims || [];
  const stats = data?.stats;

  const approvedClaims = allClaims.filter((c) => c.status === "Approved");
  const openClaims = allClaims.filter(
    (c) => c.status === "Pending" || c.status === "Under Review",
  );

  const filteredClaims = allClaims.filter((c) => {
    if (activeFilter === "in-progress")
      return c.status === "Pending" || c.status === "Under Review";
    if (activeFilter === "settled")
      return c.status === "Approved" || c.status === "Rejected";
    return true;
  });

  return (
    <div className="space-y-[18px] animate-fade-up" data-testid="claims-page">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
        {/* Open Claims */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              Open Claims
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p
                className="text-[28px] font-extrabold leading-tight mt-0.5"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {openClaims.length}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Pending or under review
            </p>
          </div>
          <IconChip icon={Clock} tone="warning" size="md" />
        </div>

        {/* Approved */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              Approved
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p
                className="text-[28px] font-extrabold leading-tight mt-0.5"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {stats?.approved ?? 0}
              </p>
            )}
            {approvedClaims.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {approvedClaims[0]?.claimAmount} paid
              </p>
            )}
          </div>
          <IconChip icon={CheckCircle} tone="success" size="md" />
        </div>

        {/* Total Claims */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              Total Claims
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p
                className="text-[28px] font-extrabold leading-tight mt-0.5"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {stats?.total ?? 0}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              All time submitted
            </p>
          </div>
          <IconChip icon={ClipboardList} tone="primary" size="md" />
        </div>
      </div>

      {/* Filter row + CTA */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div
          className="bg-muted rounded-lg p-1 flex gap-1"
          style={{ width: 340 }}
        >
          {(["all", "in-progress", "settled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeFilter === f
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "in-progress"
                  ? "In progress"
                  : "Settled"}
            </button>
          ))}
        </div>
        <Button asChild>
          <Link to="/dashboard/claims/new">
            <Plus className="h-4 w-4 mr-1.5" />
            File a new claim
          </Link>
        </Button>
      </div>

      {/* Claim Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ClaimCardSkeleton key={i} />)
        ) : filteredClaims.length === 0 ? (
          <div className="sm:col-span-2 bg-card border border-border rounded-2xl p-[22px] text-center py-12">
            <ClipboardList className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No claims found</p>
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const ClaimIcon = claimTypeIcon(claim.claimType);
            const stage = stageFromStatus(claim.status);
            return (
              <div
                key={claim.claimId}
                className="bg-card border border-border rounded-2xl p-[18px] cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/dashboard/claims/${claim.claimId}`)}
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    style={{ width: 50, height: 50 }}
                  >
                    <ClaimIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15.5px] leading-snug">
                      {claim.claimType} Claim
                    </p>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5 truncate">
                      {claim.claimId} &middot; {claim.dateSubmitted} &middot;{" "}
                      {claim.policyNumber}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p
                      className="text-[16px] font-extrabold leading-none"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {claim.claimAmount}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadgeTone(claim.status)}`}
                    >
                      {claim.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1 mt-4">
                  {STAGE_LABELS.map((label, idx) => (
                    <div
                      key={label}
                      className="flex flex-col items-center flex-1 gap-1"
                    >
                      <div
                        className={`h-[5px] rounded-full w-full ${
                          idx < stage ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      <span className="text-[11.5px] text-muted-foreground font-semibold">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
