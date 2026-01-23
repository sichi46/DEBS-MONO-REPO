import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FileText,
    Clock,
    CheckCircle,
    CreditCard,
    LucideIcon,
} from "lucide-react";
import type { DashboardStats } from "../types";

interface StatsCardsProps {
    stats?: DashboardStats;
    isLoading?: boolean;
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    iconColor: string;
    iconBgColor: string;
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    iconBgColor,
}: StatCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
                >
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function StatCardSkeleton() {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </CardContent>
        </Card>
    );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
    if (isLoading) {
        return (
            <div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                data-testid="stats-loading"
            >
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            data-testid="stats-cards"
        >
            <StatCard
                title="Active Policies"
                value={stats.activePolicies}
                subtitle={`${stats.totalPolicies} total policies`}
                icon={FileText}
                iconColor="text-primary"
                iconBgColor="bg-primary/10"
            />
            <StatCard
                title="Pending Claims"
                value={stats.pendingClaims}
                subtitle="Awaiting review"
                icon={Clock}
                iconColor="text-warning"
                iconBgColor="bg-warning/10"
            />
            <StatCard
                title="Approved Claims"
                value={stats.approvedClaims}
                subtitle={stats.totalClaimsAmount}
                icon={CheckCircle}
                iconColor="text-success"
                iconBgColor="bg-success/10"
            />
            <StatCard
                title="Next Payment"
                value={stats.nextPaymentAmount}
                subtitle={stats.nextPaymentDate}
                icon={CreditCard}
                iconColor="text-secondary"
                iconBgColor="bg-secondary/10"
            />
        </div>
    );
}
