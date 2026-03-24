import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ShoppingBag,
  Car,
  Home,
  Plane,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const policyIconMap: Record<string, LucideIcon> = {
  car: Car,
  home: Home,
  plane: Plane,
  briefcase: Briefcase,
};
import type { AvailablePolicy } from "../types";

interface AvailablePoliciesProps {
  policies?: AvailablePolicy[];
  isLoading?: boolean;
}

function PolicyCardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function AvailablePolicies({
  policies,
  isLoading,
}: AvailablePoliciesProps) {
  return (
    <Card data-testid="available-policies">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Browse Policies
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/browse">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
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
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {(() => {
                      const Icon = policyIconMap[policy.icon];
                      return Icon ? (
                        <Icon className="h-5 w-5 text-primary" />
                      ) : null;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{policy.type}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {policy.description}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    From{" "}
                    <span className="font-semibold text-foreground">
                      {policy.startingPremium}
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground"
                    asChild
                  >
                    <Link to={`/dashboard/browse/${policy.id}`}>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No policies available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
