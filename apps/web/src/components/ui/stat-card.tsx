import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "neutral";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  tone?: Tone;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  trend,
  trendUp,
  icon,
  tone = "primary",
  isLoading,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("transition-shadow hover:shadow-md", className)}>
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="flex items-start gap-4 p-6">
        <IconChip icon={icon} tone={tone} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
          <div className="flex items-center gap-2 mt-1">
            {sublabel && (
              <p className="text-xs text-muted-foreground">{sublabel}</p>
            )}
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  trendUp ? "text-success" : "text-destructive",
                )}
              >
                {trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
