import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

vi.mock("../lib/prisma.js", () => {
  const prisma = {
    policyType: {
      findUnique: vi.fn(),
    },
    policy: {
      create: vi.fn(),
    },
  };
  return { prisma };
});

import { policiesService } from "./policies.service.js";
import { prisma } from "../lib/prisma.js";

describe("policiesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid policy type", async () => {
    vi.mocked(prisma.policyType.findUnique).mockResolvedValue(null);

    await expect(
      policiesService.createPolicy({
        userId: "user-1",
        policyTypeId: "missing",
        coverageAmount: 1000,
        premiumAmount: 10,
        paymentFrequency: "Monthly",
        beneficiaries: [{ name: "A", relationship: "Spouse", percentage: 100 }],
      }),
    ).rejects.toThrow("Invalid policy type");
  });

  it("rejects premium below minimum", async () => {
    vi.mocked(prisma.policyType.findUnique).mockResolvedValue({
      minPremium: new Prisma.Decimal(100),
    } as never);

    await expect(
      policiesService.createPolicy({
        userId: "user-1",
        policyTypeId: "type-1",
        coverageAmount: 1000,
        premiumAmount: 50,
        paymentFrequency: "Monthly",
        beneficiaries: [{ name: "A", relationship: "Spouse", percentage: 100 }],
      }),
    ).rejects.toThrow("Premium amount below minimum for policy type");
  });
});
