import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("../lib/prisma", () => ({
  prisma: {
    lencoTransferRecipient: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    lencoTransfer: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    lencoWebhookEvent: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    lencoCollection: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      update: vi.fn(),
    },
    claim: {
      update: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock Lenco client
vi.mock("../lib/lenco", () => ({
  lencoClient: {
    getAccounts: vi.fn(),
    getAccountBalance: vi.fn(),
    getBanks: vi.fn(),
    resolveBankAccount: vi.fn(),
    createBankRecipient: vi.fn(),
    initiateBankTransfer: vi.fn(),
    getTransferStatus: vi.fn(),
    initiateMobileMoneyCollection: vi.fn(),
    getCollectionByReference: vi.fn(),
  },
  LencoApiError: class LencoApiError extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public lencoMessage?: string,
    ) {
      super(message);
    }
  },
}));

import { prisma } from "../lib/prisma";
import { lencoClient } from "../lib/lenco";
import { lencoService } from "./lenco.service";

const mockPrisma = vi.mocked(prisma);
const mockLenco = vi.mocked(lencoClient);

describe("lencoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Make $transaction pass mockPrisma as the tx proxy so inner calls
    // hit the same mocks as outer prisma calls
    mockPrisma.$transaction.mockImplementation(
      (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
    );
  });

  describe("getAccounts", () => {
    it("should return accounts from Lenco", async () => {
      const accounts = [{ id: "acc-1", name: "Main Account" }];
      mockLenco.getAccounts.mockResolvedValueOnce({
        status: true,
        data: accounts,
      });

      const result = await lencoService.getAccounts();
      expect(result).toEqual(accounts);
      expect(mockLenco.getAccounts).toHaveBeenCalledOnce();
    });
  });

  describe("getBanks", () => {
    it("should return banks from Lenco", async () => {
      const banks = [{ id: "bank-1", name: "Zambia National Bank" }];
      mockLenco.getBanks.mockResolvedValueOnce({
        status: true,
        data: banks,
      });

      const result = await lencoService.getBanks();
      expect(result).toEqual(banks);
    });
  });

  describe("resolveBankAccount", () => {
    it("should resolve a bank account via Lenco", async () => {
      const resolved = {
        accountName: "John Mwape",
        accountNumber: "1234567890",
      };
      mockLenco.resolveBankAccount.mockResolvedValueOnce({
        status: true,
        data: resolved,
      });

      const result = await lencoService.resolveBankAccount(
        "1234567890",
        "bank-1",
      );
      expect(result).toEqual(resolved);
      expect(mockLenco.resolveBankAccount).toHaveBeenCalledWith({
        accountNumber: "1234567890",
        bankId: "bank-1",
      });
    });
  });

  describe("createRecipient", () => {
    it("should return existing recipient if already stored", async () => {
      const existing = {
        id: "rec-local",
        lencoId: "rec-lenco",
        accountNumber: "1234567890",
        bankId: "bank-1",
      };
      mockPrisma.lencoTransferRecipient.findFirst.mockResolvedValueOnce(
        existing,
      );

      const result = await lencoService.createRecipient({
        accountName: "John Mwape",
        accountNumber: "1234567890",
        bankId: "bank-1",
        bankName: "ZNB",
      });

      expect(result).toEqual(existing);
      expect(mockLenco.createBankRecipient).not.toHaveBeenCalled();
    });

    it("should create a new recipient in Lenco and DB", async () => {
      mockPrisma.lencoTransferRecipient.findFirst.mockResolvedValueOnce(null);
      mockLenco.createBankRecipient.mockResolvedValueOnce({
        status: true,
        data: { id: "lenco-rec-123" },
      });
      const dbRecipient = {
        id: "local-rec-1",
        lencoId: "lenco-rec-123",
        accountName: "John Mwape",
        accountNumber: "1234567890",
        bankId: "bank-1",
        bankName: "ZNB",
      };
      mockPrisma.lencoTransferRecipient.create.mockResolvedValueOnce(
        dbRecipient,
      );

      const result = await lencoService.createRecipient({
        accountName: "John Mwape",
        accountNumber: "1234567890",
        bankId: "bank-1",
        bankName: "ZNB",
      });

      expect(result).toEqual(dbRecipient);
      expect(mockLenco.createBankRecipient).toHaveBeenCalledOnce();
      expect(mockPrisma.lencoTransferRecipient.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lencoId: "lenco-rec-123",
          accountNumber: "1234567890",
        }),
      });
    });
  });

  describe("initiateTransfer", () => {
    it("should create local record and call Lenco", async () => {
      const recipient = { id: "rec-1", lencoId: "lenco-rec-1" };
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        recipient,
      );
      mockPrisma.lencoTransfer.create.mockResolvedValueOnce({
        id: "transfer-1",
        reference: "DEBS-123",
        status: "PENDING",
      });
      mockLenco.initiateBankTransfer.mockResolvedValueOnce({
        status: true,
        data: { id: "lenco-transfer-1" },
      });
      mockPrisma.lencoTransfer.update.mockResolvedValueOnce({
        id: "transfer-1",
        lencoId: "lenco-transfer-1",
        status: "PROCESSING",
        recipient,
      });

      const result = await lencoService.initiateTransfer({
        accountId: "acc-1",
        recipientId: "rec-1",
        amount: 5000,
        narration: "Claim payout",
      });

      expect(result.status).toBe("PROCESSING");
      expect(mockPrisma.lencoTransfer.create).toHaveBeenCalledOnce();
      expect(mockLenco.initiateBankTransfer).toHaveBeenCalledOnce();
    });

    it("should throw if recipient not found", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(null);

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "nonexistent",
          amount: 5000,
          narration: "Test",
        }),
      ).rejects.toThrow("Transfer recipient not found");
    });

    // ── Double-payout guard tests ───────────────────────────────────────

    const baseRecipient = { id: "rec-1", lencoId: "lenco-rec-1" };

    it("should throw if claim not found", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce(null);

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "rec-1",
          amount: 5000,
          narration: "Payout",
          claimId: "claim-missing",
        }),
      ).rejects.toThrow("Claim not found");
    });

    it("should throw if claim status is PENDING (not APPROVED)", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce({
        id: "claim-1",
        status: "PENDING",
        amount: 10000,
        policy: { status: "ACTIVE" },
      });

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "rec-1",
          amount: 5000,
          narration: "Payout",
          claimId: "claim-1",
        }),
      ).rejects.toThrow(
        "Cannot initiate payout: claim status is PENDING, must be APPROVED",
      );
    });

    it("should throw if claim status is REJECTED", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce({
        id: "claim-1",
        status: "REJECTED",
        amount: 10000,
        policy: { status: "ACTIVE" },
      });

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "rec-1",
          amount: 5000,
          narration: "Payout",
          claimId: "claim-1",
        }),
      ).rejects.toThrow(
        "Cannot initiate payout: claim status is REJECTED, must be APPROVED",
      );
    });

    it("should throw if linked policy is not ACTIVE", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce({
        id: "claim-1",
        status: "APPROVED",
        amount: 10000,
        policy: { status: "EXPIRED" },
      });

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "rec-1",
          amount: 5000,
          narration: "Payout",
          claimId: "claim-1",
        }),
      ).rejects.toThrow("Cannot initiate payout: linked policy is not ACTIVE");
    });

    it("should throw if transfer amount exceeds approved claim amount", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce({
        id: "claim-1",
        status: "APPROVED",
        amount: 3000,
        policy: { status: "ACTIVE" },
      });

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "rec-1",
          amount: 5000,
          narration: "Payout",
          claimId: "claim-1",
        }),
      ).rejects.toThrow(
        "Transfer amount 5000 exceeds approved claim amount 3000",
      );
    });

    it("should throw if a SUCCESSFUL payout already exists for the claim", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce({
        id: "claim-1",
        status: "APPROVED",
        amount: 10000,
        policy: { status: "ACTIVE" },
      });
      mockPrisma.lencoTransfer.findFirst.mockResolvedValueOnce({
        id: "transfer-existing",
        status: "SUCCESSFUL",
        claimId: "claim-1",
      });

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "rec-1",
          amount: 5000,
          narration: "Payout",
          claimId: "claim-1",
        }),
      ).rejects.toThrow("A successful payout already exists for this claim");
    });

    it("should throw if a PENDING payout already exists for the claim", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce({
        id: "claim-1",
        status: "APPROVED",
        amount: 10000,
        policy: { status: "ACTIVE" },
      });
      mockPrisma.lencoTransfer.findFirst.mockResolvedValueOnce({
        id: "transfer-existing",
        status: "PENDING",
        claimId: "claim-1",
      });

      await expect(
        lencoService.initiateTransfer({
          accountId: "acc-1",
          recipientId: "rec-1",
          amount: 5000,
          narration: "Payout",
          claimId: "claim-1",
        }),
      ).rejects.toThrow("A pending payout already exists for this claim");
    });

    it("should succeed when claim is APPROVED, policy ACTIVE, amount valid, no prior transfer", async () => {
      mockPrisma.lencoTransferRecipient.findUnique.mockResolvedValueOnce(
        baseRecipient,
      );
      mockPrisma.claim.findUnique.mockResolvedValueOnce({
        id: "claim-1",
        status: "APPROVED",
        amount: 10000,
        policy: { status: "ACTIVE" },
      });
      mockPrisma.lencoTransfer.findFirst.mockResolvedValueOnce(null);
      mockPrisma.lencoTransfer.create.mockResolvedValueOnce({
        id: "transfer-new",
        reference: "DEBS-XYZ",
        status: "PENDING",
      });
      mockLenco.initiateBankTransfer.mockResolvedValueOnce({
        status: true,
        data: { id: "lenco-transfer-new" },
      });
      mockPrisma.lencoTransfer.update.mockResolvedValueOnce({
        id: "transfer-new",
        lencoId: "lenco-transfer-new",
        status: "PROCESSING",
        recipient: baseRecipient,
      });

      const result = await lencoService.initiateTransfer({
        accountId: "acc-1",
        recipientId: "rec-1",
        amount: 5000,
        narration: "Claim payout",
        claimId: "claim-1",
      });

      expect(result.status).toBe("PROCESSING");
      expect(mockPrisma.lencoTransfer.create).toHaveBeenCalledOnce();
      expect(mockLenco.initiateBankTransfer).toHaveBeenCalledOnce();
    });
  });

  describe("processWebhookEvent", () => {
    it("should store event and update transfer on transfer.successful", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-1",
        eventType: "transfer.successful",
      });
      // findMany is now called inside the transaction to find non-terminal transfers
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([
        { claimId: null },
      ]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      const result = await lencoService.processWebhookEvent(
        "transfer.successful",
        { reference: "DEBS-123" },
      );

      expect("skipped" in result ? null : result.eventType).toBe(
        "transfer.successful",
      );
      expect(mockPrisma.lencoTransfer.updateMany).toHaveBeenCalledWith({
        where: {
          reference: "DEBS-123",
          status: { notIn: ["SUCCESSFUL", "FAILED", "REVERSED"] },
        },
        data: { status: "SUCCESSFUL" },
      });
    });

    it("should store event and update transfer on transfer.failed", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-2",
        eventType: "transfer.failed",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([
        { claimId: null },
      ]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.failed", {
        reference: "DEBS-456",
        reason: "Insufficient funds",
      });

      expect(mockPrisma.lencoTransfer.updateMany).toHaveBeenCalledWith({
        where: {
          reference: "DEBS-456",
          status: { notIn: ["SUCCESSFUL", "FAILED", "REVERSED"] },
        },
        data: {
          status: "FAILED",
          failureReason: "Insufficient funds",
        },
      });
    });

    it("should update collection and payment on collection.successful", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-3",
        eventType: "collection.successful",
      });
      mockPrisma.lencoCollection.findUnique.mockResolvedValueOnce({
        id: "col-1",
        reference: "DEBS-789",
        paymentId: "pay-1",
      });
      mockPrisma.lencoCollection.update.mockResolvedValueOnce({});
      mockPrisma.payment.update.mockResolvedValueOnce({});
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("collection.successful", {
        reference: "DEBS-789",
      });

      expect(mockPrisma.lencoCollection.update).toHaveBeenCalledWith({
        where: { reference: "DEBS-789" },
        data: { status: "SUCCESSFUL" },
      });
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: "pay-1" },
        data: { status: "PAID", paidAt: expect.any(Date) },
      });
    });

    it("should update collection and payment on collection.failed", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-4",
        eventType: "collection.failed",
      });
      mockPrisma.lencoCollection.findUnique.mockResolvedValueOnce({
        id: "col-2",
        reference: "DEBS-999",
        paymentId: "pay-2",
      });
      mockPrisma.lencoCollection.update.mockResolvedValueOnce({});
      mockPrisma.payment.update.mockResolvedValueOnce({});
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("collection.failed", {
        reference: "DEBS-999",
        reason: "User declined",
      });

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: "pay-2" },
        data: { status: "FAILED" },
      });
    });

    it("should update linked claim to PAID on transfer.successful", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-c1",
        eventType: "transfer.successful",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([
        { claimId: "claim-1" },
      ]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.claim.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.successful", {
        reference: "DEBS-123",
      });

      expect(mockPrisma.lencoTransfer.updateMany).toHaveBeenCalledWith({
        where: {
          reference: "DEBS-123",
          status: { notIn: ["SUCCESSFUL", "FAILED", "REVERSED"] },
        },
        data: { status: "SUCCESSFUL" },
      });
      expect(mockPrisma.claim.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["claim-1"] } },
        data: {
          payoutStatus: "PAID",
          payoutCompletedAt: expect.any(Date),
        },
      });
    });

    it("should update linked claim to FAILED on transfer.failed", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-c2",
        eventType: "transfer.failed",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([
        { claimId: "claim-2" },
      ]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.claim.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.failed", {
        reference: "DEBS-456",
        reason: "Insufficient funds",
      });

      expect(mockPrisma.lencoTransfer.updateMany).toHaveBeenCalledWith({
        where: {
          reference: "DEBS-456",
          status: { notIn: ["SUCCESSFUL", "FAILED", "REVERSED"] },
        },
        data: {
          status: "FAILED",
          failureReason: "Insufficient funds",
        },
      });
      expect(mockPrisma.claim.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["claim-2"] } },
        data: { payoutStatus: "FAILED" },
      });
    });

    it("should not update claim when transfer has no claimId", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-c3",
        eventType: "transfer.successful",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([
        { claimId: null },
      ]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.successful", {
        reference: "DEBS-789",
      });

      expect(mockPrisma.claim.updateMany).not.toHaveBeenCalled();
    });

    // ── Terminal-state guards ─────────────────────────────────────────

    it("should not overwrite SUCCESSFUL transfer on transfer.failed (critical guard)", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-guard-1",
        eventType: "transfer.failed",
      });
      // findMany inside transaction returns empty — all transfers are terminal
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([]);
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.failed", {
        reference: "DEBS-TERMINAL",
        reason: "Stale failure",
      });

      expect(mockPrisma.lencoTransfer.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.claim.updateMany).not.toHaveBeenCalled();
    });

    it("should not overwrite FAILED transfer on transfer.successful", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-guard-2",
        eventType: "transfer.successful",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([]);
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.successful", {
        reference: "DEBS-ALREADY-FAILED",
      });

      expect(mockPrisma.lencoTransfer.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.claim.updateMany).not.toHaveBeenCalled();
    });

    // ── Reversal handling ─────────────────────────────────────────────

    it("should set REVERSED and claim to FAILED on transfer.reversed", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-rev-1",
        eventType: "transfer.reversed",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([
        { claimId: "claim-rev-1" },
      ]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.claim.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.reversed", {
        reference: "DEBS-REVERSED",
      });

      expect(mockPrisma.lencoTransfer.updateMany).toHaveBeenCalledWith({
        where: { reference: "DEBS-REVERSED", status: { not: "REVERSED" } },
        data: { status: "REVERSED" },
      });
      expect(mockPrisma.claim.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["claim-rev-1"] } },
        data: { payoutStatus: "FAILED" },
      });
    });

    it("should allow SUCCESSFUL → REVERSED transition on transfer.reversed", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-rev-2",
        eventType: "transfer.reversed",
      });
      // Returns the previously-SUCCESSFUL transfer (it is not REVERSED yet)
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([
        { claimId: "claim-was-paid" },
      ]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.claim.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.reversed", {
        reference: "DEBS-WAS-SUCCESSFUL",
      });

      expect(mockPrisma.lencoTransfer.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "REVERSED" } }),
      );
      expect(mockPrisma.claim.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { payoutStatus: "FAILED" } }),
      );
    });

    it("should skip updates on transfer.reversed when transfer is already REVERSED", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-rev-3",
        eventType: "transfer.reversed",
      });
      // findMany with status: { not: "REVERSED" } returns empty
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([]);
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.reversed", {
        reference: "DEBS-ALREADY-REVERSED",
      });

      expect(mockPrisma.lencoTransfer.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.claim.updateMany).not.toHaveBeenCalled();
    });

    it("should set REVERSED and claim to FAILED on transaction.reversed via narration", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-txrev-1",
        eventType: "transaction.reversed",
      });
      mockPrisma.lencoTransfer.findFirst.mockResolvedValueOnce({
        id: "transfer-rev-1",
        claimId: "claim-txrev-1",
        status: "SUCCESSFUL",
      });
      mockPrisma.$transaction.mockImplementationOnce(
        (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
      );
      mockPrisma.lencoTransfer.update.mockResolvedValueOnce({ count: 1 });
      mockPrisma.claim.update.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transaction.reversed", {
        id: "evt-uuid-txrev",
        narration: "DEBS CLM-2024-0001 payout / 2615402999",
        amount: "5.00",
      });

      expect(mockPrisma.lencoTransfer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            lencoResponse: { path: ["lencoReference"], equals: "2615402999" },
          }),
        }),
      );
      expect(mockPrisma.lencoTransfer.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "REVERSED" } }),
      );
      expect(mockPrisma.claim.update).toHaveBeenCalledWith({
        where: { id: "claim-txrev-1" },
        data: { payoutStatus: "FAILED" },
      });
    });

    it("should update claim to FAILED on transaction.reversed even if transfer already REVERSED", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-txrev-2",
        eventType: "transaction.reversed",
      });
      mockPrisma.lencoTransfer.findFirst.mockResolvedValueOnce({
        id: "transfer-rev-2",
        claimId: "claim-txrev-2",
        status: "REVERSED",
      });
      mockPrisma.$transaction.mockImplementationOnce(
        (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
      );
      mockPrisma.claim.update.mockResolvedValueOnce({});
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transaction.reversed", {
        id: "evt-uuid-txrev-2",
        narration: "DEBS CLM-2024-0002 payout / 9876543210",
        amount: "5.00",
      });

      // Transfer already REVERSED — should not call update on it again
      expect(mockPrisma.lencoTransfer.update).not.toHaveBeenCalled();
      // Claim update always fires for reversal signals
      expect(mockPrisma.claim.update).toHaveBeenCalledWith({
        where: { id: "claim-txrev-2" },
        data: { payoutStatus: "FAILED" },
      });
    });

    // ── collection.pay_offline ────────────────────────────────────────

    it("should set PAY_OFFLINE on a PENDING collection", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-pof-1",
        eventType: "collection.pay_offline",
      });
      mockPrisma.lencoCollection.findUnique.mockResolvedValueOnce({
        id: "col-offline",
        reference: "DEBS-OFFLINE",
        status: "PENDING",
      });
      mockPrisma.lencoCollection.update.mockResolvedValueOnce({});
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("collection.pay_offline", {
        reference: "DEBS-OFFLINE",
      });

      expect(mockPrisma.lencoCollection.update).toHaveBeenCalledWith({
        where: { reference: "DEBS-OFFLINE" },
        data: { status: "PAY_OFFLINE" },
      });
    });

    it("should not update a non-PENDING collection on collection.pay_offline", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-pof-2",
        eventType: "collection.pay_offline",
      });
      mockPrisma.lencoCollection.findUnique.mockResolvedValueOnce({
        id: "col-already-done",
        reference: "DEBS-DONE",
        status: "SUCCESSFUL",
      });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("collection.pay_offline", {
        reference: "DEBS-DONE",
      });

      expect(mockPrisma.lencoCollection.update).not.toHaveBeenCalled();
    });

    // ── transaction.debit / transaction.credit ────────────────────────

    it("should update transfer and claim on transaction.debit when narration contains lencoReference", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-debit-1",
        eventType: "transaction.debit",
      });
      mockPrisma.lencoTransfer.findFirst.mockResolvedValueOnce({
        id: "transfer-debit-1",
        claimId: "claim-debit-1",
        status: "PROCESSING",
      });
      mockPrisma.$transaction.mockImplementationOnce(
        (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
      );
      mockPrisma.lencoTransfer.update.mockResolvedValueOnce({ count: 1 });
      mockPrisma.claim.update.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transaction.debit", {
        id: "evt-uuid-debit",
        narration: "DEBS CLM-2024-0001 payout / 2615402981",
        amount: "5.00",
      });

      expect(mockPrisma.lencoTransfer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            lencoResponse: { path: ["lencoReference"], equals: "2615402981" },
          }),
        }),
      );
      expect(mockPrisma.lencoTransfer.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "SUCCESSFUL" } }),
      );
      expect(mockPrisma.claim.update).toHaveBeenCalledWith({
        where: { id: "claim-debit-1" },
        data: { payoutStatus: "PAID", payoutCompletedAt: expect.any(Date) },
      });
    });

    it("should not update anything on transaction.debit when no matching transfer found", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-debit-2",
        eventType: "transaction.debit",
      });
      mockPrisma.lencoTransfer.findFirst.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transaction.debit", {
        id: "evt-uuid-debit-2",
        narration: "Some payout / 9999999999",
        amount: "5.00",
      });

      expect(mockPrisma.lencoTransfer.update).not.toHaveBeenCalled();
      expect(mockPrisma.claim.update).not.toHaveBeenCalled();
    });

    it("should store and mark processed on transaction.credit without business logic", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-credit-1",
        eventType: "transaction.credit",
      });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transaction.credit", {
        id: "evt-uuid-credit",
        amount: "25.00",
        narration: "sichilima mulenga MP260603.1100.G60890",
      });

      expect(mockPrisma.lencoWebhookEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ processed: true }),
        }),
      );
      expect(mockPrisma.lencoTransfer.update).not.toHaveBeenCalled();
    });

    // ── Idempotency tests ──────────────────────────────────────────────

    it("should return { skipped: true } for a duplicate webhook (same idempotency key, already processed)", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce({
        id: "evt-dup",
        eventType: "transfer.successful",
        processed: true,
        idempotencyKey: "lenco-event-abc",
      });

      const result = await lencoService.processWebhookEvent(
        "transfer.successful",
        { id: "lenco-event-abc", reference: "DEBS-123" },
      );

      expect(result).toEqual({ skipped: true, reason: "duplicate" });
      expect(mockPrisma.lencoWebhookEvent.create).not.toHaveBeenCalled();
    });

    it("should return { skipped: true } for a concurrent (not yet processed) duplicate delivery", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce({
        id: "evt-inprogress",
        eventType: "transfer.successful",
        processed: false,
        idempotencyKey: "transfer.successful:DEBS-CONCURRENT",
      });

      const result = await lencoService.processWebhookEvent(
        "transfer.successful",
        { reference: "DEBS-CONCURRENT" },
      );

      expect(result).toEqual({ skipped: true, reason: "duplicate" });
      expect(mockPrisma.lencoWebhookEvent.create).not.toHaveBeenCalled();
    });

    it("should store idempotencyKey and process normally on first delivery", async () => {
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-new",
        eventType: "transfer.successful",
        idempotencyKey: "transfer.successful:DEBS-NEW",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([]);
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      const result = await lencoService.processWebhookEvent(
        "transfer.successful",
        { reference: "DEBS-NEW" },
      );

      expect(mockPrisma.lencoWebhookEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          idempotencyKey: "transfer.successful:DEBS-NEW",
        }),
      });
      expect((result as { id: string }).id).toBe("evt-new");
    });

    it("should process webhook without idempotency key when neither id nor reference is present", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-noidp",
        eventType: "unknown.event",
      });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      const result = await lencoService.processWebhookEvent("unknown.event", {
        someField: "someValue",
      });

      expect(mockPrisma.lencoWebhookEvent.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.lencoWebhookEvent.create).toHaveBeenCalledWith({
        data: expect.not.objectContaining({
          idempotencyKey: expect.anything(),
        }),
      });
      expect((result as { id: string }).id).toBe("evt-noidp");
    });
  });

  // ── Polling terminal-state guards ────────────────────────────────────

  describe("getTransferStatus — terminal-state guard", () => {
    it("should not update a SUCCESSFUL transfer via polling", async () => {
      mockPrisma.lencoTransfer.findUnique.mockResolvedValueOnce({
        id: "t-1",
        reference: "DEBS-123",
        status: "SUCCESSFUL",
        recipient: {},
        claim: null,
      });
      mockLenco.getTransferStatus.mockResolvedValueOnce({
        status: true,
        data: { status: "failed" },
      });

      await lencoService.getTransferStatus("DEBS-123");

      expect(mockPrisma.lencoTransfer.update).not.toHaveBeenCalled();
    });

    it("should not update a FAILED transfer via polling", async () => {
      mockPrisma.lencoTransfer.findUnique.mockResolvedValueOnce({
        id: "t-2",
        reference: "DEBS-456",
        status: "FAILED",
        recipient: {},
        claim: null,
      });
      mockLenco.getTransferStatus.mockResolvedValueOnce({
        status: true,
        data: { status: "successful" },
      });

      await lencoService.getTransferStatus("DEBS-456");

      expect(mockPrisma.lencoTransfer.update).not.toHaveBeenCalled();
    });

    it("should update a non-terminal transfer via polling", async () => {
      mockPrisma.lencoTransfer.findUnique.mockResolvedValueOnce({
        id: "t-3",
        reference: "DEBS-789",
        status: "PROCESSING",
        recipient: {},
        claim: null,
      });
      mockLenco.getTransferStatus.mockResolvedValueOnce({
        status: true,
        data: { status: "successful" },
      });
      mockPrisma.lencoTransfer.update.mockResolvedValueOnce({});

      await lencoService.getTransferStatus("DEBS-789");

      expect(mockPrisma.lencoTransfer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "SUCCESSFUL" }),
        }),
      );
    });
  });

  describe("getCollectionStatus — terminal-state guard", () => {
    it("should not update a SUCCESSFUL collection via polling", async () => {
      mockPrisma.lencoCollection.findUnique.mockResolvedValueOnce({
        id: "c-1",
        reference: "DEBS-COL-1",
        status: "SUCCESSFUL",
        user: {},
        policy: {},
        payment: null,
      });
      mockLenco.getCollectionByReference.mockResolvedValueOnce({
        status: true,
        data: { status: "failed" },
      });

      await lencoService.getCollectionStatus("DEBS-COL-1");

      expect(mockPrisma.lencoCollection.update).not.toHaveBeenCalled();
    });

    it("should not update a FAILED collection via polling", async () => {
      mockPrisma.lencoCollection.findUnique.mockResolvedValueOnce({
        id: "c-2",
        reference: "DEBS-COL-2",
        status: "FAILED",
        user: {},
        policy: {},
        payment: null,
      });
      mockLenco.getCollectionByReference.mockResolvedValueOnce({
        status: true,
        data: { status: "successful" },
      });

      await lencoService.getCollectionStatus("DEBS-COL-2");

      expect(mockPrisma.lencoCollection.update).not.toHaveBeenCalled();
    });

    it("should allow PAY_OFFLINE → SUCCESSFUL via polling (PAY_OFFLINE is not terminal)", async () => {
      mockPrisma.lencoCollection.findUnique.mockResolvedValueOnce({
        id: "c-3",
        reference: "DEBS-COL-3",
        status: "PAY_OFFLINE",
        user: {},
        policy: {},
        payment: null,
      });
      mockLenco.getCollectionByReference.mockResolvedValueOnce({
        status: true,
        data: { status: "successful" },
      });
      mockPrisma.lencoCollection.update.mockResolvedValueOnce({});

      await lencoService.getCollectionStatus("DEBS-COL-3");

      expect(mockPrisma.lencoCollection.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "SUCCESSFUL" }),
        }),
      );
    });
  });

  describe("initiateMobileMoneyCollection", () => {
    it("should create payment, collection, and call Lenco", async () => {
      mockPrisma.payment.create.mockResolvedValueOnce({ id: "pay-1" });
      mockPrisma.lencoCollection.create.mockResolvedValueOnce({
        id: "col-1",
        reference: "DEBS-123",
        status: "PENDING",
      });
      mockLenco.initiateMobileMoneyCollection.mockResolvedValueOnce({
        status: true,
        data: { id: "lenco-col-1" },
      });
      mockPrisma.lencoCollection.update.mockResolvedValueOnce({
        id: "col-1",
        lencoId: "lenco-col-1",
        status: "PENDING",
        policy: { policyType: { name: "Life Insurance" } },
      });

      const result = await lencoService.initiateMobileMoneyCollection({
        userId: "user-1",
        policyId: "pol-1",
        amount: 1200,
        provider: "MTN",
        phoneNumber: "260971234567",
      });

      expect(result.lencoId).toBe("lenco-col-1");
      expect(mockPrisma.payment.create).toHaveBeenCalledOnce();
      expect(mockPrisma.lencoCollection.create).toHaveBeenCalledOnce();
      expect(mockLenco.initiateMobileMoneyCollection).toHaveBeenCalledOnce();
    });
  });
});
