// =============================================================================
// DEBS Insurance - Centralized Mock Data
// =============================================================================
// This file contains all mock data used during frontend development.
// Replace API calls with real endpoints when backend is ready.
// Currency: ZMW (Zambian Kwacha)
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PolicyStatus = "Active" | "Pending" | "Expired";
export type ClaimStatus = "Approved" | "Pending" | "Under Review" | "Rejected";
export type PaymentStatus = "Paid" | "Pending" | "Failed";
export type PaymentMethod = "Mobile Money" | "Bank Transfer" | "Card";
export type PaymentFrequency = "Monthly" | "Quarterly" | "Annually";

// RBAC Types
export type UserRole = "admin" | "user" | "agent";
export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  role?: UserRole;
}

export interface AdminUser extends User {
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: string;
  joinDate: string;
  lastActive: string;
  policiesCount: number;
  totalPremiums: string;
}

export interface Policy {
  policyNumber: string;
  policyType: string;
  status: PolicyStatus;
  coverageAmount: string;
  premiumAmount: string;
  paymentFrequency: PaymentFrequency;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Claim {
  claimId: string;
  policyNumber: string;
  policyType: string;
  claimType: string;
  status: ClaimStatus;
  claimAmount: string;
  dateSubmitted: string;
  dateProcessed: string;
  description?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: string;
  status: PaymentStatus;
  method: PaymentMethod;
  policyNumber: string;
}

export interface AvailablePolicy {
  id: string;
  type: string;
  icon: string;
  description: string;
  startingPremium: string;
}

export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  pendingClaims: number;
  approvedClaims: number;
  totalClaimsAmount: string;
  nextPaymentDate: string;
  nextPaymentAmount: string;
}

export interface ClaimStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

// -----------------------------------------------------------------------------
// Mock User
// -----------------------------------------------------------------------------

export const mockUser: User = {
  id: "usr-001",
  name: "John Mwape",
  email: "john.mwape@example.com",
  avatarInitials: "JM",
};

// -----------------------------------------------------------------------------
// Mock Policies
// -----------------------------------------------------------------------------

export const mockPolicies: Policy[] = [
  {
    policyNumber: "LP-2024-001234",
    policyType: "Life Insurance Premium",
    status: "Active",
    coverageAmount: "ZMW 500,000",
    premiumAmount: "ZMW 1,200",
    paymentFrequency: "Monthly",
    startDate: "Jan 15, 2024",
    endDate: "Jan 15, 2034",
    description:
      "Comprehensive life insurance coverage with death benefits and critical illness cover.",
  },
  {
    policyNumber: "HI-2024-005678",
    policyType: "Health Insurance",
    status: "Active",
    coverageAmount: "ZMW 250,000",
    premiumAmount: "ZMW 850",
    paymentFrequency: "Monthly",
    startDate: "Mar 1, 2024",
    endDate: "Mar 1, 2025",
    description:
      "Full health coverage including hospitalization, outpatient care, and prescription drugs.",
  },
  {
    policyNumber: "AI-2024-009012",
    policyType: "Auto Insurance",
    status: "Pending",
    coverageAmount: "ZMW 150,000",
    premiumAmount: "ZMW 450",
    paymentFrequency: "Monthly",
    startDate: "Pending Approval",
    endDate: "—",
    description:
      "Comprehensive auto insurance covering collision, theft, and third-party liability.",
  },
];

// -----------------------------------------------------------------------------
// Mock Claims
// -----------------------------------------------------------------------------

export const mockClaims: Claim[] = [
  {
    claimId: "CLM-2024-0001",
    policyNumber: "HI-2024-005678",
    policyType: "Health Insurance",
    claimType: "Medical",
    status: "Approved",
    claimAmount: "ZMW 5,000",
    dateSubmitted: "Oct 10, 2025",
    dateProcessed: "Oct 12, 2025",
    description: "Hospital admission for minor surgery.",
  },
  {
    claimId: "CLM-2024-0002",
    policyNumber: "LP-2024-001234",
    policyType: "Life Insurance",
    claimType: "Critical Illness",
    status: "Pending",
    claimAmount: "ZMW 50,000",
    dateSubmitted: "Oct 15, 2025",
    dateProcessed: "—",
    description: "Critical illness benefit claim.",
  },
  {
    claimId: "CLM-2024-0003",
    policyNumber: "HI-2024-005678",
    policyType: "Health Insurance",
    claimType: "Hospital",
    status: "Under Review",
    claimAmount: "ZMW 12,500",
    dateSubmitted: "Oct 18, 2025",
    dateProcessed: "—",
    description: "Extended hospitalization claim.",
  },
  {
    claimId: "CLM-2024-0004",
    policyNumber: "AI-2024-009012",
    policyType: "Auto Insurance",
    claimType: "Accident",
    status: "Rejected",
    claimAmount: "ZMW 8,000",
    dateSubmitted: "Sep 5, 2025",
    dateProcessed: "Sep 10, 2025",
    description:
      "Minor fender bender claim - rejected due to policy not yet active.",
  },
  {
    claimId: "CLM-2024-0005",
    policyNumber: "HI-2024-005678",
    policyType: "Health Insurance",
    claimType: "Medical",
    status: "Approved",
    claimAmount: "ZMW 2,500",
    dateSubmitted: "Aug 20, 2025",
    dateProcessed: "Aug 22, 2025",
    description: "Outpatient consultation and medication.",
  },
];

// -----------------------------------------------------------------------------
// Mock Beneficiaries (for Policy Details)
// -----------------------------------------------------------------------------

export const mockBeneficiaries: Record<string, Beneficiary[]> = {
  "LP-2024-001234": [
    {
      id: "ben-001",
      name: "Mary Mwape",
      relationship: "Spouse",
      percentage: 60,
    },
    { id: "ben-002", name: "James Mwape", relationship: "Son", percentage: 40 },
  ],
  "HI-2024-005678": [
    {
      id: "ben-003",
      name: "John Mwape",
      relationship: "Self",
      percentage: 100,
    },
  ],
};

// -----------------------------------------------------------------------------
// Mock Payment History
// -----------------------------------------------------------------------------

export const mockPaymentHistory: PaymentRecord[] = [
  {
    id: "pay-001",
    date: "Oct 1, 2025",
    amount: "ZMW 1,200",
    status: "Paid",
    method: "Mobile Money",
    policyNumber: "LP-2024-001234",
  },
  {
    id: "pay-002",
    date: "Oct 1, 2025",
    amount: "ZMW 850",
    status: "Paid",
    method: "Bank Transfer",
    policyNumber: "HI-2024-005678",
  },
  {
    id: "pay-003",
    date: "Sep 1, 2025",
    amount: "ZMW 1,200",
    status: "Paid",
    method: "Mobile Money",
    policyNumber: "LP-2024-001234",
  },
  {
    id: "pay-004",
    date: "Sep 1, 2025",
    amount: "ZMW 850",
    status: "Paid",
    method: "Card",
    policyNumber: "HI-2024-005678",
  },
  {
    id: "pay-005",
    date: "Aug 1, 2025",
    amount: "ZMW 1,200",
    status: "Paid",
    method: "Mobile Money",
    policyNumber: "LP-2024-001234",
  },
  {
    id: "pay-006",
    date: "Aug 1, 2025",
    amount: "ZMW 850",
    status: "Paid",
    method: "Bank Transfer",
    policyNumber: "HI-2024-005678",
  },
  {
    id: "pay-007",
    date: "Jul 1, 2025",
    amount: "ZMW 1,200",
    status: "Paid",
    method: "Mobile Money",
    policyNumber: "LP-2024-001234",
  },
  {
    id: "pay-008",
    date: "Jul 1, 2025",
    amount: "ZMW 850",
    status: "Paid",
    method: "Card",
    policyNumber: "HI-2024-005678",
  },
];

// -----------------------------------------------------------------------------
// Mock Available Policies (for browsing)
// -----------------------------------------------------------------------------

export const mockAvailablePolicies: AvailablePolicy[] = [
  {
    id: "avail-001",
    type: "Auto Insurance",
    icon: "car",
    description:
      "Comprehensive coverage for your vehicle including collision, theft, and liability.",
    startingPremium: "ZMW 350/mo",
  },
  {
    id: "avail-002",
    type: "Home Insurance",
    icon: "home",
    description:
      "Protect your home and belongings from fire, theft, and natural disasters.",
    startingPremium: "ZMW 500/mo",
  },
  {
    id: "avail-003",
    type: "Travel Insurance",
    icon: "plane",
    description:
      "Coverage for trip cancellation, medical emergencies, and lost luggage.",
    startingPremium: "ZMW 150/trip",
  },
  {
    id: "avail-004",
    type: "Business Insurance",
    icon: "briefcase",
    description:
      "Comprehensive protection for your business assets and liability.",
    startingPremium: "ZMW 1,500/mo",
  },
];

// -----------------------------------------------------------------------------
// Mock Dashboard Stats
// -----------------------------------------------------------------------------

export const mockDashboardStats: DashboardStats = {
  totalPolicies: 3,
  activePolicies: 2,
  pendingClaims: 2,
  approvedClaims: 2,
  totalClaimsAmount: "ZMW 78,000",
  nextPaymentDate: "Nov 1, 2025",
  nextPaymentAmount: "ZMW 2,050",
};

// -----------------------------------------------------------------------------
// Mock Claim Stats
// -----------------------------------------------------------------------------

export const mockClaimStats: ClaimStats = {
  total: 5,
  approved: 2,
  pending: 2,
  rejected: 1,
};

// -----------------------------------------------------------------------------
// Claim Types (for form dropdown)
// -----------------------------------------------------------------------------

export const claimTypes = [
  "Medical",
  "Hospital",
  "Accident",
  "Death Benefit",
  "Critical Illness",
  "Property Damage",
  "Theft",
  "Other",
];

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

export function getPolicyByNumber(policyNumber: string): Policy | undefined {
  return mockPolicies.find((p) => p.policyNumber === policyNumber);
}

export function getClaimById(claimId: string): Claim | undefined {
  return mockClaims.find((c) => c.claimId === claimId);
}

export function getBeneficiariesForPolicy(policyNumber: string): Beneficiary[] {
  return mockBeneficiaries[policyNumber] || [];
}

export function getPaymentHistoryForPolicy(
  policyNumber: string,
): PaymentRecord[] {
  return mockPaymentHistory.filter((p) => p.policyNumber === policyNumber);
}

export function getClaimsForPolicy(policyNumber: string): Claim[] {
  return mockClaims.filter((c) => c.policyNumber === policyNumber);
}

// -----------------------------------------------------------------------------
// Status Color Mapping (for badges)
// -----------------------------------------------------------------------------

export const policyStatusColors: Record<PolicyStatus, string> = {
  Active: "bg-success text-success-foreground",
  Pending: "bg-warning text-warning-foreground",
  Expired: "bg-muted text-muted-foreground",
};

export const claimStatusColors: Record<ClaimStatus, string> = {
  Approved: "bg-success text-success-foreground",
  Pending: "bg-warning text-warning-foreground",
  "Under Review": "bg-primary text-primary-foreground",
  Rejected: "bg-destructive text-destructive-foreground",
};

export const paymentStatusColors: Record<PaymentStatus, string> = {
  Paid: "bg-success text-success-foreground",
  Pending: "bg-warning text-warning-foreground",
  Failed: "bg-destructive text-destructive-foreground",
};

export const userStatusColors: Record<UserStatus, string> = {
  active: "bg-success text-success-foreground",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-destructive text-destructive-foreground",
};

export const userRoleColors: Record<UserRole, string> = {
  admin: "bg-primary text-primary-foreground",
  user: "bg-secondary text-secondary-foreground",
  agent: "bg-warning text-warning-foreground",
};

// =============================================================================
// ADMIN SECTION - Mock Data for Admin Dashboard
// =============================================================================

// -----------------------------------------------------------------------------
// Admin User (logged in admin)
// -----------------------------------------------------------------------------

export const mockAdminUser: AdminUser = {
  id: "admin-001",
  name: "Sarah Banda",
  email: "sarah.banda@debsinsurance.com",
  avatarInitials: "SB",
  role: "admin",
  status: "active",
  phone: "+260 97 123 4567",
  joinDate: "Jan 1, 2023",
  lastActive: "Today",
  policiesCount: 0,
  totalPremiums: "ZMW 0",
};

// -----------------------------------------------------------------------------
// All Customers (for User Management)
// -----------------------------------------------------------------------------

export const mockAllUsers: AdminUser[] = [
  {
    id: "usr-001",
    name: "John Mwape",
    email: "john.mwape@example.com",
    avatarInitials: "JM",
    role: "user",
    status: "active",
    phone: "+260 96 111 2222",
    address: "123 Cairo Road, Lusaka",
    joinDate: "Jan 15, 2024",
    lastActive: "2 hours ago",
    policiesCount: 3,
    totalPremiums: "ZMW 2,500",
  },
  {
    id: "usr-002",
    name: "Grace Phiri",
    email: "grace.phiri@example.com",
    avatarInitials: "GP",
    role: "user",
    status: "active",
    phone: "+260 97 333 4444",
    address: "45 Independence Ave, Kitwe",
    joinDate: "Feb 20, 2024",
    lastActive: "1 day ago",
    policiesCount: 2,
    totalPremiums: "ZMW 1,850",
  },
  {
    id: "usr-003",
    name: "David Tembo",
    email: "david.tembo@example.com",
    avatarInitials: "DT",
    role: "user",
    status: "active",
    phone: "+260 95 555 6666",
    address: "78 Freedom Way, Ndola",
    joinDate: "Mar 5, 2024",
    lastActive: "3 days ago",
    policiesCount: 1,
    totalPremiums: "ZMW 500",
  },
  {
    id: "usr-004",
    name: "Mary Banda",
    email: "mary.banda@example.com",
    avatarInitials: "MB",
    role: "user",
    status: "inactive",
    phone: "+260 96 777 8888",
    address: "12 Church Road, Livingstone",
    joinDate: "Apr 10, 2024",
    lastActive: "2 weeks ago",
    policiesCount: 0,
    totalPremiums: "ZMW 0",
  },
  {
    id: "usr-005",
    name: "Peter Zulu",
    email: "peter.zulu@example.com",
    avatarInitials: "PZ",
    role: "user",
    status: "suspended",
    phone: "+260 97 999 0000",
    address: "56 Main Street, Chipata",
    joinDate: "May 15, 2024",
    lastActive: "1 month ago",
    policiesCount: 1,
    totalPremiums: "ZMW 350",
  },
  {
    id: "agent-001",
    name: "Michael Lungu",
    email: "michael.lungu@debsinsurance.com",
    avatarInitials: "ML",
    role: "agent",
    status: "active",
    phone: "+260 96 222 3333",
    address: "DEBS Office, Lusaka",
    joinDate: "Jan 1, 2024",
    lastActive: "5 minutes ago",
    policiesCount: 0,
    totalPremiums: "ZMW 0",
  },
  {
    id: "admin-002",
    name: "Jane Mutale",
    email: "jane.mutale@debsinsurance.com",
    avatarInitials: "JM",
    role: "admin",
    status: "active",
    phone: "+260 95 444 5555",
    address: "DEBS HQ, Lusaka",
    joinDate: "Jan 1, 2023",
    lastActive: "1 hour ago",
    policiesCount: 0,
    totalPremiums: "ZMW 0",
  },
];

// -----------------------------------------------------------------------------
// Admin Analytics Stats
// -----------------------------------------------------------------------------

export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalRevenue: string;
  monthlyRevenue: string;
  totalPayouts: string;
  monthlyPayouts: string;
}

export const mockAdminAnalytics: AdminAnalytics = {
  totalUsers: 156,
  activeUsers: 142,
  totalPolicies: 287,
  activePolicies: 245,
  totalClaims: 89,
  pendingClaims: 12,
  approvedClaims: 65,
  rejectedClaims: 12,
  totalRevenue: "ZMW 2,450,000",
  monthlyRevenue: "ZMW 285,000",
  totalPayouts: "ZMW 890,000",
  monthlyPayouts: "ZMW 125,000",
};

// -----------------------------------------------------------------------------
// Monthly Revenue Data (for charts)
// -----------------------------------------------------------------------------

export interface MonthlyData {
  month: string;
  revenue: number;
  payouts: number;
  newPolicies: number;
  claims: number;
}

export const mockMonthlyData: MonthlyData[] = [
  { month: "Jan", revenue: 220000, payouts: 85000, newPolicies: 24, claims: 8 },
  { month: "Feb", revenue: 235000, payouts: 92000, newPolicies: 28, claims: 6 },
  {
    month: "Mar",
    revenue: 248000,
    payouts: 78000,
    newPolicies: 32,
    claims: 10,
  },
  {
    month: "Apr",
    revenue: 255000,
    payouts: 105000,
    newPolicies: 26,
    claims: 12,
  },
  { month: "May", revenue: 268000, payouts: 88000, newPolicies: 30, claims: 7 },
  { month: "Jun", revenue: 275000, payouts: 95000, newPolicies: 35, claims: 9 },
  {
    month: "Jul",
    revenue: 280000,
    payouts: 110000,
    newPolicies: 29,
    claims: 11,
  },
  {
    month: "Aug",
    revenue: 285000,
    payouts: 125000,
    newPolicies: 33,
    claims: 8,
  },
  {
    month: "Sep",
    revenue: 290000,
    payouts: 98000,
    newPolicies: 31,
    claims: 10,
  },
  {
    month: "Oct",
    revenue: 285000,
    payouts: 125000,
    newPolicies: 28,
    claims: 8,
  },
];

// -----------------------------------------------------------------------------
// Policy Distribution (for pie chart)
// -----------------------------------------------------------------------------

export interface PolicyDistribution {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export const mockPolicyDistribution: PolicyDistribution[] = [
  { type: "Life Insurance", count: 98, percentage: 34, color: "#0057B7" },
  { type: "Health Insurance", count: 76, percentage: 26, color: "#22C55E" },
  { type: "Auto Insurance", count: 58, percentage: 20, color: "#F59E0B" },
  { type: "Home Insurance", count: 35, percentage: 12, color: "#8B5CF6" },
  { type: "Travel Insurance", count: 20, percentage: 8, color: "#EC4899" },
];

// -----------------------------------------------------------------------------
// All Policies (Admin view - includes user info)
// -----------------------------------------------------------------------------

export interface AdminPolicy extends Policy {
  userId: string;
  userName: string;
  userEmail: string;
}

export const mockAllPolicies: AdminPolicy[] = [
  {
    ...mockPolicies[0],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    ...mockPolicies[1],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    ...mockPolicies[2],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    policyNumber: "LI-2024-002345",
    policyType: "Life Insurance",
    status: "Active",
    coverageAmount: "ZMW 750,000",
    premiumAmount: "ZMW 1,500",
    paymentFrequency: "Monthly",
    startDate: "Feb 1, 2024",
    endDate: "Feb 1, 2034",
    description: "Premium life coverage with extended benefits.",
    userId: "usr-002",
    userName: "Grace Phiri",
    userEmail: "grace.phiri@example.com",
  },
  {
    policyNumber: "HI-2024-006789",
    policyType: "Health Insurance",
    status: "Active",
    coverageAmount: "ZMW 300,000",
    premiumAmount: "ZMW 950",
    paymentFrequency: "Monthly",
    startDate: "Feb 15, 2024",
    endDate: "Feb 15, 2025",
    description: "Comprehensive health plan.",
    userId: "usr-002",
    userName: "Grace Phiri",
    userEmail: "grace.phiri@example.com",
  },
  {
    policyNumber: "AI-2024-010123",
    policyType: "Auto Insurance",
    status: "Active",
    coverageAmount: "ZMW 200,000",
    premiumAmount: "ZMW 500",
    paymentFrequency: "Monthly",
    startDate: "Mar 10, 2024",
    endDate: "Mar 10, 2025",
    description: "Full auto coverage.",
    userId: "usr-003",
    userName: "David Tembo",
    userEmail: "david.tembo@example.com",
  },
];

// -----------------------------------------------------------------------------
// All Claims (Admin view - includes user info)
// -----------------------------------------------------------------------------

export interface AdminClaim extends Claim {
  userId: string;
  userName: string;
  userEmail: string;
}

export const mockAllClaims: AdminClaim[] = [
  {
    ...mockClaims[0],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    ...mockClaims[1],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    ...mockClaims[2],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    ...mockClaims[3],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    ...mockClaims[4],
    userId: "usr-001",
    userName: "John Mwape",
    userEmail: "john.mwape@example.com",
  },
  {
    claimId: "CLM-2024-0006",
    policyNumber: "LI-2024-002345",
    policyType: "Life Insurance",
    claimType: "Critical Illness",
    status: "Approved",
    claimAmount: "ZMW 75,000",
    dateSubmitted: "Sep 1, 2025",
    dateProcessed: "Sep 5, 2025",
    description: "Critical illness benefit claim.",
    userId: "usr-002",
    userName: "Grace Phiri",
    userEmail: "grace.phiri@example.com",
  },
  {
    claimId: "CLM-2024-0007",
    policyNumber: "HI-2024-006789",
    policyType: "Health Insurance",
    claimType: "Medical",
    status: "Pending",
    claimAmount: "ZMW 8,500",
    dateSubmitted: "Oct 20, 2025",
    dateProcessed: "—",
    description: "Specialist consultation and tests.",
    userId: "usr-002",
    userName: "Grace Phiri",
    userEmail: "grace.phiri@example.com",
  },
];

// -----------------------------------------------------------------------------
// All Payments (Admin view - includes user info)
// -----------------------------------------------------------------------------

export interface AdminPayment extends PaymentRecord {
  userId: string;
  userName: string;
  policyType: string;
}

export const mockAllPayments: AdminPayment[] = [
  ...mockPaymentHistory.map((p) => ({
    ...p,
    userId: "usr-001",
    userName: "John Mwape",
    policyType: p.policyNumber.startsWith("LP")
      ? "Life Insurance"
      : p.policyNumber.startsWith("HI")
        ? "Health Insurance"
        : "Auto Insurance",
  })),
  {
    id: "pay-009",
    date: "Oct 1, 2025",
    amount: "ZMW 1,500",
    status: "Paid",
    method: "Bank Transfer",
    policyNumber: "LI-2024-002345",
    userId: "usr-002",
    userName: "Grace Phiri",
    policyType: "Life Insurance",
  },
  {
    id: "pay-010",
    date: "Oct 1, 2025",
    amount: "ZMW 950",
    status: "Paid",
    method: "Mobile Money",
    policyNumber: "HI-2024-006789",
    userId: "usr-002",
    userName: "Grace Phiri",
    policyType: "Health Insurance",
  },
  {
    id: "pay-011",
    date: "Oct 10, 2025",
    amount: "ZMW 500",
    status: "Pending",
    method: "Card",
    policyNumber: "AI-2024-010123",
    userId: "usr-003",
    userName: "David Tembo",
    policyType: "Auto Insurance",
  },
];

// -----------------------------------------------------------------------------
// Admin Helper Functions
// -----------------------------------------------------------------------------

export function getUserById(userId: string): AdminUser | undefined {
  return mockAllUsers.find((u) => u.id === userId);
}

export function getUsersByRole(role: UserRole): AdminUser[] {
  return mockAllUsers.filter((u) => u.role === role);
}

export function getUsersByStatus(status: UserStatus): AdminUser[] {
  return mockAllUsers.filter((u) => u.status === status);
}

export function getPoliciesByUserId(userId: string): AdminPolicy[] {
  return mockAllPolicies.filter((p) => p.userId === userId);
}

export function getClaimsByUserId(userId: string): AdminClaim[] {
  return mockAllClaims.filter((c) => c.userId === userId);
}

export function getPaymentsByUserId(userId: string): AdminPayment[] {
  return mockAllPayments.filter((p) => p.userId === userId);
}
