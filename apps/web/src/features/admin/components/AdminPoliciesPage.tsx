import { useState } from "react";
import {
    FileText,
    Search,
    MoreHorizontal,
    Eye,
    Download,
    XCircle,
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
import { mockAllPolicies, mockAdminAnalytics, type PolicyStatus } from "@/lib/mock-data";

function getStatusVariant(status: PolicyStatus): "default" | "secondary" | "destructive" {
    switch (status) {
        case "Active":
            return "default";
        case "Pending":
            return "secondary";
        case "Expired":
            return "destructive";
        default:
            return "secondary";
    }
}

export function AdminPoliciesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // Get unique policy types
    const policyTypes = [...new Set(mockAllPolicies.map((p) => p.policyType))];

    // Filter policies
    const filteredPolicies = mockAllPolicies.filter((policy) => {
        const matchesSearch =
            policy.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.policyType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
        const matchesType = typeFilter === "all" || policy.policyType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = mockAdminAnalytics;

    return (
        <div className="space-y-6" data-testid="admin-policies-page">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        All Policies
                    </h1>
                    <p className="text-muted-foreground">
                        View and manage all customer policies
                    </p>
                </div>
                <Button variant="outline">
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
                            <p className="text-3xl font-bold">{stats.totalPolicies}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Active</p>
                            <p className="text-3xl font-bold text-success">{stats.activePolicies}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-3xl font-bold text-warning">
                                {stats.totalPolicies - stats.activePolicies}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                            <p className="text-3xl font-bold text-primary">{stats.monthlyRevenue}</p>
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
                                placeholder="Search by policy number, customer, or type..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Policy Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {policyTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Policy Number</TableHead>
                                    <TableHead className="hidden md:table-cell">Customer</TableHead>
                                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                                    <TableHead className="hidden lg:table-cell">Coverage</TableHead>
                                    <TableHead className="hidden lg:table-cell">Premium</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPolicies.length > 0 ? (
                                    filteredPolicies.map((policy) => (
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
                                                        <DropdownMenuItem className="text-destructive">
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
                                                <p className="text-muted-foreground">No policies found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground">
                        Showing {filteredPolicies.length} of {mockAllPolicies.length} policies
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
