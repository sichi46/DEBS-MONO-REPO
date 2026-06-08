import { TrendingUp, CreditCard, Receipt, Loader2 } from "lucide-react";
import { IconChip } from "@/components/ui/icon-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminPayments } from "../hooks/useAdmin";
import { cn } from "@/lib/utils";

function StatusDotBadge({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; badge: string }> = {
    Paid: {
      dot: "bg-success",
      text: "Paid",
      badge: "bg-success/10 text-success border-success/20",
    },
    Pending: {
      dot: "bg-warning",
      text: "Pending",
      badge: "bg-warning/10 text-warning border-warning/20",
    },
    Failed: {
      dot: "bg-destructive",
      text: "Failed",
      badge: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const style = map[status] ?? map["Pending"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        style.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.text}
    </span>
  );
}

export function PaymentsOverviewPage() {
  const { data, isLoading } = useAdminPayments();

  const payments = data?.payments || [];
  const total = data?.pagination?.total ?? payments.length;

  const transactionCount = total || payments.length;

  return (
    <div className="space-y-[18px]" data-testid="payments-overview-page">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
        {/* Revenue YTD */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Revenue YTD</p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              ZMW 642k
            </p>
            <p className="text-xs text-muted-foreground">year to date</p>
          </div>
          <IconChip icon={TrendingUp} tone="success" size="md" />
        </div>

        {/* Payouts YTD */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Payouts YTD</p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              ZMW 78k
            </p>
            <p className="text-xs text-muted-foreground">claims paid out</p>
          </div>
          <IconChip icon={CreditCard} tone="info" size="md" />
        </div>

        {/* Transactions */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {transactionCount || 0}
            </p>
            <p className="text-xs text-muted-foreground">total records</p>
          </div>
          <IconChip icon={Receipt} tone="primary" size="md" />
        </div>
      </div>

      {/* Payments Table Card */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="p-[22px] pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconChip icon={Receipt} tone="primary" size="sm" />
            <span className="font-semibold text-foreground">
              Payment History
            </span>
          </div>
        </div>

        <div className="p-[8px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Customer
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Policy</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? (
                  payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {payment.date}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {payment.userName}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-semibold">
                        {payment.policyNumber}
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-bold"
                          style={{ fontFamily: "var(--font-serif)" }}
                        >
                          {payment.amount}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {payment.method}
                      </TableCell>
                      <TableCell>
                        <StatusDotBadge status={payment.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
