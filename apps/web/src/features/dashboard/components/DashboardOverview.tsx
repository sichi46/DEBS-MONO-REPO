import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  ShieldCheck,
  CreditCard,
  ClipboardList,
  Sparkles,
  Shield,
  Clock,
  CheckCircle,
  CalendarDays,
  ChevronRight,
  HeadphonesIcon,
  HeartPulse,
  Activity,
  Car,
  type LucideIcon,
} from "lucide-react";
import { Ring } from "@/components/ui/ring";
import { IconChip } from "@/components/ui/icon-chip";
import { useDashboardData } from "../hooks/useDashboardData";
import { userAtom } from "@/features/auth";
import { cn } from "@/lib/utils";
import type { Policy, Claim, PolicyStatus, ClaimStatus } from "../types";

// ---------------------------------------------------------------------------
// DebsMark SVG watermark
// ---------------------------------------------------------------------------
function DebsMark({ className }: { className?: string }) {
  return (
    <svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M120 20C64.8 20 20 64.8 20 120s44.8 100 100 100 100-44.8 100-100S175.2 20 120 20zm0 180c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z"
        fill="white"
      />
      <path
        d="M120 60c-33.1 0-60 26.9-60 60s26.9 60 60 60 60-26.9 60-60-26.9-60-60-60zm0 100c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z"
        fill="white"
      />
      <path
        d="M120 95c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25z"
        fill="white"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
function policyIcon(type: string): {
  icon: LucideIcon;
  tone: "danger" | "success" | "info" | "primary";
} {
  const t = type.toLowerCase();
  if (t.includes("life")) return { icon: HeartPulse, tone: "danger" };
  if (t.includes("health")) return { icon: Activity, tone: "success" };
  if (t.includes("auto") || t.includes("car"))
    return { icon: Car, tone: "info" };
  return { icon: Shield, tone: "primary" };
}

function policyStatusBadge(status: PolicyStatus) {
  switch (status) {
    case "Active":
      return "bg-success/10 text-success border-success/20";
    case "Pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "Expired":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function claimStatusBadge(status: ClaimStatus) {
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

// Status dot colour
function statusDot(status: PolicyStatus | ClaimStatus) {
  const map: Record<string, string> = {
    Active: "bg-success",
    Approved: "bg-success",
    Pending: "bg-warning",
    "Under Review": "bg-primary",
    Rejected: "bg-destructive",
    Expired: "bg-muted-foreground",
  };
  return map[status] ?? "bg-muted-foreground";
}

// ---------------------------------------------------------------------------
// DashboardOverview
// ---------------------------------------------------------------------------
export function DashboardOverview() {
  const { data, isLoading, error } = useDashboardData();
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-testid="dashboard-error"
      >
        <p className="text-destructive">
          Failed to load dashboard data. Please try again later.
        </p>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const stats = data?.stats;
  const recentPolicies: Policy[] = data?.recentPolicies ?? [];
  const recentClaims: Claim[] = data?.recentClaims ?? [];
  const availablePolicies = data?.availablePolicies ?? [];

  // Cover score based on active policies (25 pts each, max 100)
  const coverScore = Math.min(100, (stats?.activePolicies ?? 0) * 25 + 28);

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Grow-your-cover products (first 2 available policies)
  const growProducts = availablePolicies.slice(0, 2);

  return (
    <div
      className="space-y-[18px] animate-fade-up"
      data-testid="dashboard-overview"
    >
      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1 — HERO CARD                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="rounded-[22px] overflow-hidden p-[28px_30px] text-white shadow-md relative"
        style={{
          background:
            "linear-gradient(120deg, var(--color-primary) 0%, #003A7D 70%)",
        }}
      >
        {/* Accent overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(80% 120% at 100% 0%, color-mix(in srgb, var(--color-brand-accent) 30%, transparent), transparent 55%)",
          }}
        />
        {/* DebsMark watermark */}
        <div className="absolute right-[-10px] top-[-30px] opacity-[.12] pointer-events-none">
          <DebsMark />
        </div>

        {/* Layout */}
        <div className="relative flex items-center gap-6 flex-wrap">
          {/* Left */}
          <div className="flex-1 min-w-[260px]">
            <p className="text-[14px] opacity-85 font-semibold mb-1">
              {greeting}, {firstName} 👋
            </p>
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-[14px] w-[14px] opacity-80" />
              <span className="text-[12.5px] opacity-80 font-semibold">
                Total active cover
              </span>
            </div>
            <p
              className="text-[42px] font-extrabold leading-none mb-5"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.nextPaymentAmount ?? "ZMW 0"}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2.5 flex-wrap">
              {/* Pay */}
              <button
                onClick={() => navigate("/dashboard/payments")}
                className="flex items-center gap-2 rounded-[999px] px-[18px] py-[11px] font-bold text-sm cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  background: "var(--color-brand-accent)",
                  color: "#fff",
                }}
              >
                <CreditCard className="h-4 w-4" />
                Pay
              </button>
              {/* File a claim — glass */}
              <button
                onClick={() => navigate("/dashboard/claims")}
                className="flex items-center gap-2 rounded-[999px] px-[18px] py-[11px] font-bold text-sm cursor-pointer border border-white/40 bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ClipboardList className="h-4 w-4" />
                File a claim
              </button>
              {/* Browse plans — glass */}
              <button
                onClick={() => navigate("/dashboard/browse")}
                className="flex items-center gap-2 rounded-[999px] px-[18px] py-[11px] font-bold text-sm cursor-pointer border border-white/40 bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Sparkles className="h-4 w-4" />
                Browse plans
              </button>
            </div>
          </div>

          {/* Right — Ring */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Ring
              value={coverScore}
              size={118}
              strokeWidth={10}
              tone="primary"
              label={String(coverScore)}
              sublabel="COVER SCORE"
              className="[&_circle:first-child]:stroke-white/20 [&_circle:last-child]:stroke-[#EFB35E]"
            />
            <p className="text-[12px] opacity-85 font-semibold text-center mt-1">
              Well protected
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2 — KPI grid-4                                              */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[18px]"
        data-testid="stats-cards"
      >
        {/* Card 1: Active Policies */}
        <Link
          to="/dashboard/policies"
          className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start hover:-translate-y-0.5 cursor-pointer transition-transform"
          data-testid="kpi-active-policies"
        >
          <div>
            <p className="text-[12.5px] text-muted-foreground font-medium mb-1">
              Active policies
            </p>
            <p
              className="text-[28px] font-extrabold leading-none text-foreground mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {isLoading ? "—" : (stats?.activePolicies ?? 0)}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {stats?.totalPolicies ?? 0} total
            </p>
          </div>
          <IconChip icon={Shield} tone="primary" size="md" />
        </Link>

        {/* Card 2: Pending Claims */}
        <Link
          to="/dashboard/claims"
          className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start hover:-translate-y-0.5 cursor-pointer transition-transform"
          data-testid="kpi-pending-claims"
        >
          <div>
            <p className="text-[12.5px] text-muted-foreground font-medium mb-1">
              Pending claims
            </p>
            <p
              className="text-[28px] font-extrabold leading-none text-foreground mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {isLoading ? "—" : (stats?.pendingClaims ?? 0)}
            </p>
            <p className="text-[12px] text-muted-foreground">Awaiting review</p>
          </div>
          <IconChip icon={Clock} tone="warning" size="md" />
        </Link>

        {/* Card 3: Approved Claims */}
        <Link
          to="/dashboard/claims"
          className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start hover:-translate-y-0.5 cursor-pointer transition-transform"
          data-testid="kpi-approved-claims"
        >
          <div>
            <p className="text-[12.5px] text-muted-foreground font-medium mb-1">
              Approved claims
            </p>
            <p
              className="text-[28px] font-extrabold leading-none text-foreground mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {isLoading ? "—" : (stats?.approvedClaims ?? 0)}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {stats?.totalClaimsAmount ?? "ZMW 0"} paid
            </p>
          </div>
          <IconChip icon={CheckCircle} tone="success" size="md" />
        </Link>

        {/* Card 4: Next Payment */}
        <Link
          to="/dashboard/payments"
          className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start hover:-translate-y-0.5 cursor-pointer transition-transform"
          data-testid="kpi-next-payment"
        >
          <div>
            <p className="text-[12.5px] text-muted-foreground font-medium mb-1">
              Next payment
            </p>
            <p
              className="text-[28px] font-extrabold leading-none text-foreground mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {isLoading ? "—" : (stats?.nextPaymentAmount ?? "—")}
            </p>
            <p className="text-[12px] text-muted-foreground">
              Due {stats?.nextPaymentDate ?? "—"}
            </p>
          </div>
          <IconChip icon={CalendarDays} tone="info" size="md" />
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 3 — col-main                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-[18px] items-start">
        {/* LEFT COLUMN */}
        <div className="grid gap-[18px]">
          {/* Panel A — My Policies */}
          <div
            className="bg-card border border-border rounded-2xl p-[22px]"
            data-testid="policy-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IconChip icon={Shield} tone="primary" size="sm" />
                <h3 className="font-semibold text-[15px] text-foreground">
                  My Policies
                </h3>
              </div>
              <Link
                to="/dashboard/policies"
                className="text-[12.5px] font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {/* Policy rows */}
            {isLoading ? (
              <div className="space-y-1" data-testid="policies-loading">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3.5 border-b border-border last:border-0 animate-pulse"
                  >
                    <div className="h-11 w-11 rounded-[13px] bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                    <div className="h-3.5 bg-muted rounded w-16 shrink-0" />
                  </div>
                ))}
              </div>
            ) : recentPolicies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No policies yet
                </p>
                <Link
                  to="/dashboard/browse"
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Browse plans
                </Link>
              </div>
            ) : (
              <div>
                {recentPolicies.map((policy) => {
                  const { icon, tone } = policyIcon(policy.policyType);
                  return (
                    <Link
                      key={policy.policyNumber}
                      to={`/dashboard/policies/${policy.policyNumber}`}
                      className="flex items-center gap-3 py-3.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 -mx-[6px] px-[6px] rounded-xl transition-colors"
                    >
                      <IconChip
                        icon={icon}
                        tone={tone}
                        size="lg"
                        className="!h-11 !w-11 rounded-[13px]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[15px] text-foreground truncate">
                          {policy.policyType}
                        </p>
                        <p className="text-[12.5px] text-muted-foreground">
                          {policy.policyNumber} &middot; Cover{" "}
                          {policy.coverageAmount}
                        </p>
                      </div>
                      <div className="shrink-0 text-right mr-1">
                        <p className="font-bold text-[13px] text-foreground tabular-nums">
                          {policy.premiumAmount}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {policy.paymentFrequency}
                        </p>
                      </div>
                      {/* Status badge */}
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                          policyStatusBadge(policy.status),
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            statusDot(policy.status),
                          )}
                        />
                        {policy.status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel B — Recent Claims */}
          <div
            className="bg-card border border-border rounded-2xl p-[22px]"
            data-testid="claim-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IconChip icon={ClipboardList} tone="primary" size="sm" />
                <h3 className="font-semibold text-[15px] text-foreground">
                  Recent Claims
                </h3>
              </div>
              <Link
                to="/dashboard/claims"
                className="text-[12.5px] font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {/* Claim rows */}
            {isLoading ? (
              <div className="space-y-1" data-testid="claims-loading">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3.5 border-b border-border last:border-0 animate-pulse"
                  >
                    <div className="h-11 w-11 rounded-[13px] bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-40" />
                    </div>
                    <div className="h-4 bg-muted rounded w-16 shrink-0" />
                  </div>
                ))}
              </div>
            ) : recentClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No claims yet
                </p>
                <Link
                  to="/dashboard/claims"
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Submit a claim
                </Link>
              </div>
            ) : (
              <div>
                {recentClaims.map((claim) => (
                  <Link
                    key={claim.claimId}
                    to={`/dashboard/claims/${claim.claimId}`}
                    className="flex items-center gap-3 py-3.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 -mx-[6px] px-[6px] rounded-xl transition-colors"
                  >
                    <IconChip
                      icon={ClipboardList}
                      tone="primary"
                      size="lg"
                      className="!h-11 !w-11 rounded-[13px]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] text-foreground truncate">
                        {claim.claimType} Claim
                      </p>
                      <p className="text-[12.5px] text-muted-foreground">
                        {claim.claimId} &middot; {claim.dateSubmitted} &middot;{" "}
                        {claim.policyType}
                      </p>
                    </div>
                    <p
                      className="font-bold text-[15px] text-foreground shrink-0 mr-1"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {claim.claimAmount}
                    </p>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                        claimStatusBadge(claim.status),
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          statusDot(claim.status),
                        )}
                      />
                      {claim.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="grid gap-[18px]">
          {/* Card A — Upcoming Payment */}
          <div
            className="rounded-2xl p-[22px] border"
            style={{
              background: "var(--color-brand-accent-tint)",
              borderColor:
                "color-mix(in srgb, var(--color-brand-accent) 35%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-[17px] w-[17px] text-[color:var(--color-brand-accent)]" />
              <h3 className="font-semibold text-[15px] text-foreground">
                Upcoming payment
              </h3>
            </div>
            <p
              className="text-[30px] font-extrabold text-foreground leading-none mb-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.nextPaymentAmount ?? "—"}
            </p>
            <p className="text-[12.5px] text-muted-foreground mb-4">
              Due {stats?.nextPaymentDate ?? "—"} &middot;{" "}
              {stats?.activePolicies ?? 0} policies
            </p>
            <button
              onClick={() => navigate("/dashboard/payments")}
              className="w-full rounded-[10px] py-[11px] font-bold text-sm text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "var(--color-brand-accent)" }}
            >
              Pay now
            </button>
          </div>

          {/* Card B — Grow your cover */}
          <div
            className="bg-card border border-border rounded-2xl p-[22px]"
            data-testid="available-policies"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IconChip icon={Sparkles} tone="accent" size="sm" />
                <h3 className="font-semibold text-[15px] text-foreground">
                  Grow your cover
                </h3>
              </div>
              <Link
                to="/dashboard/browse"
                className="text-[12.5px] font-semibold text-primary hover:underline"
              >
                Browse
              </Link>
            </div>
            <div className="space-y-2">
              {growProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No products available
                </p>
              ) : (
                growProducts.map((product, i) => {
                  const tones: Array<
                    "primary" | "success" | "warning" | "info"
                  > = ["primary", "success"];
                  const icons: LucideIcon[] = [Shield, HeartPulse];
                  const Icon = icons[i % icons.length];
                  const tone = tones[i % tones.length];
                  return (
                    <Link
                      key={product.id}
                      to={`/dashboard/browse/${product.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:-translate-y-0.5 transition-transform bg-card"
                    >
                      {/* Gradient icon box */}
                      <div
                        className="h-11 w-11 rounded-[13px] flex items-center justify-center shrink-0"
                        style={{
                          background:
                            tone === "primary"
                              ? "linear-gradient(135deg, var(--color-primary), #003A7D)"
                              : "linear-gradient(135deg, var(--color-success), #16a34a)",
                        }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] text-foreground truncate">
                          {product.type}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          From {product.startingPremium}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Card C — Help */}
          <Link
            to="/dashboard/settings"
            className="bg-card border border-border rounded-2xl p-[18px] flex items-center gap-3 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            <IconChip
              icon={HeadphonesIcon}
              tone="primary"
              size="md"
              className="!h-[42px] !w-[42px] rounded-[13px]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] text-foreground">
                Need help?
              </p>
              <p className="text-[12px] text-muted-foreground">
                Our Lusaka team, Mon–Sat
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
