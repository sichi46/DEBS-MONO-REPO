import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { lencoClient, LencoApiError } from "../lib/lenco";

function generateReference(): string {
  return `DEBS-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

export const lencoService = {
  // ─── Accounts ────────────────────────────────────────────────────────

  async getAccounts() {
    const res = await lencoClient.getAccounts();
    return res.data;
  },

  async getAccountBalance(accountId: string) {
    const res = await lencoClient.getAccountBalance(accountId);
    return res.data;
  },

  // ─── Banks ───────────────────────────────────────────────────────────

  async getBanks() {
    const res = await lencoClient.getBanks();
    return res.data;
  },

  // ─── Resolve ─────────────────────────────────────────────────────────

  async resolveBankAccount(accountNumber: string, bankId: string) {
    const res = await lencoClient.resolveBankAccount({ accountNumber, bankId });
    return res.data;
  },

  // ─── Transfer Recipients ─────────────────────────────────────────────

  async createRecipient(payload: {
    accountName: string;
    accountNumber: string;
    bankId: string;
    bankName: string;
    currency?: string;
    country?: string;
  }) {
    // Check if recipient already exists locally
    const existing = await prisma.lencoTransferRecipient.findFirst({
      where: {
        accountNumber: payload.accountNumber,
        bankId: payload.bankId,
      },
    });
    if (existing) return existing;

    // Create in Lenco
    const res = await lencoClient.createBankRecipient({
      accountName: payload.accountName,
      accountNumber: payload.accountNumber,
      bankId: payload.bankId,
      currency: payload.currency,
      country: payload.country,
    });

    const lencoData = res.data as { id: string };

    // Store locally
    const recipient = await prisma.lencoTransferRecipient.create({
      data: {
        lencoId: lencoData.id,
        accountName: payload.accountName,
        accountNumber: payload.accountNumber,
        bankId: payload.bankId,
        bankName: payload.bankName,
        currency: payload.currency ?? "ZMW",
        country: payload.country ?? "ZM",
      },
    });

    return recipient;
  },

  // ─── Transfers ───────────────────────────────────────────────────────

  async initiateTransfer(payload: {
    accountId: string;
    recipientId: string;
    amount: number;
    narration: string;
    claimId?: string;
  }) {
    const reference = generateReference();

    // Verify recipient exists
    const recipient = await prisma.lencoTransferRecipient.findUnique({
      where: { id: payload.recipientId },
    });
    if (!recipient) {
      throw new Error("Transfer recipient not found");
    }

    // Create local record first (PENDING)
    const transfer = await prisma.lencoTransfer.create({
      data: {
        reference,
        recipientId: payload.recipientId,
        accountId: payload.accountId,
        amount: payload.amount,
        narration: payload.narration,
        status: "PENDING",
        claimId: payload.claimId,
      },
    });

    try {
      // Call Lenco
      const res = await lencoClient.initiateBankTransfer({
        accountId: payload.accountId,
        recipientId: recipient.lencoId,
        amount: payload.amount.toString(),
        narration: payload.narration,
        reference,
      });

      const lencoData = res.data as { id?: string };

      // Update with Lenco response
      return await prisma.lencoTransfer.update({
        where: { id: transfer.id },
        data: {
          lencoId: lencoData.id ?? null,
          status: "PROCESSING",
          lencoResponse: res.data as object,
        },
        include: { recipient: true },
      });
    } catch (error) {
      // Mark as failed if Lenco call fails
      const message =
        error instanceof LencoApiError
          ? error.lencoMessage
          : error instanceof Error
            ? error.message
            : "Unknown error";

      await prisma.lencoTransfer.update({
        where: { id: transfer.id },
        data: {
          status: "FAILED",
          failureReason: message ?? "Lenco API call failed",
        },
      });
      throw error;
    }
  },

  async getTransferStatus(reference: string) {
    // Check local DB first
    const local = await prisma.lencoTransfer.findUnique({
      where: { reference },
      include: { recipient: true, claim: true },
    });

    // Also query Lenco for latest status
    try {
      const res = await lencoClient.getTransferStatus(reference);
      const lencoData = res.data as { status?: string };

      if (local && lencoData.status) {
        const statusMap: Record<string, string> = {
          pending: "PENDING",
          processing: "PROCESSING",
          successful: "SUCCESSFUL",
          failed: "FAILED",
          reversed: "REVERSED",
        };
        const mappedStatus = statusMap[lencoData.status.toLowerCase()];
        if (mappedStatus && mappedStatus !== local.status) {
          await prisma.lencoTransfer.update({
            where: { id: local.id },
            data: {
              status: mappedStatus as
                | "PENDING"
                | "PROCESSING"
                | "SUCCESSFUL"
                | "FAILED"
                | "REVERSED",
              lencoResponse: res.data as object,
            },
          });
        }
      }

      return { local, lenco: res.data };
    } catch {
      return { local, lenco: null };
    }
  },

  // ─── Webhooks ────────────────────────────────────────────────────────

  async processWebhookEvent(
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    // Store event for audit trail
    const event = await prisma.lencoWebhookEvent.create({
      data: { eventType, payload: payload as object },
    });

    const reference = payload.reference as string | undefined;
    if (!reference) {
      return event;
    }

    // Process based on event type
    if (eventType === "transfer.successful") {
      await prisma.lencoTransfer.updateMany({
        where: { reference },
        data: { status: "SUCCESSFUL" },
      });
    } else if (eventType === "transfer.failed") {
      await prisma.lencoTransfer.updateMany({
        where: { reference },
        data: {
          status: "FAILED",
          failureReason: (payload.reason as string) ?? "Transfer failed",
        },
      });
    }

    // Mark event as processed
    await prisma.lencoWebhookEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date() },
    });

    return event;
  },
};
