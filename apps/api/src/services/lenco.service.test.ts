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
    },
    lencoWebhookEvent: {
      create: vi.fn(),
      update: vi.fn(),
    },
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
  });

  describe("processWebhookEvent", () => {
    it("should store event and update transfer on transfer.successful", async () => {
      mockPrisma.lencoWebhookEvent.create.mockResolvedValueOnce({
        id: "evt-1",
        eventType: "transfer.successful",
      });
      mockPrisma.lencoTransfer.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.lencoWebhookEvent.update.mockResolvedValueOnce({});

      const result = await lencoService.processWebhookEvent(
        "transfer.successful",
        { reference: "DEBS-123" },
      );

      expect(result.eventType).toBe("transfer.successful");
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
  });
});
