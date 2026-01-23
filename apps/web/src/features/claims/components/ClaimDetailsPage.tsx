import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    FileText,
    Calendar,
    DollarSign,
    Clock,
    FileCheck,
} from "lucide-react";
import { useClaimDetails } from "../hooks/useClaims";
import type { ClaimStatus } from "@/lib/mock-data";

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

function DetailsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function ClaimDetailsPage() {
    const { claimId } = useParams<{ claimId: string }>();
    const navigate = useNavigate();
    const { data: claim, isLoading, error } = useClaimDetails(claimId || "");

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-destructive">
                    Failed to load claim details. Please try again later.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return <DetailsSkeleton />;
    }

    if (!claim) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileCheck className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">Claim not found</p>
                <Button className="mt-4" variant="outline" asChild>
                    <Link to="/dashboard/claims">Back to Claims</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="claim-details-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/dashboard/claims")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Claim Details
                        </h1>
                        <p className="text-muted-foreground">
                            Claim #{claim.claimId}
                        </p>
                    </div>
                </div>
                <Badge
                    variant={getStatusVariant(claim.status)}
                    className="text-sm px-3 py-1"
                >
                    {claim.status}
                </Badge>
            </div>

            {/* Claim Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Claim Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">Claim Type</span>
                            </div>
                            <p className="text-lg font-medium">{claim.claimType}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm">Claim Amount</span>
                            </div>
                            <p className="text-2xl font-bold">{claim.claimAmount}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">Date Submitted</span>
                            </div>
                            <p className="text-lg font-medium">{claim.dateSubmitted}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">Date Processed</span>
                            </div>
                            <p className="text-lg font-medium">{claim.dateProcessed}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Related Policy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        Related Policy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                        <div>
                            <p className="font-medium">{claim.policyType}</p>
                            <p className="text-sm text-muted-foreground">
                                {claim.policyNumber}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`/dashboard/policies/${claim.policyNumber}`}>
                                View Policy
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Description */}
            {claim.description && (
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{claim.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Status Timeline - Simplified for now */}
            <Card>
                <CardHeader>
                    <CardTitle>Claim Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Claim Submitted</p>
                            <p className="text-sm text-muted-foreground">
                                Your claim was submitted on {claim.dateSubmitted}
                            </p>
                        </div>
                    </div>
                    {claim.status !== "Pending" && (
                        <div className="mt-4 flex items-center gap-4 border-t pt-4">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${claim.status === "Approved"
                                        ? "bg-success text-success-foreground"
                                        : claim.status === "Rejected"
                                            ? "bg-destructive text-destructive-foreground"
                                            : "bg-primary text-primary-foreground"
                                    }`}
                            >
                                <Clock className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">
                                    {claim.status === "Approved"
                                        ? "Claim Approved"
                                        : claim.status === "Rejected"
                                            ? "Claim Rejected"
                                            : "Under Review"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {claim.dateProcessed !== "—"
                                        ? `Processed on ${claim.dateProcessed}`
                                        : "Your claim is being reviewed by our team"}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="outline" className="flex-1" asChild>
                    <Link to="/dashboard/claims">Back to Claims</Link>
                </Button>
                <Button className="flex-1">Contact Support</Button>
            </div>
        </div>
    );
}
