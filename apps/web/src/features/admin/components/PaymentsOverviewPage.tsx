import { useState } from "react";
import {
  CreditCard,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminPayments, useAdminStats } from "../hooks/useAdmin";

type PaymentStatus = "Paid" | "Pending" | "Failed";

function getStatusVariant(
  status: PaymentStatus,
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "Paid":
      return "default";
    case "Pending":
      return "secondary";
    case "Failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export function PaymentsOverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useAdminPayments({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });
  const { data: stats } = useAdminStats();

  const payments = data?.payments || [];
  const total = data?.pagination?.total ?? 0;
  const paidCount = payments.filter((p: any) => p.status === "Paid").length;
  const pendingCount = payments.filter(
    (p: any) => p.status === "Pending",
  ).length;

  const handleExport = () => {
    if (!payments.length) return;
    const headers = [
      "Date",
      "Customer",
      "Policy",
      "Type",
      "Amount",
      "Status",
      "Method",
    ];
    const rows = payments.map((p: any) => [
      p.date,
      p.userName,
      p.policyNumber,
      p.policyType,
      p.amount,
      p.status,
      p.method,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((val: string) => `"${String(val).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="payments-overview-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground">
            Track and manage all premium payments
          </p>
        </div>
        <Button
          variant="outline"
          className="pr-5"
          onClick={handleExport}
          disabled={!payments.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {stats?.totalRevenue ?? "ZMW 0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {stats?.monthlyRevenue ?? "ZMW 0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by policy number or customer..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Customer
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Policy
                      </TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Method
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length > 0 ? (
                      payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {payment.userName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div>
                              <p>{payment.policyType}</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.policyNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {payment.amount}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {payment.method}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(payment.status)}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                              No payments found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Showing {payments.length} of {total} payments
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
