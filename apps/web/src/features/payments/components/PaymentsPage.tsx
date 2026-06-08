import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconChip } from "@/components/ui/icon-chip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Download,
  Smartphone,
  Building2,
  RefreshCw,
  CalendarDays,
  CheckCircle,
  Receipt,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { mockPaymentHistory, type PaymentStatus } from "@/lib/mock-data";
import { Link } from "react-router-dom";

const paymentsApi = {
  getPayments: async () => {
    await new Promise((r) => setTimeout(r, 400));
    return mockPaymentHistory;
  },
};

function methodIcon(method: string) {
  if (method.toLowerCase().includes("mobile"))
    return (
      <Smartphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    );
  if (method.toLowerCase().includes("bank"))
    return <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  return <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
}

function methodLabel(method: string) {
  const m = method.toLowerCase();
  if (m.includes("airtel")) return "Airtel Money";
  if (m.includes("mtn")) return "MTN Money";
  if (m.includes("zamtel")) return "Zamtel Money";
  if (m.includes("mobile")) return "Mobile Money";
  return method;
}

function statusBadge(status: PaymentStatus) {
  if (status === "Paid") {
    return (
      <span className="inline-flex items-center rounded-full bg-success/12 px-2.5 py-0.5 text-[11.5px] font-semibold text-success">
        Paid
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-warning/12 px-2.5 py-0.5 text-[11.5px] font-semibold text-warning">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-destructive/12 px-2.5 py-0.5 text-[11.5px] font-semibold text-destructive">
      {status}
    </span>
  );
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

  const paidCount = payments?.filter((p) => p.status === "Paid").length ?? 0;

  return (
    <div className="space-y-[18px] animate-fade-up" data-testid="payments-page">
      {/* SECTION 1 — col-main: gradient card + autopay nudge */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-[18px] items-start">
        {/* Gradient next-payment card */}
        <div
          className="rounded-[22px] p-7 text-white overflow-hidden relative"
          style={{
            background:
              "linear-gradient(120deg, var(--color-primary), #003A7D)",
          }}
        >
          {/* Watermark icon */}
          <CreditCard
            size={170}
            className="absolute opacity-[.12] pointer-events-none"
            style={{ right: -10, top: -10 }}
          />

          {/* Content */}
          <div className="relative">
            <p className="text-[13px] font-semibold opacity-85 mb-1">
              Next payment due
            </p>
            <p
              className="font-extrabold leading-none mb-2"
              style={{
                fontSize: 40,
                letterSpacing: "-0.03em",
              }}
            >
              ZMW 2,050
            </p>
            <p className="text-[13.5px] opacity-85 flex items-center gap-1.5 mb-5">
              <CalendarDays size={14} />
              Due Nov 1, 2025 &middot; 2 policies
            </p>
            <Button
              size="lg"
              className="bg-[color:var(--color-brand-accent)] hover:bg-[color:var(--color-brand-accent-deep)] text-white border-0"
              asChild
            >
              <Link to="/dashboard/payments/pay">
                <CreditCard className="h-4 w-4" />
                Pay now
              </Link>
            </Button>
          </div>
        </div>

        {/* AutoPay nudge card */}
        <div
          className="rounded-2xl p-[22px] flex items-center gap-3 border"
          style={{
            background: "var(--color-brand-accent-tint)",
            borderColor:
              "color-mix(in srgb, var(--color-brand-accent) 30%, transparent)",
          }}
        >
          <RefreshCw
            size={24}
            style={{ color: "var(--color-brand-accent-deep)" }}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[14.5px] text-foreground leading-snug">
              Never miss a payment
            </p>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Turn on AutoPay with Mobile Money
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-[color:var(--color-brand-accent)] hover:bg-[color:var(--color-brand-accent-deep)] text-white border-0"
          >
            Set up
          </Button>
        </div>
      </div>

      {/* SECTION 2 — grid-3 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
        {/* Paid this year */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-[12.5px] font-medium text-muted-foreground">
              Paid this year
            </p>
            <p className="font-extrabold text-[26px] leading-none text-foreground">
              {isLoading ? "—" : `ZMW ${totalPaid.toLocaleString()}`}
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              Across 2 policies
            </p>
          </div>
          <IconChip icon={CheckCircle} tone="success" size="md" />
        </div>

        {/* Payments made */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-[12.5px] font-medium text-muted-foreground">
              Payments made
            </p>
            <p className="font-extrabold text-[26px] leading-none text-foreground">
              {isLoading ? "—" : paidCount}
            </p>
            <p className="text-[11.5px] text-muted-foreground">On time</p>
          </div>
          <IconChip icon={Receipt} tone="primary" size="md" />
        </div>

        {/* Methods */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-[12.5px] font-medium text-muted-foreground">
              Methods
            </p>
            <p className="font-extrabold text-[26px] leading-none text-foreground">
              3
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              Momo, card, bank
            </p>
          </div>
          <IconChip icon={Wallet} tone="info" size="md" />
        </div>
      </div>

      {/* SECTION 3 — Payment history */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-[22px] pt-[22px] pb-2">
          <h3 className="flex items-center gap-2 font-extrabold text-[16.5px] text-foreground">
            <Receipt size={19} className="text-primary" />
            Payment history
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!payments?.length}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                    <TableCell className="text-muted-foreground text-sm">
                      {payment.date}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {payment.policyNumber}
                    </TableCell>
                    <TableCell className="font-bold text-sm">
                      {payment.amount}
                    </TableCell>
                    <TableCell>{statusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
}
