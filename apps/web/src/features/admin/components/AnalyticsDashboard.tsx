import {
  Users,
  FileText,
  ClipboardList,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
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
import {
  useAdminStats,
  useMonthlyData,
  usePolicyDistribution,
} from "../hooks/useAdmin";

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-xs">
                {changeType === "increase" ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-success" />
                    <span className="text-success">{change}</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">{change}</span>
                  </>
                )}
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your insurance business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description={`${stats?.activeUsers ?? 0} active`}
        />
        <StatCard
          title="Active Policies"
          value={stats?.activePolicies ?? 0}
          icon={FileText}
          description={`${stats?.totalPolicies ?? 0} total`}
        />
        <StatCard
          title="Pending Claims"
          value={stats?.pendingClaims ?? 0}
          icon={ClipboardList}
          description={`${stats?.totalClaims ?? 0} total claims`}
        />
        <StatCard
          title="Monthly Revenue"
          value={stats?.monthlyRevenue ?? "ZMW 0"}
          icon={DollarSign}
        />
      </div>

      {/* Revenue Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue vs Payouts
            </CardTitle>
            <CardDescription>
              Monthly comparison of revenue collected and claims paid out
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                          stopOpacity={0.3}
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
                          stopColor="#F59E0B"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F59E0B"
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
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `ZMW ${value.toLocaleString()}`,
                        "",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
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
                      stroke="#F59E0B"
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

        {/* Policy Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Distribution</CardTitle>
            <CardDescription>Breakdown by policy type</CardDescription>
          </CardHeader>
          <CardContent>
            {distLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : policyDistribution && policyDistribution.length > 0 ? (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={policyDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
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
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {policyDistribution.map((item: any) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
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

      {/* Claims & New Policies Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              New Policies
            </CardTitle>
            <CardDescription>Monthly new policy registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
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
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="newPolicies"
                      fill="#22C55E"
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-warning" />
              Claims Filed
            </CardTitle>
            <CardDescription>Monthly claims submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
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
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="claims"
                      fill="#F59E0B"
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Total Revenue (YTD)
              </p>
              <p className="text-2xl font-bold text-primary">
                {stats?.totalRevenue ?? "ZMW 0"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Total Payouts (YTD)
              </p>
              <p className="text-2xl font-bold text-warning">
                {stats?.totalPayouts ?? "ZMW 0"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Approved Claims</p>
              <p className="text-2xl font-bold text-success">
                {stats?.approvedClaims ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rejected Claims</p>
              <p className="text-2xl font-bold text-destructive">
                {stats?.rejectedClaims ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
