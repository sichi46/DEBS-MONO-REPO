import { useDashboardData } from "../hooks/useDashboardData";
import { StatsCards } from "./StatsCards";
import { PolicyCard } from "./PolicyCard";
import { ClaimCard } from "./ClaimCard";
import { AvailablePolicies } from "./AvailablePolicies";

export function DashboardOverview() {
  const { data, isLoading, error } = useDashboardData();

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

  return (
    <div className="space-y-6" data-testid="dashboard-overview">
      {/* Welcome message */}
      <div>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your insurance portfolio.
        </p>
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
