import { useState } from "react";
import {
  Users,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Eye,
  Ban,
  CheckCircle,
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
import { useAdminUsers, useUpdateUserStatus } from "../hooks/useAdmin";

type UserStatus = "active" | "inactive" | "suspended";
type UserRole = "admin" | "user" | "agent";

function getStatusVariant(
  status: UserStatus,
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "suspended":
      return "destructive";
    default:
      return "secondary";
  }
}

function getRoleVariant(role: UserRole): "default" | "secondary" | "outline" {
  switch (role) {
    case "admin":
      return "default";
    case "agent":
      return "secondary";
    case "user":
      return "outline";
    default:
      return "outline";
  }
}

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useAdminUsers({
    search: searchQuery || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const updateStatus = useUpdateUserStatus();

  const users = data?.users || [];
  const totalUsers = data?.pagination?.total ?? 0;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const customers = users.filter((u) => u.role === "user").length;
  const admins = users.filter(
    (u) => u.role === "admin" || u.role === "agent",
  ).length;

  const handleStatusUpdate = (userId: string, status: string) => {
    updateStatus.mutate(
      { id: userId, status },
      {
        onSuccess: () => toast.success("User status updated"),
        onError: (err: Error) =>
          toast.error(err.message || "Failed to update status"),
      },
    );
  };

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Header */}
      <div>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
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
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{customers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admin & Agents</p>
                <p className="text-2xl font-bold">{admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Customer</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Role
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Policies
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Last Active
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
                                {user.avatarInitials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {user.name}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant={getRoleVariant(user.role)}
                              className="capitalize"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant={getStatusVariant(user.status)}
                              className="capitalize"
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {user.policiesCount}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {user.lastActive}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    toast(`Loading ${user.name}'s details...`, {
                                      icon: "👤",
                                    })
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.open(
                                      `mailto:${user.email}`,
                                      "_blank",
                                    );
                                  }}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.open(
                                      `tel:${user.phone || ""}`,
                                      "_blank",
                                    );
                                  }}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Call User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "suspended" ? (
                                  <DropdownMenuItem
                                    className="text-success"
                                    onClick={() =>
                                      handleStatusUpdate(user.id, "ACTIVE")
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Reactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleStatusUpdate(user.id, "SUSPENDED")
                                    }
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                              No users found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Results count */}
              <p className="mt-4 text-sm text-muted-foreground">
                Showing {users.length} of {totalUsers} users
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
