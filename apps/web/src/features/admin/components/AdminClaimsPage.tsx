import { useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/ui/icon-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminClaims,
  useAdminStats,
  useUpdateClaimStatus,
} from "../hooks/useAdmin";

type ClaimStatus = "Approved" | "Pending" | "Under Review" | "Rejected";

function getStatusBadgeClass(status: ClaimStatus): string {
  switch (status) {
    case "Approved":
      return "border-transparent bg-success/10 text-success";
    case "Pending":
      return "border-transparent bg-warning/10 text-warning";
    case "Under Review":
      return "border-transparent bg-primary/10 text-primary";
    case "Rejected":
      return "border-transparent bg-destructive/10 text-destructive";
    default:
      return "border-transparent bg-muted text-muted-foreground";
  }
}

function derivePriority(amountStr: string): "high" | "medium" | "low" {
  const n = parseInt((amountStr ?? "0").replace(/\D/g, "")) || 0;
  if (n >= 30000) return "high";
  if (n >= 10000) return "medium";
  return "low";
}

function getAvatarGradient(priority: "high" | "medium" | "low"): string {
  if (priority === "high") return "linear-gradient(140deg,#E7A24A,#B9701B)";
  return "linear-gradient(140deg,#2D6BD4,#0D3C85)";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminClaimsPage() {
  const [queueFilter, setQueueFilter] = useState<"queue" | "settled" | "all">(
    "queue",
  );

  // Derive API status filter from queue tab
  const apiStatusFilter =
    queueFilter === "queue"
      ? undefined // fetch all, filter client-side
      : queueFilter === "settled"
        ? undefined
        : undefined;

  const { data, isLoading } = useAdminClaims({
    status: apiStatusFilter,
  });
  const { data: stats } = useAdminStats();
  const updateClaimStatus = useUpdateClaimStatus();

  const allClaims: any[] = data?.claims || [];

  const filteredClaims = allClaims.filter((c: any) => {
    if (queueFilter === "queue")
      return c.status === "Pending" || c.status === "Under Review";
    if (queueFilter === "settled")
      return c.status === "Approved" || c.status === "Rejected";
    return true;
  });

  const handleClaimAction = (
    claimId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    updateClaimStatus.mutate(
      { id: claimId, status },
      {
        onSuccess: () =>
          toast.success(
            status === "APPROVED" ? "Claim approved" : "Claim rejected",
          ),
        onError: (err: Error) =>
          toast.error(err.message || "Failed to update claim"),
      },
    );
  };

  return (
    <div className="space-y-[18px]" data-testid="admin-claims-page">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[18px]">
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium mb-1">
              Total Claims
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.totalClaims ?? 0}
            </p>
          </div>
          <IconChip icon={ClipboardList} tone="primary" size="md" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium mb-1">
              Pending
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.pendingClaims ?? 0}
            </p>
          </div>
          <IconChip icon={Clock} tone="warning" size="md" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium mb-1">
              Approved
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.approvedClaims ?? 0}
            </p>
          </div>
          <IconChip icon={CheckCircle} tone="success" size="md" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium mb-1">
              Rejected
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.rejectedClaims ?? 0}
            </p>
          </div>
          <IconChip icon={XCircle} tone="danger" size="md" />
        </div>
      </div>

      {/* Segmented control */}
      <div className="bg-muted rounded-lg p-1 flex gap-1 w-[380px] max-w-full">
        {(["queue", "settled", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setQueueFilter(tab)}
            className={`flex-1 px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              queueFilter === tab
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {tab === "queue" ? "Queue" : tab === "settled" ? "Settled" : "All"}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="p-[8px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Customer
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim: any) => {
                    const priority = derivePriority(claim.claimAmount ?? "0");
                    const isActionable =
                      claim.status === "Pending" ||
                      claim.status === "Under Review";
                    const initials = getInitials(claim.userName || "");

                    return (
                      <TableRow key={claim.claimId}>
                        {/* Claim ID */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {priority === "high" && (
                              <span
                                className="h-2 w-2 rounded-full bg-destructive shrink-0"
                                title="High priority"
                              />
                            )}
                            <span className="font-bold text-[13px]">
                              {claim.claimId}
                            </span>
                          </div>
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-[9px]">
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                              style={{
                                background: getAvatarGradient(priority),
                              }}
                            >
                              {initials}
                            </div>
                            <span className="text-[13px] font-medium">
                              {claim.userName}
                            </span>
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="hidden lg:table-cell text-[13px]">
                          {claim.claimType}
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <span
                            className="font-bold text-[14px]"
                            style={{ fontFamily: "var(--font-serif)" }}
                          >
                            {claim.claimAmount}
                          </span>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-[13px]">
                          {claim.createdAt
                            ? new Date(claim.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "2-digit",
                                },
                              )
                            : (claim.date ?? "—")}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(claim.status as ClaimStatus)}`}
                          >
                            {claim.status}
                          </span>
                        </TableCell>

                        {/* Action */}
                        <TableCell>
                          {isActionable ? (
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleClaimAction(claim.claimId, "REJECTED")
                                }
                                disabled={updateClaimStatus.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleClaimAction(claim.claimId, "APPROVED")
                                }
                                disabled={updateClaimStatus.isPending}
                                className="gap-1"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[12.5px] text-muted-foreground">
                              Settled
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">
                          No claims found
                        </p>
                      </div>
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
