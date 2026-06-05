import {
  Users,
  FileText,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  useAdminStats,
  useMonthlyData,
  usePolicyDistribution,
} from "../hooks/useAdmin";

// Minimal mock for "needs attention" — in production this comes from the API
const attentionClaims = [
  {
    id: "CLM-001",
    type: "Medical",
    amount: "ZMW 45,000",
    customer: "Grace M.",
    priority: "high" as const,
  },
  {
    id: "CLM-002",
    type: "Auto",
    amount: "ZMW 12,500",
    customer: "Chanda K.",
    priority: "medium" as const,
  },
  {
    id: "CLM-003",
    type: "Home",
    amount: "ZMW 8,200",
    customer: "Mwale B.",
    priority: "low" as const,
  },
];

const priorityVariant: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

export function AnalyticsDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyData();
  const { data: policyDistribution, isLoading: distLoading } =
    usePolicyDistribution();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6 animate-fade-up"
      data-testid="analytics-dashboard"
    >
      <p className="text-muted-foreground">
        Overview of your insurance business performance
      </p>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          sublabel={`${stats?.activeUsers ?? 0} active`}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Active Policies"
          value={stats?.activePolicies ?? 0}
          sublabel={`${stats?.totalPolicies ?? 0} total`}
          icon={FileText}
          tone="success"
        />
        <StatCard
          label="Pending Claims"
          value={stats?.pendingClaims ?? 0}
          sublabel={`${stats?.totalClaims ?? 0} total claims`}
          icon={ClipboardList}
          tone="warning"
        />
        <StatCard
          label="Monthly Revenue"
          value={stats?.monthlyRevenue ?? "ZMW 0"}
          icon={DollarSign}
          tone="neutral"
        />
      </div>

      {/* Revenue Chart + Policy Distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue vs Payouts
            </CardTitle>
            <CardDescription>
              Monthly comparison of revenue collected and claims paid out
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {monthlyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData || []}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0057B7"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0057B7"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorPayouts"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#D9892A"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#D9892A"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `ZMW ${value.toLocaleString()}`,
                        "",
                      ]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #CBD5E0",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0057B7"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="payouts"
                      stroke="#D9892A"
                      fillOpacity={1}
                      fill="url(#colorPayouts)"
                      name="Payouts"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Policy Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Policy Distribution</CardTitle>
            <CardDescription>Breakdown by policy type</CardDescription>
          </CardHeader>
          <CardContent>
            {distLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : policyDistribution && policyDistribution.length > 0 ? (
              <>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={policyDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {policyDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(
                          value: number,
                          _name: string,
                          props: any,
                        ) => [
                          `${value} policies (${props.payload.percentage}%)`,
                          props.payload.type,
                        ]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #CBD5E0",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  {policyDistribution.map((item: any) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">
                          {item.type}
                        </span>
                      </div>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No policy data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Needs your attention + summary cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Attention queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-warning" />
              Needs your attention
            </CardTitle>
            <CardDescription>Claims awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attentionClaims.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {c.id} · {c.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.customer}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{c.amount}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityVariant[c.priority]}`}
                    >
                      {c.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Total Revenue (YTD)
              </p>
              <p className="text-xl font-bold mt-1">
                {stats?.totalRevenue ?? "ZMW 0"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Total Payouts (YTD)
              </p>
              <p className="text-xl font-bold mt-1">
                {stats?.totalPayouts ?? "ZMW 0"}
              </p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-lg font-bold mt-1 text-success">
                  {stats?.approvedClaims ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-lg font-bold mt-1 text-destructive">
                  {stats?.rejectedClaims ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Charts: New Policies & Claims Filed */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              New Policies
            </CardTitle>
            <CardDescription>Monthly new policy registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {monthlyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #CBD5E0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="newPolicies"
                      fill="#0057B7"
                      radius={[4, 4, 0, 0]}
                      name="New Policies"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              Claims Filed
            </CardTitle>
            <CardDescription>Monthly claims submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {monthlyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #CBD5E0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="claims"
                      fill="#D9892A"
                      radius={[4, 4, 0, 0]}
                      name="Claims"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
