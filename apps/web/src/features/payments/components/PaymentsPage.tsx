import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import {
  CreditCard,
  Download,
  Filter,
  Smartphone,
  Building2,
  Repeat,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { mockPaymentHistory, type PaymentStatus } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

const paymentsApi = {
  getPayments: async () => {
    await new Promise((r) => setTimeout(r, 400));
    return mockPaymentHistory;
  },
};

function getStatusVariant(
  status: PaymentStatus,
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

function methodIcon(method: string) {
  if (method.toLowerCase().includes("mobile"))
    return <Smartphone className="h-3.5 w-3.5" />;
  if (method.toLowerCase().includes("bank"))
    return <Building2 className="h-3.5 w-3.5" />;
  return <CreditCard className="h-3.5 w-3.5" />;
}

function methodLabel(method: string) {
  // Enrich Mobile Money with provider info where recognisable
  const m = method.toLowerCase();
  if (m.includes("airtel")) return "Airtel Money";
  if (m.includes("mtn")) return "MTN Money";
  if (m.includes("zamtel")) return "Zamtel Money";
  if (m.includes("mobile")) return "Mobile Money";
  return method;
}

function PaymentRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
}

export function PaymentsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.getPayments,
  });

  const handleExport = () => {
    if (!payments || payments.length === 0) return;
    const headers = ["Date", "Policy", "Amount", "Status", "Method"];
    const rows = payments.map((p) => [
      p.date,
      p.policyNumber,
      p.amount,
      p.status,
      p.method,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
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

  const totalPaid =
    payments
      ?.filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + parseInt(p.amount.replace(/\D/g, "")), 0) || 0;

  const hasAutopay = false; // wire to real data when API returns it

  return (
    <div className="space-y-6 animate-fade-up" data-testid="payments-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          View your payment history and manage upcoming payments
        </p>
        <Button className="pr-5">
          <CreditCard className="mr-2 h-4 w-4" />
          Make a Payment
        </Button>
      </div>

      {/* Autopay nudge */}
      {!hasAutopay && !isLoading && (
        <div className="flex items-center justify-between rounded-xl bg-[color:var(--color-brand-accent-tint)] border border-[color:var(--color-brand-accent)]/20 px-5 py-4 gap-4">
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-[color:var(--color-brand-accent)] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Set up autopay
              </p>
              <p className="text-xs text-muted-foreground">
                Never miss a premium — enable recurring payments for peace of
                mind.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-[color:var(--color-brand-accent)]/40 text-[color:var(--color-brand-accent)] hover:bg-[color:var(--color-brand-accent)]/10"
          >
            Enable
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Payments"
          value={isLoading ? "—" : payments?.length || 0}
          icon={CreditCard}
          tone="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Paid (YTD)"
          value={isLoading ? "—" : `ZMW ${totalPaid.toLocaleString()}`}
          icon={CreditCard}
          tone="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Next Payment Due"
          value="Nov 1, 2025"
          sublabel="ZMW 2,050"
          icon={CreditCard}
          tone="warning"
          isLoading={isLoading}
        />
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment History
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="pr-4">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="pr-4"
              onClick={handleExport}
              disabled={!payments?.length}
            >
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
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        {methodIcon(payment.method)}
                        {methodLabel(payment.method)}
                      </div>
                    </TableCell>
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
