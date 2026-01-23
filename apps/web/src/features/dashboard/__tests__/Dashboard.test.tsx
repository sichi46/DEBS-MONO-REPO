import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { DashboardOverview } from "../components/DashboardOverview";
import { StatsCards } from "../components/StatsCards";
import { PolicyCard } from "../components/PolicyCard";
import { ClaimCard } from "../components/ClaimCard";
import { AvailablePolicies } from "../components/AvailablePolicies";
import { mockDashboardStats, mockPolicies, mockClaims, mockAvailablePolicies } from "@/lib/mock-data";

// Mock the API module with inline data to avoid hoisting issues
vi.mock("../api", async () => {
    const mockData = await import("@/lib/mock-data");
    return {
        dashboardApi: {
            getDashboardData: vi.fn().mockResolvedValue({
                stats: mockData.mockDashboardStats,
                recentPolicies: mockData.mockPolicies.slice(0, 3),
                recentClaims: mockData.mockClaims.slice(0, 3),
                availablePolicies: mockData.mockAvailablePolicies,
            }),
            getStats: vi.fn().mockResolvedValue(mockData.mockDashboardStats),
            getRecentPolicies: vi.fn().mockResolvedValue(mockData.mockPolicies.slice(0, 3)),
            getRecentClaims: vi.fn().mockResolvedValue(mockData.mockClaims.slice(0, 3)),
        },
    };
});

describe("StatsCards", () => {
    it("renders loading skeletons when isLoading is true", () => {
        renderWithProviders(<StatsCards isLoading={true} />);
        expect(screen.getByTestId("stats-loading")).toBeInTheDocument();
    });

    it("renders stats cards with data", () => {
        renderWithProviders(<StatsCards stats={mockDashboardStats} />);
        expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
        expect(screen.getByText("Active Policies")).toBeInTheDocument();
        expect(screen.getByText("Pending Claims")).toBeInTheDocument();
        expect(screen.getByText("Approved Claims")).toBeInTheDocument();
        expect(screen.getByText("Next Payment")).toBeInTheDocument();
    });

    it("displays correct stat values", () => {
        renderWithProviders(<StatsCards stats={mockDashboardStats} />);
        // Use getAllByText since the same number might appear in multiple places
        expect(screen.getAllByText(mockDashboardStats.activePolicies.toString()).length).toBeGreaterThan(0);
        expect(screen.getAllByText(mockDashboardStats.pendingClaims.toString()).length).toBeGreaterThan(0);
        expect(screen.getAllByText(mockDashboardStats.approvedClaims.toString()).length).toBeGreaterThan(0);
        expect(screen.getByText(mockDashboardStats.nextPaymentAmount)).toBeInTheDocument();
    });

    it("renders nothing when no stats and not loading", () => {
        const { container } = renderWithProviders(<StatsCards />);
        expect(container.firstChild).toBeNull();
    });
});

describe("PolicyCard", () => {
    it("renders loading skeletons when isLoading is true", () => {
        renderWithProviders(<PolicyCard isLoading={true} />);
        expect(screen.getByTestId("policy-card")).toBeInTheDocument();
        expect(screen.getByTestId("policies-loading")).toBeInTheDocument();
    });

    it("renders policies list when data is provided", () => {
        renderWithProviders(<PolicyCard policies={mockPolicies} />);
        expect(screen.getByTestId("policy-card")).toBeInTheDocument();
        expect(screen.getByText("My Policies")).toBeInTheDocument();
        expect(screen.getByText("Life Insurance Premium")).toBeInTheDocument();
        expect(screen.getByText("Health Insurance")).toBeInTheDocument();
    });

    it("shows empty state when no policies", () => {
        renderWithProviders(<PolicyCard policies={[]} />);
        expect(screen.getByText("No policies yet")).toBeInTheDocument();
        expect(screen.getByText("Browse Policies")).toBeInTheDocument();
    });

    it("displays View All link", () => {
        renderWithProviders(<PolicyCard policies={mockPolicies} />);
        expect(screen.getByText("View All")).toBeInTheDocument();
    });
});

describe("ClaimCard", () => {
    it("renders loading skeletons when isLoading is true", () => {
        renderWithProviders(<ClaimCard isLoading={true} />);
        expect(screen.getByTestId("claim-card")).toBeInTheDocument();
        expect(screen.getByTestId("claims-loading")).toBeInTheDocument();
    });

    it("renders claims list when data is provided", () => {
        renderWithProviders(<ClaimCard claims={mockClaims} />);
        expect(screen.getByTestId("claim-card")).toBeInTheDocument();
        expect(screen.getByText("Recent Claims")).toBeInTheDocument();
    });

    it("shows empty state when no claims", () => {
        renderWithProviders(<ClaimCard claims={[]} />);
        expect(screen.getByText("No claims yet")).toBeInTheDocument();
        expect(screen.getByText("Submit a Claim")).toBeInTheDocument();
    });

    it("displays New Claim button", () => {
        renderWithProviders(<ClaimCard claims={mockClaims} />);
        expect(screen.getByText("New Claim")).toBeInTheDocument();
    });
});

describe("AvailablePolicies", () => {
    it("renders loading skeletons when isLoading is true", () => {
        renderWithProviders(<AvailablePolicies isLoading={true} />);
        expect(screen.getByTestId("available-policies")).toBeInTheDocument();
        expect(screen.getByTestId("available-policies-loading")).toBeInTheDocument();
    });

    it("renders policies grid when data is provided", () => {
        renderWithProviders(<AvailablePolicies policies={mockAvailablePolicies} />);
        expect(screen.getByTestId("available-policies")).toBeInTheDocument();
        expect(screen.getByText("Browse Policies")).toBeInTheDocument();
        expect(screen.getByText("Auto Insurance")).toBeInTheDocument();
        expect(screen.getByText("Home Insurance")).toBeInTheDocument();
    });

    it("shows empty state when no policies available", () => {
        renderWithProviders(<AvailablePolicies policies={[]} />);
        expect(screen.getByText("No policies available")).toBeInTheDocument();
    });

    it("displays Learn More buttons", () => {
        renderWithProviders(<AvailablePolicies policies={mockAvailablePolicies} />);
        const learnMoreButtons = screen.getAllByText("Learn More");
        expect(learnMoreButtons.length).toBe(mockAvailablePolicies.length);
    });
});

describe("DashboardOverview", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the dashboard container", async () => {
        renderWithProviders(<DashboardOverview />);

        await waitFor(() => {
            expect(screen.getByTestId("dashboard-overview")).toBeInTheDocument();
        });
    });

    it("displays dashboard title and welcome message", async () => {
        renderWithProviders(<DashboardOverview />);

        await waitFor(() => {
            expect(screen.getByText("Dashboard")).toBeInTheDocument();
            expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
        });
    });

    it("renders all dashboard sections", async () => {
        renderWithProviders(<DashboardOverview />);

        await waitFor(() => {
            expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
            expect(screen.getByTestId("policy-card")).toBeInTheDocument();
            expect(screen.getByTestId("claim-card")).toBeInTheDocument();
            expect(screen.getByTestId("available-policies")).toBeInTheDocument();
        });
    });
});
