import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { mockAvailablePolicies } from "@/lib/mock-data";

// Simple API for browse
const browseApi = {
    getAvailable: async () => {
        await new Promise((r) => setTimeout(r, 300));
        return mockAvailablePolicies;
    },
};

function PolicyCardSkeleton() {
    return (
        <Card className="h-full">
            <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="mt-auto flex items-center justify-between pt-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function BrowsePoliciesPage() {
    const { data: policies, isLoading } = useQuery({
        queryKey: ["browse", "policies"],
        queryFn: browseApi.getAvailable,
    });

    return (
        <div className="space-y-6" data-testid="browse-policies-page">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Browse Policies
                </h1>
                <p className="text-muted-foreground">
                    Explore our range of insurance products to protect what matters most
                </p>
            </div>

            {/* Policies Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <PolicyCardSkeleton key={i} />
                    ))
                ) : (
                    policies?.map((policy) => (
                        <Card
                            key={policy.id}
                            className="group flex h-full flex-col transition-all hover:border-primary hover:shadow-md"
                        >
                            <CardContent className="flex flex-1 flex-col pt-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-3xl">
                                    {policy.icon}
                                </div>
                                <h3 className="mt-4 text-xl font-semibold">{policy.type}</h3>
                                <p className="mt-2 flex-1 text-muted-foreground">
                                    {policy.description}
                                </p>
                                <div className="mt-6 flex items-center justify-between border-t pt-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Starting from</p>
                                        <p className="text-lg font-bold text-primary">
                                            {policy.startingPremium}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="group-hover:bg-primary group-hover:text-primary-foreground"
                                        asChild
                                    >
                                        <Link to={`/dashboard/browse/${policy.id}`}>
                                            Learn More
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* CTA Section */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center md:flex-row md:justify-between md:text-left">
                    <div>
                        <h3 className="text-xl font-semibold">Need help choosing?</h3>
                        <p className="text-muted-foreground">
                            Our insurance advisors are here to help you find the perfect coverage.
                        </p>
                    </div>
                    <Button className="mt-4 md:mt-0">Contact an Advisor</Button>
                </CardContent>
            </Card>
        </div>
    );
}
