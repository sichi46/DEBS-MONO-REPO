import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import {
  ArrowLeft,
  ShieldCheck,
  Activity,
  FileText,
  HeartPulse,
  Building2,
  Car,
  AlertTriangle,
  ClipboardList,
  Check,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useClaimDetails } from "../hooks/useClaims";
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

const STEPS = [
  {
    title: "Submitted",
    note: "Your claim has been received and logged in our system.",
  },
  {
    title: "Under Review",
    note: "Our claims team is reviewing your submission and documents.",
  },
  {
    title: "Assessment",
    note: "A claims assessor is evaluating the details of your claim.",
  },
  {
    title: "Paid out",
    note: "Funds have been disbursed to your registered bank account.",
  },
];

function DetailsSkeleton() {
  return (
    <div className="space-y-[18px]">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] items-start">
        <div className="grid gap-[18px]">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="grid gap-[18px]">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function ClaimDetailsPage() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const { data: claim, isLoading, error } = useClaimDetails(claimId || "");

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">
          Failed to load claim details. Please try again later.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) return <DetailsSkeleton />;

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">Claim not found</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/dashboard/claims">Back to Claims</Link>
        </Button>
      </div>
    );
  }

  const ClaimIcon = claimTypeIcon(claim.claimType);
  const stage = stageFromStatus(claim.status);
  const isApproved = claim.status === "Approved";

  return (
    <div
      className="space-y-[18px] animate-fade-up"
      data-testid="claim-details-page"
    >
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/dashboard/claims")}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <p className="text-sm text-muted-foreground">Claim #{claim.claimId}</p>
      </div>

      {/* col-7-5 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] items-start">
        {/* LEFT column */}
        <div className="grid gap-[18px]">
          {/* Summary card */}
          <div className="bg-card border border-border rounded-2xl p-[22px]">
            <div className="flex items-center gap-[18px] flex-wrap">
              <div
                className="flex shrink-0 items-center justify-center rounded-xl"
                style={{
                  width: 60,
                  height: 60,
                  background: isApproved
                    ? "var(--color-success, #16a34a)1a"
                    : "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  color: isApproved
                    ? "var(--color-success)"
                    : "var(--color-primary)",
                }}
              >
                <ClaimIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-muted-foreground">
                  {claim.claimId} &middot; {claim.policyNumber}
                </p>
                <p
                  className="text-[30px] font-extrabold leading-tight"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {claim.claimAmount}
                </p>
                <p className="text-[14px] text-muted-foreground">
                  {claim.claimType} claim
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadgeTone(claim.status)}`}
              >
                {claim.status}
              </span>
            </div>

            {/* Reassurance banner */}
            <div className="mt-4 bg-primary/10 rounded-[14px] p-[14px] flex gap-[11px] items-center">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <p className="text-[13px] text-primary font-semibold">
                {isApproved
                  ? "This claim has been settled. Funds were sent to your account."
                  : "You are in good hands. Most claims are assessed within 5 working days."}
              </p>
            </div>
          </div>

          {/* Claim Progress panel */}
          <div className="bg-card border border-border rounded-2xl p-[22px]">
            <div className="flex items-center gap-2 mb-5">
              <IconChip icon={Activity} tone="primary" size="sm" />
              <p className="font-semibold text-[15px]">Claim Progress</p>
            </div>

            <div className="flex flex-col">
              {STEPS.map((step, idx) => {
                const done = idx < stage;
                const isLast = idx === STEPS.length - 1;
                return (
                  <div key={step.title} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: 30,
                          height: 30,
                          background: done
                            ? "var(--color-primary)"
                            : "var(--color-muted)",
                          border: done
                            ? "none"
                            : "2px solid var(--color-border)",
                        }}
                      >
                        {done ? (
                          <Check
                            className="h-4 w-4 text-white"
                            strokeWidth={3}
                          />
                        ) : (
                          <div
                            className="rounded-full bg-muted-foreground/30"
                            style={{ width: 7, height: 7 }}
                          />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className="w-[2px] flex-1 my-1"
                          style={{
                            minHeight: 30,
                            background: done
                              ? "var(--color-primary)"
                              : "var(--color-border)",
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                      <div className="flex justify-between items-start">
                        <p
                          className="font-bold text-[15px]"
                          style={{
                            color: done
                              ? "inherit"
                              : "var(--color-muted-foreground)",
                          }}
                        >
                          {step.title}
                        </p>
                        {idx === 0 && (
                          <p className="text-[12px] text-muted-foreground">
                            {claim.dateSubmitted}
                          </p>
                        )}
                        {idx === STEPS.length - 1 &&
                          claim.dateProcessed !== "—" && (
                            <p className="text-[12px] text-muted-foreground">
                              {claim.dateProcessed}
                            </p>
                          )}
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-0.5">
                        {step.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="grid gap-[18px]">
          {/* Documents panel */}
          <div className="bg-card border border-border rounded-2xl p-[22px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconChip icon={FileText} tone="primary" size="sm" />
                <p className="font-semibold text-[15px]">Documents</p>
              </div>
              <button className="text-[13px] text-primary font-medium hover:underline">
                Upload
              </button>
            </div>
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">
                No documents uploaded yet
              </p>
              <p className="text-[12px] text-muted-foreground/70 mt-1">
                Upload supporting documents to speed up your claim
              </p>
            </div>
          </div>

          {/* Need Help panel */}
          <div className="bg-card border border-border rounded-2xl p-[22px]">
            <p className="font-semibold text-[15px] mb-1">Need help?</p>
            <p className="text-[13px] text-muted-foreground mb-4">
              Our claims team is available Monday–Friday, 8am–5pm CAT.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() =>
                  window.open("mailto:claims@debsinsurance.com", "_blank")
                }
              >
                <MessageCircle className="h-4 w-4" />
                Email claims team
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => window.open("tel:+260211123456", "_blank")}
              >
                <Phone className="h-4 w-4" />
                +260 211 123 456
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
