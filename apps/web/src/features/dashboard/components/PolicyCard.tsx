import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import { ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Policy, PolicyStatus } from "../types";

interface PolicyCardProps {
  policies?: Policy[];
  isLoading?: boolean;
}

function statusClass(status: PolicyStatus) {
  switch (status) {
    case "Active":
      return "bg-success/10 text-success border-success/20";
    case "Pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "Expired":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function PolicyRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}

export function PolicyCard({ policies, isLoading }: PolicyCardProps) {
  return (
    <Card
      data-testid="policy-card"
      className="transition-shadow hover:shadow-md"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          My Policies
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs text-primary hover:text-primary"
        >
          <Link to="/dashboard/policies">
            View All
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div data-testid="policies-loading">
            {Array.from({ length: 3 }).map((_, i) => (
              <PolicyRowSkeleton key={i} />
            ))}
          </div>
        ) : policies && policies.length > 0 ? (
          <div>
            {policies.map((policy) => (
              <Link
                key={policy.policyNumber}
                to={`/dashboard/policies/${policy.policyNumber}`}
                className="flex items-center justify-between py-3 border-b last:border-0 transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IconChip icon={Shield} tone="primary" size="md" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {policy.policyType}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {policy.policyNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-medium">
                        {policy.premiumAmount}/mo
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full border shrink-0",
                    statusClass(policy.status),
                  )}
                >
                  {policy.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No policies yet
            </p>
            <Button variant="default" size="sm" className="mt-3" asChild>
              <Link to="/dashboard/browse">Browse Policies</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
