import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import { StatCard } from "@/components/ui/stat-card";
import { FileText, Plus, ArrowRight, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolicies } from "../hooks/usePolicies";
import type { Policy, PolicyStatus } from "../types";

function statusChipClass(status: PolicyStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-success/10 text-success border-success/20";
    case "PENDING":
      return "bg-warning/10 text-warning border-warning/20";
    case "EXPIRED":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function PolicyRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b p-4 last:border-0">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function PoliciesPage() {
  const { data: policies = [], isLoading, error } = usePolicies();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "pending"
  >("all");

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

  const filtered = policies.filter((p: Policy) => {
    if (activeFilter === "active") return p.status === "ACTIVE";
    if (activeFilter === "pending") return p.status === "PENDING";
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-up" data-testid="policies-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          View and manage your insurance policies
        </p>
        <Button asChild className="pr-5">
          <Link to="/dashboard/browse">
            <Plus className="mr-2 h-4 w-4" />
            Get New Policy
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Policies"
          value={isLoading ? "—" : policies.length}
          icon={FileText}
          tone="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Active"
          value={isLoading ? "—" : activePolicies.length}
          icon={Shield}
          tone="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending"
          value={isLoading ? "—" : pendingPolicies.length}
          icon={Clock}
          tone="warning"
          isLoading={isLoading}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["all", "active", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              activeFilter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Policies List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            {activeFilter === "all"
              ? "All Policies"
              : activeFilter === "active"
                ? "Active Policies"
                : "Pending Policies"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div>
              {Array.from({ length: 3 }).map((_, i) => (
                <PolicyRowSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div>
              {filtered.map((policy: Policy) => (
                <Link
                  key={policy.policyNumber}
                  to={`/dashboard/policies/${policy.policyNumber}`}
                  className="flex flex-col gap-3 border-b p-4 transition-colors hover:bg-muted/40 last:border-0 sm:flex-row sm:items-center sm:justify-between -mx-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconChip icon={Shield} tone="primary" size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {policy.policyType?.name}
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
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="sm:text-right">
                      <p className="text-sm font-semibold">
                        {policy.coverageAmount}
                      </p>
                      <p className="text-xs text-muted-foreground">coverage</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full border",
                          statusChipClass(policy.status),
                        )}
                      >
                        {policy.status}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-base font-medium">
                {activeFilter === "all"
                  ? "No policies yet"
                  : `No ${activeFilter} policies`}
              </p>
              <p className="text-sm text-muted-foreground">
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
