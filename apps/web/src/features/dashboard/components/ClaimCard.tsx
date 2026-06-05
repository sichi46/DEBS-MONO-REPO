import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import { ClaimsTracker } from "@/components/ui/claims-tracker";
import { ArrowRight, FileCheck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Claim, ClaimStatus } from "../types";

interface ClaimCardProps {
  claims?: Claim[];
  isLoading?: boolean;
}

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

function statusClass(status: ClaimStatus) {
  switch (status) {
    case "Approved":
      return "text-success";
    case "Pending":
      return "text-warning";
    case "Under Review":
      return "text-primary";
    case "Rejected":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

function ClaimRowSkeleton() {
  return (
    <div className="py-3 border-b last:border-0 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ClaimCard({ claims, isLoading }: ClaimCardProps) {
  return (
    <Card
      data-testid="claim-card"
      className="transition-shadow hover:shadow-md"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FileCheck className="h-4 w-4 text-primary" />
          Recent Claims
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" asChild className="text-xs h-7">
            <Link to="/dashboard/claims">
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Claim
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-primary hover:text-primary h-7"
          >
            <Link to="/dashboard/claims">
              View All
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div data-testid="claims-loading">
            {Array.from({ length: 3 }).map((_, i) => (
              <ClaimRowSkeleton key={i} />
            ))}
          </div>
        ) : claims && claims.length > 0 ? (
          <div>
            {claims.map((claim) => (
              <Link
                key={claim.claimId}
                to={`/dashboard/claims/${claim.claimId}`}
                className="block py-3 border-b last:border-0 transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <IconChip icon={FileCheck} tone="primary" size="md" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {claim.claimType} — {claim.policyType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claim.dateSubmitted}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-semibold">{claim.claimAmount}</p>
                    <p
                      className={cn(
                        "text-xs font-medium",
                        statusClass(claim.status),
                      )}
                    >
                      {claim.status}
                    </p>
                  </div>
                </div>
                <ClaimsTracker
                  currentStep={statusStep(claim.status)}
                  compact
                  className="mt-1"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileCheck className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No claims yet</p>
            <Button variant="default" size="sm" className="mt-3" asChild>
              <Link to="/dashboard/claims">Submit a Claim</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
