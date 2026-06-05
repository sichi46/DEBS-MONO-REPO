import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChip } from "@/components/ui/icon-chip";
import {
  ArrowRight,
  ShoppingBag,
  Car,
  Home,
  Plane,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { AvailablePolicy } from "../types";

const policyIconMap: Record<string, LucideIcon> = {
  car: Car,
  home: Home,
  plane: Plane,
  briefcase: Briefcase,
};

interface AvailablePoliciesProps {
  policies?: AvailablePolicy[];
  isLoading?: boolean;
}

function PolicyCardSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function AvailablePolicies({
  policies,
  isLoading,
}: AvailablePoliciesProps) {
  return (
    <Card
      data-testid="available-policies"
      className="transition-shadow hover:shadow-md"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShoppingBag className="h-4 w-4 text-primary" />
          Browse Policies
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs text-primary hover:text-primary"
        >
          <Link to="/dashboard/browse">
            View All
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="grid gap-4 sm:grid-cols-2"
            data-testid="available-policies-loading"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <PolicyCardSkeleton key={i} />
            ))}
          </div>
        ) : policies && policies.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {policies.map((policy) => {
              const Icon = policyIconMap[policy.icon];
              return (
                <div
                  key={policy.id}
                  className="group rounded-xl border p-4 transition-all hover:border-primary/60 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <IconChip
                      icon={Icon ?? ShoppingBag}
                      tone="primary"
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{policy.type}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground mt-0.5">
                        {policy.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      From{" "}
                      <span className="font-semibold text-foreground">
                        {policy.startingPremium}
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                      asChild
                    >
                      <Link to={`/dashboard/browse/${policy.id}`}>
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No policies available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
