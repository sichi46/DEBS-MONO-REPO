import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  Shield,
  PieChart as PieChartIcon,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  useAdminStats,
  useMonthlyData,
  usePolicyDistribution,
} from "../hooks/useAdmin";
import {
  mockMonthlyData,
  mockPolicyDistribution,
  mockAllClaims,
  type MonthlyData,
  type PolicyDistribution,
} from "@/lib/mock-data";

// ---------- helpers ----------

function PanelHeader({
  icon: Icon,
  tone,
  title,
  sub,
  actionLabel,
  actionHref,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?:
    | "primary"
    | "accent"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
    | "info";
  title: string;
  sub?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-start justify-between mb-[18px]">
      <div className="flex items-center gap-3">
        <IconChip icon={Icon as any} tone={tone ?? "primary"} size="sm" />
        <div>
          <p className="text-[14px] font-semibold text-foreground leading-tight">
            {title}
          </p>
          {sub && (
            <p className="text-[12px] text-muted-foreground mt-0.5">{sub}</p>
          )}
        </div>
      </div>
      {actionLabel && actionHref && (
        <button
          onClick={() => navigate(actionHref)}
          className="text-[12px] font-semibold text-primary hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Small bar chart shared component
function SmallBars({
  data,
  color,
}: {
  data: { name: string; v: number }[];
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 4"
          vertical={false}
          stroke="var(--color-border)"
        />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 9.5, fill: "var(--color-muted-foreground)", dy: 4 }}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          width={28}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 9.5, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)" }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="v" fill={color} maxBarSize={22} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- main component ----------

export function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { data: stats } = useAdminStats();
  const { data: monthlyRaw } = useMonthlyData();
  const { data: distRaw } = usePolicyDistribution();

  const monthlyData: MonthlyData[] =
    (monthlyRaw as MonthlyData[] | undefined) ?? mockMonthlyData;
  const policyDist: PolicyDistribution[] =
    (distRaw as PolicyDistribution[] | undefined) ?? mockPolicyDistribution;

  // Attention claims: Pending or Under Review
  const attentionClaims = mockAllClaims.filter(
    (c) => c.status === "Pending" || c.status === "Under Review",
  );

  // Bar chart data
  const revenueChartData = monthlyData.map((d) => ({
    m: d.month,
    rev: +(d.revenue / 1000).toFixed(1),
    pay: +(d.payouts / 1000).toFixed(1),
  }));

  return (
    <div
      className="space-y-[18px] animate-fade-up"
      data-testid="analytics-dashboard"
    >
      {/* SECTION 1 — KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[18px]">
        {/* Total policies */}
        <div className="bg-card border border-border rounded-2xl p-[22px] flex justify-between items-start">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">
              Total policies
            </p>
            <p
              className="text-[27px] font-extrabold mt-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.totalPolicies ?? 12}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-[color:var(--color-success)] flex items-center gap-0.5 font-semibold">
                <TrendingUp className="h-3 w-3" />
                +8%
              </span>
              vs last month
            </p>
          </div>
          <IconChip icon={Shield} tone="primary" size="md" />
        </div>

        {/* Customers */}
        <div className="bg-card border border-border rounded-2xl p-[22px] flex justify-between items-start">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">
              Customers
            </p>
            <p
              className="text-[27px] font-extrabold mt-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.totalUsers ?? 7}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-[color:var(--color-success)] font-semibold">
                +2
              </span>
              this month
            </p>
          </div>
          <IconChip icon={Users} tone="success" size="md" />
        </div>

        {/* Open claims */}
        <div className="bg-card border border-border rounded-2xl p-[22px] flex justify-between items-start">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">
              Open claims
            </p>
            <p
              className="text-[27px] font-extrabold mt-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.pendingClaims ?? 3}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Needs action
            </p>
          </div>
          <IconChip icon={ClipboardList} tone="warning" size="md" />
        </div>

        {/* Revenue MTD */}
        <div className="bg-card border border-border rounded-2xl p-[22px] flex justify-between items-start">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">
              Revenue (MTD)
            </p>
            <p
              className="text-[27px] font-extrabold mt-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stats?.monthlyRevenue ?? "ZMW 88k"}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-[color:var(--color-success)] flex items-center gap-0.5 font-semibold">
                <TrendingUp className="h-3 w-3" />
                +11%
              </span>
              vs ZMW 79k last
            </p>
          </div>
          <IconChip icon={TrendingUp} tone="info" size="md" />
        </div>
      </div>

      {/* SECTION 2 — Revenue vs Payouts + Policy distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] items-start">
        {/* Revenue vs Payouts */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <PanelHeader
            icon={TrendingUp}
            tone="primary"
            title="Revenue vs Payouts"
            sub="Monthly comparison this year"
          />
          {/* Legend */}
          <div className="flex gap-4 mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-[3px] bg-[color:var(--color-primary)]" />
              <span className="text-[12px] text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-[3px] bg-[color:var(--color-brand-accent)]" />
              <span className="text-[12px] text-muted-foreground">Payouts</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={revenueChartData}
              barGap={5}
              barCategoryGap="24%"
              margin={{ top: 6, right: 6, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 4"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="m"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickFormatter={(v) => `ZMW ${v}k`}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="rev"
                name="Revenue"
                fill="var(--color-primary)"
                maxBarSize={16}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pay"
                name="Payouts"
                fill="var(--color-brand-accent)"
                maxBarSize={16}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Policy distribution */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <PanelHeader
            icon={PieChartIcon}
            tone="accent"
            title="Policy distribution"
            sub="By policy type"
          />
          <div className="flex items-center gap-[18px] flex-wrap justify-center">
            {/* Pie */}
            <div className="relative flex-shrink-0">
              <PieChart width={200} height={200}>
                <Pie
                  data={policyDist.map((d) => ({
                    ...d,
                    pct: d.percentage,
                    label: d.type,
                  }))}
                  dataKey="pct"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius="31%"
                  outerRadius="46%"
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {policyDist.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className="text-[26px] font-extrabold leading-none"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {stats?.totalPolicies ?? 12}
                </span>
                <span className="text-[9.5px] font-bold tracking-widest text-muted-foreground mt-0.5 uppercase">
                  Policies
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid gap-[9px] flex-1 min-w-[130px]">
              {policyDist.length === 0 && (
                <p className="text-[13px] text-muted-foreground">
                  No policy data yet
                </p>
              )}
              {policyDist.map((d) => (
                <div key={d.type} className="flex items-center gap-2">
                  <div
                    className="w-[10px] h-[10px] rounded-[3px] flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-[13px] text-muted-foreground flex-1">
                    {d.type}
                  </span>
                  <span
                    className="text-[13px] font-bold"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {d.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Small bar charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        {/* New policies */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <PanelHeader
            icon={FileText}
            tone="primary"
            title="New policies"
            sub="Monthly registrations"
          />
          <SmallBars
            data={monthlyData.map((d) => ({ name: d.month, v: d.newPolicies }))}
            color="var(--color-primary)"
          />
        </div>

        {/* Claims filed */}
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          <PanelHeader
            icon={ClipboardList}
            tone="accent"
            title="Claims filed"
            sub="Monthly submissions"
          />
          <SmallBars
            data={monthlyData.map((d) => ({ name: d.month, v: d.claims }))}
            color="var(--color-brand-accent)"
          />
        </div>
      </div>

      {/* SECTION 4 — Claims needing attention */}
      <div className="bg-card border border-border rounded-2xl p-[22px]">
        <PanelHeader
          icon={AlertCircle}
          tone="warning"
          title="Claims needing attention"
          actionLabel="Review all"
          actionHref="/admin/claims"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {attentionClaims.map((c) => (
              <TableRow
                key={c.claimId}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate("/admin/claims")}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        c.status === "Pending"
                          ? "bg-destructive"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="font-bold text-[13px]">{c.claimId}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px]">{c.userName}</TableCell>
                <TableCell className="text-[13px]">{c.claimType}</TableCell>
                <TableCell>
                  <span
                    className="font-bold text-[13px]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {c.claimAmount}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      c.status === "Pending"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-400/10 text-amber-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
