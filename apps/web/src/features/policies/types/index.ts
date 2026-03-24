export type PolicyStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED";
export type ClaimStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PAID" | "PENDING" | "FAILED";
export type PaymentMethod = "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";

export interface PolicyType {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  minPremium: number;
}

export interface Beneficiary {
  id: string;
  policyId: string;
  name: string;
  relationship: string;
  percentage: number;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  userId: string;
  policyTypeId: string;
  policyType?: PolicyType;
  status: PolicyStatus;
  coverageAmount: string | number; // Decimal comes as string from JSON usually
  premiumAmount: string | number;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  beneficiaries?: Beneficiary[];
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: string | number;
  status: PaymentStatus;
  method: string;
}

export interface PolicyDetails extends Policy {
  beneficiaries: Beneficiary[];
  paymentFrequency: string;
  paymentHistory: PaymentRecord[];
  claims?: any[]; // Define properly if needed later
  payments?: any[]; // Define properly if needed later
}

export interface CreatePolicyData {
  policyTypeId: string;
  coverageAmount: number;
  premiumAmount: number;
  beneficiaries: {
    name: string;
    relationship: string;
    percentage: number;
    phone?: string;
    email?: string;
  }[];
}
