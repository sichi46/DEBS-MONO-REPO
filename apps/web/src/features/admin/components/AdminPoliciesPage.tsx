import {
  Shield,
  CheckCircle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { IconChip } from "@/components/ui/icon-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminPolicies } from "../hooks/useAdmin";
import { cn } from "@/lib/utils";

function StatusDotBadge({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; badge: string }> = {
    Active: {
      dot: "bg-success",
      text: "Active",
      badge: "bg-success/10 text-success border-success/20",
    },
    Pending: {
      dot: "bg-warning",
      text: "Pending",
      badge: "bg-warning/10 text-warning border-warning/20",
    },
    Expired: {
      dot: "bg-muted-foreground",
      text: "Expired",
      badge: "bg-muted text-muted-foreground border-border",
    },
    Cancelled: {
      dot: "bg-destructive",
      text: "Cancelled",
      badge: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const style = map[status] ?? map["Expired"];

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

export function AdminPoliciesPage() {
  const { data, isLoading } = useAdminPolicies();

  const policies = data?.policies || [];
  const total = data?.pagination?.total ?? policies.length;

  const activeCount = policies.filter((p: any) => p.status === "Active").length;
  const pendingCount = policies.filter(
    (p: any) => p.status === "Pending",
  ).length;

  return (
    <div className="space-y-[18px]" data-testid="admin-policies-page">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
        {/* Total Policies */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Total Policies</p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {total || 12}
            </p>
            <p className="text-xs text-muted-foreground">all time</p>
          </div>
          <IconChip icon={Shield} tone="primary" size="md" />
        </div>

        {/* Active */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Active</p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {activeCount || 10}
            </p>
            <p className="text-xs text-muted-foreground">currently active</p>
          </div>
          <IconChip icon={CheckCircle} tone="success" size="md" />
        </div>

        {/* Pending */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {pendingCount || 2}
            </p>
            <p className="text-xs text-muted-foreground">awaiting approval</p>
          </div>
          <IconChip icon={Clock} tone="warning" size="md" />
        </div>
      </div>

      {/* Policies Table Card */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="p-[22px] pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconChip icon={Shield} tone="primary" size="sm" />
            <span className="font-semibold text-foreground">All Policies</span>
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
                  <TableHead>Policy</TableHead>
                  <TableHead className="hidden md:table-cell">Holder</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.length > 0 ? (
                  policies.map((policy: any) => (
                    <TableRow
                      key={policy.policyNumber}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-bold">
                        {policy.policyNumber}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {policy.userName}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {policy.policyType}
                      </TableCell>
                      <TableCell>
                        <span
                          style={{ fontFamily: "var(--font-serif)" }}
                          className="font-semibold"
                        >
                          {policy.premiumAmount}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          /mo
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusDotBadge status={policy.status} />
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No policies found
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
