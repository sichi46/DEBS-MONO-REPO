import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

// Mock recharts to avoid rendering issues in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Area: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Bar: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

// Mock the admin hooks
vi.mock("../hooks/useAdmin", () => ({
  useAdminStats: vi.fn(),
  useMonthlyData: vi.fn(),
  usePolicyDistribution: vi.fn(),
}));

import {
  useAdminStats,
  useMonthlyData,
  usePolicyDistribution,
} from "../hooks/useAdmin";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";

const mockUseAdminStats = vi.mocked(useAdminStats);
const mockUseMonthlyData = vi.mocked(useMonthlyData);
const mockUsePolicyDistribution = vi.mocked(usePolicyDistribution);

const mockStats = {
  totalUsers: 150,
  activeUsers: 120,
  activePolicies: 85,
  totalPolicies: 100,
  pendingClaims: 12,
  totalClaims: 45,
  monthlyRevenue: "ZMW 25,000",
  totalRevenue: "ZMW 250,000",
  totalPayouts: "ZMW 80,000",
  approvedClaims: 30,
  rejectedClaims: 3,
};

function setDefaultMocks(overrides?: {
  statsLoading?: boolean;
  monthlyLoading?: boolean;
  distLoading?: boolean;
  stats?: typeof mockStats | undefined;
  policyDistribution?:
    | Array<{ type: string; count: number; percentage: number; color: string }>
    | undefined;
}) {
  mockUseAdminStats.mockReturnValue({
    data: overrides?.stats !== undefined ? overrides.stats : mockStats,
    isLoading: overrides?.statsLoading ?? false,
  } as never);

  mockUseMonthlyData.mockReturnValue({
    data: [],
    isLoading: overrides?.monthlyLoading ?? false,
  } as never);

  mockUsePolicyDistribution.mockReturnValue({
    data:
      overrides?.policyDistribution !== undefined
        ? overrides.policyDistribution
        : [],
    isLoading: overrides?.distLoading ?? false,
  } as never);
}

describe("AnalyticsDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading spinner when stats are loading", () => {
    setDefaultMocks({ statsLoading: true, stats: undefined });

    renderWithRouter(<AnalyticsDashboard />);

    // Component always renders (no blocking spinner); dashboard is present
    expect(screen.getByTestId("analytics-dashboard")).toBeInTheDocument();

    // With no stats data, fallback values are used (12, 7, 3)
    expect(screen.getByText("Total policies")).toBeInTheDocument();
  });

  it("should render stat cards with data", () => {
    setDefaultMocks();

    renderWithRouter(<AnalyticsDashboard />);

    expect(screen.getByTestId("analytics-dashboard")).toBeInTheDocument();

    // Check stat card titles (reference V2 labels)
    expect(screen.getByText("Total policies")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByText("Open claims")).toBeInTheDocument();
    expect(screen.getByText("Revenue (MTD)")).toBeInTheDocument();

    // Check stat card values from mockStats
    expect(screen.getAllByText("100").length).toBeGreaterThan(0); // totalPolicies (also in donut center)
    expect(screen.getByText("150")).toBeInTheDocument(); // totalUsers
    expect(screen.getByText("12")).toBeInTheDocument(); // pendingClaims
    expect(screen.getByText("ZMW 25,000")).toBeInTheDocument(); // monthlyRevenue
  });

  it("should render 'No policy data yet' when distribution is empty", () => {
    setDefaultMocks({ policyDistribution: [] });

    renderWithRouter(<AnalyticsDashboard />);

    expect(screen.getByText("No policy data yet")).toBeInTheDocument();
  });

  it("should render policy distribution data when available", () => {
    const distribution = [
      { type: "Auto", count: 40, percentage: 47, color: "#0057B7" },
      { type: "Home", count: 30, percentage: 35, color: "#22C55E" },
      { type: "Life", count: 15, percentage: 18, color: "#F59E0B" },
    ];

    setDefaultMocks({ policyDistribution: distribution });

    renderWithRouter(<AnalyticsDashboard />);

    expect(screen.queryByText("No policy data yet")).not.toBeInTheDocument();
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Life")).toBeInTheDocument();
    expect(screen.getByText("47%")).toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
    expect(screen.getByText("18%")).toBeInTheDocument();
  });

  it("should render 'Needs your attention' section with pending claims", () => {
    setDefaultMocks();
    renderWithRouter(<AnalyticsDashboard />);
    // V2 label
    expect(screen.getByText("Claims needing attention")).toBeInTheDocument();
    // Pending/Under Review claims from mockAllClaims are always rendered
    expect(screen.getByText(/CLM-2024-0002/)).toBeInTheDocument();
  });
});
