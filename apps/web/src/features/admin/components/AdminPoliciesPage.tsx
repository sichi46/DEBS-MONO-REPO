import { useState } from "react";
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  XCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

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
import { useAdminPolicies, useAdminStats } from "../hooks/useAdmin";

type PolicyStatus = "Active" | "Pending" | "Expired" | "Cancelled";

function getStatusVariant(
  status: PolicyStatus,
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "Active":
      return "default";
    case "Pending":
      return "secondary";
    case "Expired":
    case "Cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function AdminPoliciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useAdminPolicies({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });
  const { data: stats } = useAdminStats();

  const policies = data?.policies || [];
  const total = data?.pagination?.total ?? 0;

  const handleExport = () => {
    if (!policies.length) return;
    const headers = [
      "Policy Number",
      "Customer",
      "Email",
      "Type",
      "Coverage",
      "Premium",
      "Status",
    ];
    const rows = policies.map((p) => [
      p.policyNumber,
      p.userName,
      p.userEmail,
      p.policyType,
      p.coverageAmount,
      p.premiumAmount,
      p.status,
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
    a.download = `policies-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="admin-policies-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground">
            View and manage all customer policies
          </p>
        </div>
        <Button
          variant="outline"
          className="pr-5"
          onClick={handleExport}
          disabled={!policies.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Policies</p>
              <p className="text-3xl font-bold">{stats?.totalPolicies ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-3xl font-bold">{stats?.activePolicies ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold">
                {(stats?.totalPolicies ?? 0) - (stats?.activePolicies ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-3xl font-bold">
                {stats?.monthlyRevenue ?? "ZMW 0"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Policies List
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
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
                      <TableHead>Policy Number</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Customer
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Type
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Coverage
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Premium
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.length > 0 ? (
                      policies.map((policy) => (
                        <TableRow key={policy.policyNumber}>
                          <TableCell className="font-medium">
                            {policy.policyNumber}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <p className="font-medium">{policy.userName}</p>
                              <p className="text-sm text-muted-foreground">
                                {policy.userEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {policy.policyType}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {policy.coverageAmount}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {policy.premiumAmount}/mo
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(policy.status)}>
                              {policy.status}
                            </Badge>
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
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    toast.success(
                                      `Policy ${policy.policyNumber} cancelled`,
                                    )
                                  }
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Policy
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                              No policies found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Showing {policies.length} of {total} policies
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
