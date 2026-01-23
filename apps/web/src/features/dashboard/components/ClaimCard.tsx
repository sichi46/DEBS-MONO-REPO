import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, FileCheck, Plus } from "lucide-react";
import type { Claim, ClaimStatus } from "../types";

interface ClaimCardProps {
    claims?: Claim[];
    isLoading?: boolean;
}

function getStatusVariant(
    status: ClaimStatus
): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "Approved":
            return "default";
        case "Pending":
        case "Under Review":
            return "secondary";
        case "Rejected":
            return "destructive";
        default:
            return "outline";
    }
}

function ClaimCardSkeleton() {
    return (
        <div className="flex items-center justify-between border-b py-4 last:border-0">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
            </div>
        </div>
    );
}

export function ClaimCard({ claims, isLoading }: ClaimCardProps) {
    return (
        <Card data-testid="claim-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Recent Claims
                </CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/claims/new">
                            <Plus className="mr-1 h-4 w-4" />
                            New Claim
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard/claims">
                            View All
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div data-testid="claims-loading">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <ClaimCardSkeleton key={i} />
                        ))}
                    </div>
                ) : claims && claims.length > 0 ? (
                    <div className="space-y-1">
                        {claims.map((claim) => (
                            <Link
                                key={claim.claimId}
                                to={`/dashboard/claims/${claim.claimId}`}
                                className="flex items-center justify-between rounded-lg border-b py-4 transition-colors hover:bg-muted/50 last:border-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <FileCheck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {claim.claimType} - {claim.policyType}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {claim.dateSubmitted}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">
                                        {claim.claimAmount}
                                    </span>
                                    <Badge variant={getStatusVariant(claim.status)}>
                                        {claim.status}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileCheck className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-muted-foreground">
                            No claims yet
                        </p>
                        <Button variant="default" size="sm" className="mt-4" asChild>
                            <Link to="/dashboard/claims/new">Submit a Claim</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
