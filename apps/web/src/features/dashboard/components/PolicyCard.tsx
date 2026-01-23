import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, FileText } from "lucide-react";
import type { Policy, PolicyStatus } from "../types";

interface PolicyCardProps {
    policies?: Policy[];
    isLoading?: boolean;
}

function getStatusVariant(
    status: PolicyStatus
): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "Active":
            return "default";
        case "Pending":
            return "secondary";
        case "Expired":
            return "destructive";
        default:
            return "outline";
    }
}

function PolicyCardSkeleton() {
    return (
        <div className="flex items-center justify-between border-b py-4 last:border-0">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <Skeleton className="h-6 w-16" />
        </div>
    );
}

export function PolicyCard({ policies, isLoading }: PolicyCardProps) {
    return (
        <Card data-testid="policy-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    My Policies
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/policies">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div data-testid="policies-loading">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <PolicyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : policies && policies.length > 0 ? (
                    <div className="space-y-1">
                        {policies.map((policy) => (
                            <Link
                                key={policy.policyNumber}
                                to={`/dashboard/policies/${policy.policyNumber}`}
                                className="flex items-center justify-between rounded-lg border-b py-4 transition-colors hover:bg-muted/50 last:border-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {policy.policyType}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {policy.policyNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">
                                        {policy.premiumAmount}/mo
                                    </span>
                                    <Badge variant={getStatusVariant(policy.status)}>
                                        {policy.status}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-muted-foreground">
                            No policies yet
                        </p>
                        <Button variant="default" size="sm" className="mt-4" asChild>
                            <Link to="/dashboard/browse">Browse Policies</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
