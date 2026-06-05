import { useState } from "react";
import {
  ClipboardList,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminClaims,
  useAdminStats,
  useUpdateClaimStatus,
} from "../hooks/useAdmin";

type ClaimStatus = "Approved" | "Pending" | "Under Review" | "Rejected";

function getStatusVariant(
  status: ClaimStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Approved":
      return "default";
    case "Pending":
      return "secondary";
    case "Under Review":
      return "outline";
    case "Rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

function derivePriority(amountStr: string): "high" | "medium" | "low" {
  const n = parseInt((amountStr ?? "0").replace(/\D/g, "")) || 0;
  if (n >= 30000) return "high";
  if (n >= 10000) return "medium";
  return "low";
}

const priorityChipClass: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

export function AdminClaimsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useAdminClaims({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });
  const { data: stats } = useAdminStats();
  const updateClaimStatus = useUpdateClaimStatus();

  const claims = data?.claims || [];
  const total = data?.pagination?.total ?? 0;

  const handleExport = () => {
    if (!claims.length) return;
    const headers = [
      "Claim ID",
      "Customer",
      "Email",
      "Policy",
      "Type",
      "Amount",
      "Status",
    ];
    const rows = claims.map((c: any) => [
      c.claimId,
      c.userName,
      c.userEmail,
      c.policyNumber,
      c.claimType,
      c.claimAmount,
      c.status,
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
    a.download = `claims-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClaimAction = (claimId: string, status: string) => {
    updateClaimStatus.mutate(
      { id: claimId, status },
      {
        onSuccess: () =>
          toast.success(
            `Claim ${status === "APPROVED" ? "approved" : "rejected"}`,
          ),
        onError: (err: Error) =>
          toast.error(err.message || "Failed to update claim"),
      },
    );
  };

  const [queueFilter, setQueueFilter] = useState<"queue" | "settled" | "all">(
    "queue",
  );

  return (
    <div className="space-y-6 animate-fade-up" data-testid="admin-claims-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground">
            Review and process insurance claims
          </p>
        </div>
        <Button
          variant="outline"
          className="pr-5"
          onClick={handleExport}
          disabled={!claims.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Claims"
          value={stats?.totalClaims ?? 0}
          icon={ClipboardList}
          tone="primary"
        />
        <StatCard
          label="Pending"
          value={stats?.pendingClaims ?? 0}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={stats?.approvedClaims ?? 0}
          icon={CheckCircle}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={stats?.rejectedClaims ?? 0}
          icon={XCircle}
          tone="danger"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["queue", "settled", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setQueueFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              queueFilter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "queue" ? "Queue" : f === "settled" ? "Settled" : "All"}
          </button>
        ))}
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            All Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by claim ID, customer, or policy..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
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
                      <TableHead>Claim ID</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Customer
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Policy
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Type
                      </TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.length > 0 ? (
                      claims.map((claim: any) => (
                        <TableRow key={claim.claimId}>
                          <TableCell className="font-medium">
                            {claim.claimId}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <p className="font-medium">{claim.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {claim.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div>
                              <p>{claim.policyType}</p>
                              <p className="text-sm text-muted-foreground">
                                {claim.policyNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {claim.claimType}
                          </TableCell>
                          <TableCell className="font-medium">
                            {claim.claimAmount}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(claim.status)}>
                              {claim.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityChipClass[derivePriority(claim.claimAmount)]}`}
                            >
                              {derivePriority(claim.claimAmount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {(claim.status === "Pending" ||
                                  claim.status === "Under Review") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-success"
                                      onClick={() =>
                                        handleClaimAction(
                                          claim.claimId,
                                          "APPROVED",
                                        )
                                      }
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve Claim
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        handleClaimAction(
                                          claim.claimId,
                                          "REJECTED",
                                        )
                                      }
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject Claim
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                              No claims found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Showing {claims.length} of {total} claims
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
