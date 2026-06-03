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

    // ── Double-payout guard ────────────────────────────────────────────
    if (payload.claimId) {
      const claim = await prisma.claim.findUnique({
        where: { id: payload.claimId },
        include: { policy: true },
      });

      if (!claim) {
        throw new Error("Claim not found");
      }
      if (claim.status !== "APPROVED") {
        throw new Error(
          `Cannot initiate payout: claim status is ${claim.status}, must be APPROVED`,
        );
      }
      if (claim.policy.status !== "ACTIVE") {
        throw new Error("Cannot initiate payout: linked policy is not ACTIVE");
      }
      if (payload.amount > Number(claim.amount)) {
        throw new Error(
          `Transfer amount ${payload.amount} exceeds approved claim amount ${claim.amount}`,
        );
      }

      const existingTransfer = await prisma.lencoTransfer.findFirst({
        where: {
          claimId: payload.claimId,
          status: { in: ["PENDING", "PROCESSING", "SUCCESSFUL"] },
        },
      });
      if (existingTransfer) {
        throw new Error(
          `A ${existingTransfer.status.toLowerCase()} payout already exists for this claim`,
        );
      }
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
      // Call Lenco — use accountNumber+bankId directly; recipientId is not
      // supported for Zambian bank transfers in the Lenco V2 API
      const res = await lencoClient.initiateBankTransfer({
        accountId: payload.accountId,
        accountNumber: recipient.accountNumber,
        bankId: recipient.bankId,
        amount: payload.amount.toString(),
        narration: payload.narration,
        reference,
      });

      const lencoData = res.data as {
        id?: string;
        status?: string;
        reasonForFailure?: string;
      };

      const statusMap: Record<
        string,
        "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED" | "REVERSED"
      > = {
        pending: "PENDING",
        processing: "PROCESSING",
        successful: "SUCCESSFUL",
        failed: "FAILED",
        reversed: "REVERSED",
      };
      const mappedStatus =
        (lencoData.status ? statusMap[lencoData.status.toLowerCase()] : null) ??
        "PROCESSING";

      // Update with Lenco response, reflecting the actual status Lenco returned
      return await prisma.lencoTransfer.update({
        where: { id: transfer.id },
        data: {
          lencoId: lencoData.id ?? null,
          status: mappedStatus,
          lencoResponse: res.data as object,
          ...(mappedStatus === "FAILED" && {
            failureReason: lencoData.reasonForFailure ?? "Transfer failed",
          }),
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
  ): Promise<
    | { id: string; eventType: string; [key: string]: unknown }
    | { skipped: true; reason: string }
  > {
    // ── Idempotency check ──────────────────────────────────────────────
    // ASSUMPTION: Lenco may include a top-level "id" field on webhook
    // payloads as a unique event identifier. When present, it is used as
    // the idempotency key. Otherwise we fall back to a composite key of
    // eventType + ":" + reference. If neither exists no key is derived and
    // the event is processed without idempotency protection.
    const reference = payload.reference as string | undefined;
    const idempotencyKey: string | undefined =
      typeof payload.id === "string" && payload.id
        ? payload.id
        : reference
          ? `${eventType}:${reference}`
          : undefined;

    if (idempotencyKey) {
      const existing = await prisma.lencoWebhookEvent.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        // Guard against both already-processed events (duplicate delivery)
        // and events still in flight (concurrent delivery).
        return { skipped: true, reason: "duplicate" };
      }
    }

    // Store event for audit trail
    const event = await prisma.lencoWebhookEvent.create({
      data: {
        eventType,
        payload: payload as object,
        ...(idempotencyKey ? { idempotencyKey } : {}),
      },
    });

    // ── transaction.debit — Lenco fires this when an outbound bank transfer
    // completes. The payload has no reference field; the Lenco reference is
    // appended to the narration as "<our narration> / <lencoRef>".
    if (eventType === "transaction.debit") {
      const narration = payload.narration as string | undefined;
      const lencoRef = narration?.split(" / ").at(-1)?.trim();

      if (lencoRef) {
        const transfer = await prisma.lencoTransfer.findFirst({
          where: {
            lencoResponse: { path: ["lencoReference"], equals: lencoRef },
            status: { notIn: ["SUCCESSFUL", "FAILED", "REVERSED"] },
          },
          select: { id: true, claimId: true },
        });

        if (transfer) {
          await prisma.$transaction(async (tx) => {
            await tx.lencoTransfer.update({
              where: { id: transfer.id },
              data: { status: "SUCCESSFUL" },
            });
            if (transfer.claimId) {
              await tx.claim.update({
                where: { id: transfer.claimId },
                data: {
                  payoutStatus: "PAID",
                  payoutCompletedAt: new Date(),
                },
              });
            }
          });
        }
      }
    } else if (eventType === "transaction.credit") {
      // Lenco fires this when money arrives in the merchant account.
      // collection.successful handles the business logic for mobile money;
      // this is an account-level notification only — no additional action.
    } else if (reference) {
      // Reference-based events (collection and legacy transfer events)
      if (eventType === "transfer.successful") {
        const transfers = await prisma.lencoTransfer.findMany({
          where: { reference },
          select: { claimId: true },
        });
        const claimIds = transfers
          .map((t) => t.claimId)
          .filter((id): id is string => id !== null && id !== undefined);

        await prisma.$transaction(async (tx) => {
          await tx.lencoTransfer.updateMany({
            where: { reference },
            data: { status: "SUCCESSFUL" },
          });
          if (claimIds.length > 0) {
            await tx.claim.updateMany({
              where: { id: { in: claimIds } },
              data: {
                payoutStatus: "PAID",
                payoutCompletedAt: new Date(),
              },
            });
          }
        });
      } else if (eventType === "transfer.failed") {
        const transfers = await prisma.lencoTransfer.findMany({
          where: { reference },
          select: { claimId: true },
        });
        const claimIds = transfers
          .map((t) => t.claimId)
          .filter((id): id is string => id !== null && id !== undefined);

        await prisma.$transaction(async (tx) => {
          await tx.lencoTransfer.updateMany({
            where: { reference },
            data: {
              status: "FAILED",
              failureReason: (payload.reason as string) ?? "Transfer failed",
            },
          });
          if (claimIds.length > 0) {
            await tx.claim.updateMany({
              where: { id: { in: claimIds } },
              data: { payoutStatus: "FAILED" },
            });
          }
        });
      } else if (eventType === "collection.successful") {
        const collection = await prisma.lencoCollection.findUnique({
          where: { reference },
        });
        if (collection) {
          await prisma.lencoCollection.update({
            where: { reference },
            data: { status: "SUCCESSFUL" },
          });
          if (collection.paymentId) {
            await prisma.payment.update({
              where: { id: collection.paymentId },
              data: { status: "PAID", paidAt: new Date() },
            });
          }
        }
      } else if (eventType === "collection.failed") {
        const collection = await prisma.lencoCollection.findUnique({
          where: { reference },
        });
        if (collection) {
          await prisma.lencoCollection.update({
            where: { reference },
            data: {
              status: "FAILED",
              failureReason: (payload.reason as string) ?? "Collection failed",
            },
          });
          if (collection.paymentId) {
            await prisma.payment.update({
              where: { id: collection.paymentId },
              data: { status: "FAILED" },
            });
          }
        }
      }
    }

    // Mark event as processed for all event types
    await prisma.lencoWebhookEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date() },
    });

    return event;
  },

  // ─── Collections (Mobile Money) ──────────────────────────────────────

  async initiateMobileMoneyCollection(payload: {
    userId: string;
    policyId: string;
    amount: number;
    provider: string;
    phoneNumber: string;
  }) {
    const reference = generateReference();

    // Create a Payment record (PENDING)
    const payment = await prisma.payment.create({
      data: {
        userId: payload.userId,
        policyId: payload.policyId,
        amount: payload.amount,
        status: "PENDING",
        method: "MOBILE_MONEY",
      },
    });

    // Create local collection record
    const collection = await prisma.lencoCollection.create({
      data: {
        reference,
        userId: payload.userId,
        policyId: payload.policyId,
        amount: payload.amount,
        provider: payload.provider.toUpperCase(),
        phoneNumber: payload.phoneNumber,
        status: "PENDING",
        paymentId: payment.id,
      },
    });

    try {
      const res = await lencoClient.initiateMobileMoneyCollection({
        amount: payload.amount.toString(),
        phoneNumber: payload.phoneNumber,
        provider: payload.provider.toUpperCase(),
        reference,
        narration: `DEBS Insurance premium payment`,
      });

      const lencoData = res.data as { id?: string };

      return await prisma.lencoCollection.update({
        where: { id: collection.id },
        data: {
          lencoId: lencoData.id ?? null,
          lencoResponse: res.data as object,
        },
        include: { policy: { include: { policyType: true } } },
      });
    } catch (error) {
      const message =
        error instanceof LencoApiError
          ? error.lencoMessage
          : error instanceof Error
            ? error.message
            : "Unknown error";

      await prisma.lencoCollection.update({
        where: { id: collection.id },
        data: {
          status: "FAILED",
          failureReason: message ?? "Lenco API call failed",
        },
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      throw error;
    }
  },

  async getCollections(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      prisma.lencoCollection.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          policy: { include: { policyType: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.lencoCollection.count(),
    ]);

    return {
      collections,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getCollectionStatus(reference: string) {
    const local = await prisma.lencoCollection.findUnique({
      where: { reference },
      include: { user: true, policy: true, payment: true },
    });

    try {
      const res = await lencoClient.getCollectionByReference(reference);
      const lencoData = res.data as { status?: string };

      if (local && lencoData.status) {
        const statusMap: Record<string, string> = {
          pending: "PENDING",
          successful: "SUCCESSFUL",
          failed: "FAILED",
          "pay-offline": "PAY_OFFLINE",
        };
        const mapped = statusMap[lencoData.status.toLowerCase()];
        if (mapped && mapped !== local.status) {
          await prisma.lencoCollection.update({
            where: { id: local.id },
            data: {
              status: mapped as
                | "PENDING"
                | "SUCCESSFUL"
                | "FAILED"
                | "PAY_OFFLINE",
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
};
