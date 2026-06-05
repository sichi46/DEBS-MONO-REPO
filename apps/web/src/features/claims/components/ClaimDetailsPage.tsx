import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import { ClaimsTracker } from "@/components/ui/claims-tracker";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  FileCheck,
} from "lucide-react";
import { useClaimDetails } from "../hooks/useClaims";
import type { ClaimStatus } from "@/lib/mock-data";

function statusStep(status: ClaimStatus): number {
  switch (status) {
    case "Pending":
      return 0;
    case "Under Review":
      return 1;
    case "Approved":
      return 3;
    case "Rejected":
      return 1;
    default:
      return 0;
  }
}

function statusChipClass(status: ClaimStatus) {
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
      return "bg-muted text-muted-foreground";
  }
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
        <FileCheck className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">Claim not found</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/dashboard/claims">Back to Claims</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up" data-testid="claim-details-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/dashboard/claims")}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">
              Claim #{claim.claimId}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-xs font-semibold px-3 py-1 rounded-full border",
            statusChipClass(claim.status),
          )}
        >
          {claim.status}
        </span>
      </div>

      {/* Claims progress tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Claim Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <ClaimsTracker
            currentStep={statusStep(claim.status)}
            className="px-4"
          />
        </CardContent>
      </Card>

      {/* Claim Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Claim Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <IconChip icon={FileText} tone="primary" size="sm" />
              <div>
                <p className="text-xs text-muted-foreground">Claim Type</p>
                <p className="font-semibold">{claim.claimType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconChip icon={DollarSign} tone="success" size="sm" />
              <div>
                <p className="text-xs text-muted-foreground">Claim Amount</p>
                <p className="text-xl font-bold">{claim.claimAmount}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconChip icon={Calendar} tone="neutral" size="sm" />
              <div>
                <p className="text-xs text-muted-foreground">Date Submitted</p>
                <p className="font-semibold">{claim.dateSubmitted}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconChip icon={Clock} tone="neutral" size="sm" />
              <div>
                <p className="text-xs text-muted-foreground">Date Processed</p>
                <p className="font-semibold">{claim.dateProcessed}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Policy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck className="h-4 w-4 text-primary" />
            Related Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <div>
              <p className="font-semibold">{claim.policyType}</p>
              <p className="text-sm text-muted-foreground">
                {claim.policyNumber}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/dashboard/policies/${claim.policyNumber}`}>
                View Policy
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {claim.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {claim.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" className="flex-1" asChild>
          <Link to="/dashboard/claims">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Link>
        </Button>
        <Button
          className="flex-1"
          onClick={() =>
            window.open("mailto:support@debsinsurance.com", "_blank")
          }
        >
          Contact Support
        </Button>
      </div>
    </div>
  );
}
