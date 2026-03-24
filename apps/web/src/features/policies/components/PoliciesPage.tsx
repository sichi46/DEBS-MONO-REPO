import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, ArrowRight } from "lucide-react";
import { usePolicies } from "../hooks/usePolicies";
import type { Policy, PolicyStatus } from "../types";

function getStatusVariant(
  status: PolicyStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PENDING":
      return "secondary";
    case "EXPIRED":
      return "destructive";
    default:
      return "outline";
  }
}

function PolicyRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b p-4 last:border-0">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function PoliciesPage() {
  const { data: policies = [], isLoading, error } = usePolicies();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">
          Failed to load policies. Please try again later.
        </p>
      </div>
    );
  }

  const activePolicies = policies.filter((p: Policy) => p.status === "ACTIVE");
  const pendingPolicies = policies.filter(
    (p: Policy) => p.status === "PENDING",
  );

  return (
    <div className="space-y-6" data-testid="policies-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            My Policies
          </h1>
          <p className="text-muted-foreground">
            View and manage your insurance policies
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/browse">
            <Plus className="mr-2 h-4 w-4" />
            Get New Policy
          </Link>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Policies</p>
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-8" /> : policies.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active</p>
              <div className="text-3xl font-bold text-success">
                {isLoading ? (
                  <Skeleton className="h-9 w-8" />
                ) : (
                  activePolicies.length
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending</p>
              <div className="text-3xl font-bold text-warning">
                {isLoading ? (
                  <Skeleton className="h-9 w-8" />
                ) : (
                  pendingPolicies.length
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            All Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div>
              {Array.from({ length: 3 }).map((_, i) => (
                <PolicyRowSkeleton key={i} />
              ))}
            </div>
          ) : policies.length > 0 ? (
            <div>
              {policies.map((policy: Policy) => (
                <Link
                  key={policy.policyNumber}
                  to={`/dashboard/policies/${policy.policyNumber}`}
                  className="flex flex-col gap-3 border-b p-4 transition-colors hover:bg-muted/50 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Policy Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {policy.policyType?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {policy.policyNumber}
                      </p>
                    </div>
                  </div>
                  {/* Amount & Status */}
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="sm:text-right">
                      <p className="font-medium">{policy.coverageAmount}</p>
                      <p className="text-sm text-muted-foreground">
                        {policy.premiumAmount}/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(policy.status)}>
                        {policy.status}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No policies yet</p>
              <p className="text-muted-foreground">
                Start protecting what matters most
              </p>
              <Button className="mt-4" asChild>
                <Link to="/dashboard/browse">Browse Policies</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
