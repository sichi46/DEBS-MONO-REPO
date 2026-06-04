import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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

    render(<AnalyticsDashboard />);

    // The component returns a Loader2 spinner when statsLoading is true
    // which renders an SVG with the animate-spin class
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();

    // The dashboard content should NOT be rendered
    expect(screen.queryByTestId("analytics-dashboard")).not.toBeInTheDocument();
  });

  it("should render stat cards with data", () => {
    setDefaultMocks();

    render(<AnalyticsDashboard />);

    expect(screen.getByTestId("analytics-dashboard")).toBeInTheDocument();

    // Check stat card titles
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Active Policies")).toBeInTheDocument();
    expect(screen.getByText("Pending Claims")).toBeInTheDocument();
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();

    // Check stat card values
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("ZMW 25,000")).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText("120 active")).toBeInTheDocument();
    expect(screen.getByText("100 total")).toBeInTheDocument();
    expect(screen.getByText("45 total claims")).toBeInTheDocument();
  });

  it("should render 'No policy data yet' when distribution is empty", () => {
    setDefaultMocks({ policyDistribution: [] });

    render(<AnalyticsDashboard />);

    expect(screen.getByText("No policy data yet")).toBeInTheDocument();
  });

  it("should render policy distribution data when available", () => {
    const distribution = [
      { type: "Auto", count: 40, percentage: 47, color: "#0057B7" },
      { type: "Home", count: 30, percentage: 35, color: "#22C55E" },
      { type: "Life", count: 15, percentage: 18, color: "#F59E0B" },
    ];

    setDefaultMocks({ policyDistribution: distribution });

    render(<AnalyticsDashboard />);

    expect(screen.queryByText("No policy data yet")).not.toBeInTheDocument();
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Life")).toBeInTheDocument();
    expect(screen.getByText("47%")).toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
    expect(screen.getByText("18%")).toBeInTheDocument();
  });
});
