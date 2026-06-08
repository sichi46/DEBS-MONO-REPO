import { useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  UserPlus,
  MoreHorizontal,
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
import { useAdminUsers } from "../hooks/useAdmin";

type UserStatus = "active" | "inactive" | "suspended" | "pending";
type UserRole = "admin" | "agent" | "user";

function getAvatarGradient(role: UserRole): string {
  if (role === "admin") return "linear-gradient(140deg,#2D6BD4,#0D3C85)";
  if (role === "agent") return "linear-gradient(140deg,#E7A24A,#B9701B)";
  return "linear-gradient(140deg,#34B978,#157A45)";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { label: string; dot: string; cls: string }> = {
    active: {
      label: "Active",
      dot: "bg-[var(--color-success)]",
      cls: "border-transparent bg-success/10 text-success",
    },
    inactive: {
      label: "Inactive",
      dot: "bg-muted-foreground",
      cls: "border-transparent bg-muted text-muted-foreground",
    },
    suspended: {
      label: "Suspended",
      dot: "bg-destructive",
      cls: "border-transparent bg-destructive/10 text-destructive",
    },
    pending: {
      label: "Pending",
      dot: "bg-warning",
      cls: "border-transparent bg-warning/10 text-warning",
    },
  };
  const cfg = map[status] ?? map.inactive;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function UsersPage() {
  const [searchQuery] = useState("");
  const [roleFilter] = useState<string>("all");
  const [statusFilter] = useState<string>("all");

  const { data, isLoading } = useAdminUsers({
    search: searchQuery || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const users = data?.users || [];
  const totalUsers = data?.pagination?.total ?? users.length;
  const activeUsers = users.filter((u: any) => u.status === "active").length;
  const pendingInactive = users.filter(
    (u: any) => u.status === "inactive" || u.status === "pending",
  ).length;

  return (
    <div className="space-y-[18px]" data-testid="users-page">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
        {/* Total users */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium mb-1">
              Total Users
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {totalUsers}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              All registered users
            </p>
          </div>
          <IconChip icon={Users} tone="primary" size="md" />
        </div>

        {/* Active */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium mb-1">
              Active
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {activeUsers}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Currently active
            </p>
          </div>
          <IconChip icon={CheckCircle} tone="success" size="md" />
        </div>

        {/* Pending / Inactive */}
        <div className="bg-card border border-border rounded-2xl p-[18px] flex justify-between items-start">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium mb-1">
              Pending / Inactive
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {pendingInactive}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Awaiting action
            </p>
          </div>
          <IconChip icon={Clock} tone="warning" size="md" />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-2xl">
        {/* Toolbar */}
        <div className="flex justify-between items-center gap-4 flex-wrap p-[22px] pb-0">
          <div>
            <span className="text-[13.5px] text-muted-foreground font-semibold">
              {users.length} users
            </span>
            {searchQuery && (
              <span className="text-[13.5px] text-muted-foreground font-semibold ml-1">
                matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
          <Button size="sm" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            Add user
          </Button>
        </div>

        {/* Table */}
        <div className="p-[8px] pt-[14px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Policies</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user: any) => {
                    const role: UserRole =
                      user.role === "admin"
                        ? "admin"
                        : user.role === "agent"
                          ? "agent"
                          : "user";
                    const initials =
                      user.avatarInitials || getInitials(user.name || "");
                    const status: UserStatus = (
                      user.status ?? "inactive"
                    ).toLowerCase() as UserStatus;
                    return (
                      <TableRow key={user.id}>
                        {/* User cell */}
                        <TableCell>
                          <div className="flex items-center gap-[11px]">
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                              style={{ background: getAvatarGradient(role) }}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[14px] truncate leading-tight">
                                {user.name}
                              </p>
                              <p className="text-[12px] text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Policies */}
                        <TableCell>
                          <span
                            className="font-semibold text-[14px]"
                            style={{ fontFamily: "var(--font-serif)" }}
                          >
                            {user.policiesCount ?? 0}
                          </span>
                        </TableCell>

                        {/* Joined */}
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-[13px]">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "2-digit",
                                },
                              )
                            : (user.joinedAt ?? "—")}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <button
                            className="w-[34px] h-[34px] border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                            onClick={() =>
                              toast.info(`Actions for ${user.name}`)
                            }
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">
                          No users found
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
