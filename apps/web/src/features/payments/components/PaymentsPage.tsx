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
import { CreditCard, Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { mockPaymentHistory, type PaymentStatus } from "@/lib/mock-data";

const paymentsApi = {
    getPayments: async () => {
        await new Promise((r) => setTimeout(r, 400));
        return mockPaymentHistory;
    },
};

function getStatusVariant(
    status: PaymentStatus
): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "Paid":
            return "default";
        case "Pending":
            return "secondary";
        case "Failed":
            return "destructive";
        default:
            return "outline";
    }
}

function PaymentRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
    );
}

export function PaymentsPage() {
    const { data: payments, isLoading } = useQuery({
        queryKey: ["payments"],
        queryFn: paymentsApi.getPayments,
    });

    // Calculate totals
    const totalPaid = payments
        ?.filter((p) => p.status === "Paid")
        .reduce((sum, p) => {
            const amount = parseInt(p.amount.replace(/\D/g, ""));
            return sum + amount;
        }, 0) || 0;

    return (
        <div className="space-y-6" data-testid="payments-page">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Payments
                    </h1>
                    <p className="text-muted-foreground">
                        View your payment history and manage upcoming payments
                    </p>
                </div>
                <Button>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make a Payment
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Payments</p>
                            <p className="text-3xl font-bold">
                                {isLoading ? <Skeleton className="h-9 w-8" /> : payments?.length || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Paid (YTD)</p>
                            <p className="text-3xl font-bold text-success">
                                {isLoading ? <Skeleton className="h-9 w-24" /> : `ZMW ${totalPaid.toLocaleString()}`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Next Payment Due</p>
                            <p className="text-3xl font-bold">Nov 1, 2025</p>
                            <p className="text-sm text-muted-foreground">ZMW 2,050</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment History Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Payment History
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Policy</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <PaymentRowSkeleton key={i} />
                                ))
                            ) : payments && payments.length > 0 ? (
                                payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{payment.date}</TableCell>
                                        <TableCell className="font-medium">
                                            {payment.policyNumber}
                                        </TableCell>
                                        <TableCell>{payment.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(payment.status)}>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <p className="text-muted-foreground">No payment history</p>
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
