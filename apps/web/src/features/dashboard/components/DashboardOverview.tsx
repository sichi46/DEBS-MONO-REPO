import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { Plus, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ring } from "@/components/ui/ring";
import { useDashboardData } from "../hooks/useDashboardData";
import { StatsCards } from "./StatsCards";
import { PolicyCard } from "./PolicyCard";
import { ClaimCard } from "./ClaimCard";
import { AvailablePolicies } from "./AvailablePolicies";
import { userAtom } from "@/features/auth";

export function DashboardOverview() {
  const { data, isLoading, error } = useDashboardData();
  const user = useRecoilValue(userAtom);

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
  const activePolicies = data?.stats?.activePolicies ?? 0;
  const coverageScore = Math.min(100, activePolicies * 25);

  return (
    <div className="space-y-6 animate-fade-up" data-testid="dashboard-overview">
      {/* Hero coverage card */}
      <div className="rounded-xl bg-primary p-6 text-primary-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-primary-foreground/70">Welcome back</p>
          <h2 className="text-2xl font-bold">{firstName}</h2>
          <p className="text-sm text-primary-foreground/80">
            {activePolicies > 0
              ? `You have ${activePolicies} active ${activePolicies === 1 ? "policy" : "policies"} covering you.`
              : "You have no active policies yet. Browse plans to get covered."}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Ring
            value={coverageScore}
            size={80}
            strokeWidth={7}
            label={`${coverageScore}%`}
            sublabel="Coverage"
            tone="primary"
            className="[&_circle:first-child]:stroke-white/20 [&_circle:last-child]:stroke-white"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm" className="rounded-lg">
          <Link to="/dashboard/claims">
            <Plus className="h-4 w-4 mr-1.5" />
            New Claim
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-lg">
          <Link to="/dashboard/payments">
            <CreditCard className="h-4 w-4 mr-1.5" />
            Make Payment
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-lg">
          <Link to="/dashboard/policies">
            <Shield className="h-4 w-4 mr-1.5" />
            View Policies
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={data?.stats} isLoading={isLoading} />

      {/* Policies and Claims Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PolicyCard policies={data?.recentPolicies} isLoading={isLoading} />
        <ClaimCard claims={data?.recentClaims} isLoading={isLoading} />
      </div>

      {/* Available Policies */}
      <AvailablePolicies
        policies={data?.availablePolicies}
        isLoading={isLoading}
      />
    </div>
  );
}
