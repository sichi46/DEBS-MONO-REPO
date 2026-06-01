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

const mockPrisma = prisma as any;
const mockLenco = lencoClient as any;

describe("lencoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Make $transaction pass mockPrisma as the tx proxy so inner calls
    // hit the same mocks as outer prisma calls
    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockPrisma));
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
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([]);
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
        where: { reference: "DEBS-123" },
        data: { status: "SUCCESSFUL" },
      });
    });

    it("should store event and update transfer on transfer.failed", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-2",
        eventType: "transfer.failed",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      await lencoService.processWebhookEvent("transfer.failed", {
        reference: "DEBS-456",
        reason: "Insufficient funds",
      });

      expect(mockPrisma.lencoTransfer.updateMany).toHaveBeenCalledWith({
        where: { reference: "DEBS-456" },
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

    // ── Idempotency tests ──────────────────────────────────────────────

    it("should return { skipped: true } for a duplicate webhook (same idempotency key, already processed)", async () => {
      // Simulate an already-processed event stored with idempotencyKey
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
      // No prior event exists
      mockPrisma.lencoWebhookEvent.findUnique.mockResolvedValueOnce(null);
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-new",
        eventType: "transfer.successful",
        idempotencyKey: "transfer.successful:DEBS-NEW",
      });
      mockPrisma.lencoTransfer.findMany.mockResolvedValueOnce([]);
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
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
      expect((result as any).id).toBe("evt-new");
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

      // findUnique should NOT have been called (no key to look up)
      expect(mockPrisma.lencoWebhookEvent.findUnique).not.toHaveBeenCalled();
      // create should have been called without idempotencyKey
      expect(mockPrisma.lencoWebhookEvent.create).toHaveBeenCalledWith({
        data: expect.not.objectContaining({
          idempotencyKey: expect.anything(),
        }),
      });
      expect((result as any).id).toBe("evt-noidp");
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
