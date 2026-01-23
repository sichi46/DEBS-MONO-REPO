import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useClaims, usePoliciesForClaim, useSubmitClaim } from "../hooks/useClaims";
import { claimTypes, type ClaimStatus } from "@/lib/mock-data";

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

function ClaimRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell>
                <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
    );
}

export function ClaimsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { data, isLoading, error } = useClaims();
    const { data: policies } = usePoliciesForClaim();
    const submitClaim = useSubmitClaim();

    const [formData, setFormData] = useState({
        policyNumber: "",
        claimType: "",
        amount: "",
        dateOfIncident: "",
        description: "",
    });

    const handleSubmitClaim = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await submitClaim.mutateAsync({
                policyNumber: formData.policyNumber,
                claimType: formData.claimType,
                amount: parseFloat(formData.amount),
                dateOfIncident: formData.dateOfIncident,
                description: formData.description,
            });

            toast.success("Claim submitted successfully!", {
                description: "You will receive updates via email.",
            });
            setIsDialogOpen(false);
            setFormData({
                policyNumber: "",
                claimType: "",
                amount: "",
                dateOfIncident: "",
                description: "",
            });
        } catch {
            toast.error("Failed to submit claim. Please try again.");
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-destructive">
                    Failed to load claims. Please try again later.
                </p>
            </div>
        );
    }

    const claims = data?.claims || [];
    const stats = data?.stats;

    return (
        <div className="space-y-6" data-testid="claims-page">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Claims
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and track your insurance claims
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Submit New Claim
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Submit New Claim</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitClaim} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="policy">Select Policy</Label>
                                <Select
                                    value={formData.policyNumber}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, policyNumber: value })
                                    }
                                    required
                                >
                                    <SelectTrigger id="policy">
                                        <SelectValue placeholder="Choose a policy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {policies?.map((policy) => (
                                            <SelectItem
                                                key={policy.policyNumber}
                                                value={policy.policyNumber}
                                            >
                                                {policy.policyType} - {policy.policyNumber}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="claimType">Claim Type</Label>
                                <Select
                                    value={formData.claimType}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, claimType: value })
                                    }
                                    required
                                >
                                    <SelectTrigger id="claimType">
                                        <SelectValue placeholder="Select claim type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {claimTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Claim Amount (ZMW)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="10000"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, amount: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date of Incident</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.dateOfIncident}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dateOfIncident: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Please provide details about your claim..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Supporting Documents</Label>
                                <div className="rounded-lg border-2 border-dashed p-6 text-center">
                                    <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        Upload medical bills, receipts, or other supporting documents
                                    </p>
                                    <Button type="button" variant="outline" size="sm">
                                        Choose Files
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={submitClaim.isPending}
                                >
                                    {submitClaim.isPending ? "Submitting..." : "Submit Claim"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Claims</p>
                            <p className="text-3xl font-bold">
                                {isLoading ? <Skeleton className="h-9 w-8" /> : stats?.total || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Approved</p>
                            <p className="text-3xl font-bold text-success">
                                {isLoading ? <Skeleton className="h-9 w-8" /> : stats?.approved || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-3xl font-bold text-warning">
                                {isLoading ? <Skeleton className="h-9 w-8" /> : stats?.pending || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Rejected</p>
                            <p className="text-3xl font-bold text-destructive">
                                {isLoading ? <Skeleton className="h-9 w-8" /> : stats?.rejected || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Claims Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        All Claims
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Claim ID</TableHead>
                                <TableHead>Policy</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Processed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <ClaimRowSkeleton key={i} />
                                ))
                            ) : claims.length > 0 ? (
                                claims.map((claim) => (
                                    <TableRow
                                        key={claim.claimId}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/dashboard/claims/${claim.claimId}`)}
                                    >
                                        <TableCell className="font-medium">{claim.claimId}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p>{claim.policyType}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {claim.policyNumber}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{claim.claimAmount}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(claim.status)}>
                                                {claim.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{claim.dateSubmitted}</TableCell>
                                        <TableCell>{claim.dateProcessed}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-2 text-muted-foreground">
                                                No claims yet
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
