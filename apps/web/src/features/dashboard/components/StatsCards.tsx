import { FileText, Clock, CheckCircle, CreditCard } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { DashboardStats } from "../types";

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="stats-loading"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} label="" value="" icon={FileText} isLoading />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up"
      data-testid="stats-cards"
    >
      <StatCard
        label="Active Policies"
        value={stats.activePolicies}
        sublabel={`${stats.totalPolicies} total policies`}
        icon={FileText}
        tone="primary"
      />
      <StatCard
        label="Pending Claims"
        value={stats.pendingClaims}
        sublabel="Awaiting review"
        icon={Clock}
        tone="warning"
      />
      <StatCard
        label="Approved Claims"
        value={stats.approvedClaims}
        sublabel={stats.totalClaimsAmount}
        icon={CheckCircle}
        tone="success"
      />
      <StatCard
        label="Next Payment"
        value={stats.nextPaymentAmount}
        sublabel={stats.nextPaymentDate}
        icon={CreditCard}
        tone="neutral"
      />
    </div>
  );
}
