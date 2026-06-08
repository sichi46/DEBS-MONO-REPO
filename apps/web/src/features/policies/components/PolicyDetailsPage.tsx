import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import {
  Shield,
  HeartPulse,
  Activity,
  Car,
  FileText,
  Users,
  CreditCard,
  ClipboardList,
  Download,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolicyDetails } from "../hooks/usePolicies";
import type { PolicyStatus, Beneficiary } from "../types";

function getCategoryIcon(name?: string | null) {
  if (!name) return Shield;
  const n = name.toLowerCase();
  if (n.includes("life")) return HeartPulse;
  if (n.includes("health")) return Activity;
  if (n.includes("auto") || n.includes("motor") || n.includes("car"))
    return Car;
  return Shield;
}

function getHeroGradient(name?: string | null) {
  if (!name) return "var(--color-primary)";
  const n = name.toLowerCase();
  if (n.includes("life")) return "linear-gradient(135deg,#0057B7,#003A7D)";
  if (n.includes("health")) return "linear-gradient(135deg,#22C55E,#157A45)";
  if (n.includes("auto") || n.includes("motor") || n.includes("car"))
    return "linear-gradient(135deg,#F59E0B,#B26C16)";
  return "var(--color-primary)";
}

function StatusBadgeDot({ status }: { status: PolicyStatus }) {
  const map: Record<
    PolicyStatus,
    { dot: string; text: string; badge: string }
  > = {
    ACTIVE: {
      dot: "bg-emerald-400",
      text: "Active",
      badge: "bg-white/20 text-white border-white/30",
    },
    PENDING: {
      dot: "bg-yellow-300",
      text: "Pending",
      badge: "bg-white/20 text-white border-white/30",
    },
    EXPIRED: {
      dot: "bg-red-400",
      text: "Expired",
      badge: "bg-white/20 text-white border-white/30",
    },
    CANCELLED: {
      dot: "bg-white/60",
      text: "Cancelled",
      badge: "bg-white/20 text-white border-white/30",
    },
  };
  const s = map[status] ?? map.EXPIRED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border w-fit",
        s.badge,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
      {s.text}
    </span>
  );
}

function formatCurrency(val: string | number | undefined | null) {
  if (val == null) return "—";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  return `ZMW ${num.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AvatarInitials({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const tone = index % 2 === 0 ? "primary" : "accent";
  return (
    <div
      className={cn(
        "h-[38px] w-[38px] rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        tone === "primary"
          ? "bg-primary/10 text-primary"
          : "bg-[color:var(--color-brand-accent-tint)] text-[color:var(--color-brand-accent)]",
      )}
    >
      {initials}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] items-start animate-pulse">
      <div className="grid gap-[18px]">
        <Skeleton className="h-[220px] rounded-[22px]" />
        <Skeleton className="h-[140px] rounded-2xl" />
        <Skeleton className="h-[120px] rounded-2xl" />
      </div>
      <div className="grid gap-[18px]">
        <Skeleton className="h-[160px] rounded-2xl" />
        <Skeleton className="h-[200px] rounded-2xl" />
        <Skeleton className="h-[140px] rounded-2xl" />
      </div>
    </div>
  );
}

export function PolicyDetailsPage() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const navigate = useNavigate();
  const {
    data: policy,
    isLoading,
    error,
  } = usePolicyDetails(policyNumber || "");

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <p className="text-destructive font-medium">
          Failed to load policy details. Please try again later.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-semibold">Policy not found</p>
        <Button variant="outline" asChild>
          <Link to="/dashboard/policies">Back to Policies</Link>
        </Button>
      </div>
    );
  }

  const HeroIcon = getCategoryIcon(policy.policyType?.name);
  const heroGradient = getHeroGradient(policy.policyType?.name);

  const paidPayments =
    policy.paymentHistory?.filter((p) => p.status === "PAID").length ?? 0;
  const totalPayments = 12;
  const progressPct = Math.min(
    100,
    Math.round((paidPayments / totalPayments) * 100),
  );
  const paidAmount =
    policy.paymentHistory
      ?.filter((p) => p.status === "PAID")
      .reduce((sum, p) => {
        const v =
          typeof p.amount === "string" ? parseFloat(p.amount) : p.amount;
        return sum + (isNaN(v) ? 0 : v);
      }, 0) ?? 0;

  const quickFacts = [
    { label: "Policy number", value: policy.policyNumber },
    {
      label: "Start date",
      value: policy.startDate
        ? new Date(policy.startDate).toLocaleDateString("en-ZM", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
    {
      label: "Beneficiaries",
      value: `${policy.beneficiaries?.length ?? 0} ${(policy.beneficiaries?.length ?? 0) === 1 ? "person" : "people"}`,
    },
    {
      label: "Next payment",
      value: policy.endDate
        ? new Date(policy.endDate).toLocaleDateString("en-ZM", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
    { label: "Status", value: policy.status },
  ];

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] items-start animate-fade-up"
      data-testid="policy-details-page"
    >
      {/* LEFT column */}
      <div className="grid gap-[18px]">
        {/* Hero card */}
        <div
          className="rounded-[22px] p-7 text-white overflow-hidden relative"
          style={{ background: heroGradient }}
        >
          {/* Watermark icon */}
          <HeroIcon
            className="absolute opacity-[0.16] pointer-events-none"
            style={{ right: -10, bottom: -20, width: 170, height: 170 }}
          />

          <div className="relative z-10 flex flex-col gap-3">
            <StatusBadgeDot status={policy.status} />
            <h2
              className="text-[28px] font-extrabold leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {policy.policyType?.name ?? "Insurance Policy"}
            </h2>
            <p className="text-[13.5px]" style={{ opacity: 0.85 }}>
              {policy.policyNumber}
            </p>
            <div className="flex gap-10 mt-1 flex-wrap">
              {[
                {
                  label: "Cover",
                  value: formatCurrency(policy.coverageAmount),
                },
                {
                  label: "Premium",
                  value: `${formatCurrency(policy.premiumAmount)}/mo`,
                },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[12px] text-white/70 font-medium">
                    {s.label}
                  </p>
                  <p
                    className="text-[26px] font-extrabold leading-snug"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium progress panel */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <div className="flex items-center gap-2 mb-4">
            <IconChip icon={TrendingUp} tone="success" size="sm" />
            <span className="font-semibold text-[15px]">Premium progress</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-muted-foreground">
              Paid this year
            </span>
            <span className="text-[14px] font-bold">
              {formatCurrency(paidAmount)}
            </span>
          </div>
          <div className="h-[6px] rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-2">
            {paidPayments} of {totalPayments} monthly payments made &middot;{" "}
            next due{" "}
            {policy.endDate
              ? new Date(policy.endDate).toLocaleDateString("en-ZM", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>

        {/* Documents panel */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <div className="flex items-center gap-2 mb-4">
            <IconChip icon={FileText} tone="primary" size="sm" />
            <span className="font-semibold text-[15px]">Documents</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Policy Certificate",
              "Schedule of Benefits",
              "Terms & Conditions",
              "Premium Receipt",
            ].map((doc) => (
              <div
                key={doc}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="h-10 w-10 rounded-[11px] bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium truncate">{doc}</p>
                  <p className="text-xs text-muted-foreground">PDF · 240 KB</p>
                </div>
                <Download className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT column */}
      <div className="grid gap-[18px]">
        {/* Actions panel */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <div className="flex flex-col gap-3">
            <Button className="w-full gap-2">
              <CreditCard className="h-4 w-4" />
              Pay premium
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/dashboard/claims")}
            >
              <ClipboardList className="h-4 w-4" />
              File a claim
            </Button>
            <Button variant="ghost" className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download schedule
            </Button>
          </div>
        </div>

        {/* Quick facts panel */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <p className="font-semibold text-[15px] mb-4">Quick facts</p>
          <div className="flex flex-col gap-3">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex justify-between text-[13.5px]"
              >
                <span className="text-muted-foreground">{fact.label}</span>
                <span className="font-bold text-right max-w-[55%] truncate">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficiaries panel */}
        {policy.beneficiaries && policy.beneficiaries.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-[22px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconChip icon={Users} tone="primary" size="sm" />
                <span className="font-semibold text-[15px]">Beneficiaries</span>
              </div>
              <button
                onClick={() => navigate("/dashboard/policies")}
                className="text-[13px] text-primary font-medium flex items-center gap-0.5 hover:underline"
              >
                Manage
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {policy.beneficiaries.map(
                (beneficiary: Beneficiary, idx: number) => (
                  <div key={beneficiary.id} className="flex items-center gap-3">
                    <AvatarInitials name={beneficiary.name} index={idx} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold truncate">
                        {beneficiary.name}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">
                        {beneficiary.relationship} &middot;{" "}
                        {beneficiary.percentage}%
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
