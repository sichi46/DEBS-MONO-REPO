import { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../types/index.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { lencoService } from "../services/lenco.service.js";
import { verifyLencoWebhook } from "../lib/lenco-webhook.js";
import { LencoApiError } from "../lib/lenco.js";
import { config } from "../config/index.js";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof LencoApiError) return error.lencoMessage ?? fallback;
  if (error instanceof Error) return error.message;
  return fallback;
}

export const lencoController = {
  // ─── Accounts ────────────────────────────────────────────────────────

  async getAccounts(_req: AuthenticatedRequest, res: Response) {
    try {
      const data = await lencoService.getAccounts();
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Lenco getAccounts error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch Lenco accounts"),
        500,
      );
    }
  },

  async getBalance(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await lencoService.getAccountBalance(
        req.params.id as string,
      );
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Lenco getBalance error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch account balance"),
        500,
      );
    }
  },

  // ─── Banks ───────────────────────────────────────────────────────────

  async getBanks(_req: AuthenticatedRequest, res: Response) {
    try {
      const data = await lencoService.getBanks();
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Lenco getBanks error:", error);
      sendError(res, getErrorMessage(error, "Failed to fetch banks"), 500);
    }
  },

  // ─── Resolve ─────────────────────────────────────────────────────────

  async resolveBankAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        accountNumber: z.string().min(1, "Account number is required"),
        bankId: z.string().min(1, "Bank ID is required"),
      });
      const { accountNumber, bankId } = schema.parse(req.body);
      const data = await lencoService.resolveBankAccount(accountNumber, bankId);
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Lenco resolveBankAccount error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid request: " + error.errors[0].message, 400);
        return;
      }
      sendError(
        res,
        getErrorMessage(error, "Failed to resolve bank account"),
        400,
      );
    }
  },

  // ─── Recipients ──────────────────────────────────────────────────────

  async createRecipient(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        accountName: z.string().min(1),
        accountNumber: z.string().min(1),
        bankId: z.string().min(1),
        bankName: z.string().min(1),
        currency: z.string().optional(),
        country: z.string().optional(),
      });
      const payload = schema.parse(req.body);
      const data = await lencoService.createRecipient(payload);
      sendSuccess(res, data, "Recipient created");
    } catch (error: unknown) {
      console.error("Lenco createRecipient error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid request: " + error.errors[0].message, 400);
        return;
      }
      sendError(res, getErrorMessage(error, "Failed to create recipient"), 400);
    }
  },

  // ─── Transfers ───────────────────────────────────────────────────────

  async initiateTransfer(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        accountId: z.string().min(1),
        recipientId: z.string().min(1),
        amount: z.number().positive("Amount must be positive"),
        narration: z.string().min(1).max(100),
        claimId: z.string().optional(),
      });
      const payload = schema.parse(req.body);
      const data = await lencoService.initiateTransfer(payload);
      sendSuccess(res, data, "Transfer initiated", 201);
    } catch (error: unknown) {
      console.error("Lenco initiateTransfer error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid request: " + error.errors[0].message, 400);
        return;
      }
      sendError(
        res,
        getErrorMessage(error, "Failed to initiate transfer"),
        400,
      );
    }
  },

  async getTransferStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await lencoService.getTransferStatus(
        req.params.reference as string,
      );
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Lenco getTransferStatus error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch transfer status"),
        500,
      );
    }
  },

  // ─── Webhooks ────────────────────────────────────────────────────────

  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers["x-lenco-signature"] as string;
      const rawBody = Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : JSON.stringify(req.body);

      if (!verifyLencoWebhook(rawBody, signature, config.lenco.apiToken)) {
        sendError(res, "Invalid webhook signature", 401);
        return;
      }

      const body = Buffer.isBuffer(req.body) ? JSON.parse(rawBody) : req.body;
      const eventType = body.event as string;

      await lencoService.processWebhookEvent(eventType, body.data ?? body);

      // Always respond 200 quickly to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error: unknown) {
      console.error("Lenco webhook error:", error);
      // Still return 200 to prevent Lenco from retrying
      res.status(200).json({ received: true, error: "Processing failed" });
    }
  },

  // ─── Collections (Mobile Money) ──────────────────────────────────────

  async initiateMobileMoneyCollection(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      const schema = z.object({
        policyId: z.string().min(1, "Policy ID is required"),
        amount: z.number().positive("Amount must be positive"),
        provider: z.enum(["MTN", "AIRTEL", "ZAMTEL"], {
          errorMap: () => ({
            message: "Provider must be MTN, AIRTEL, or ZAMTEL",
          }),
        }),
        phoneNumber: z.string().min(9, "Valid phone number required"),
      });
      const payload = schema.parse(req.body);

      const data = await lencoService.initiateMobileMoneyCollection({
        userId: req.user!.userId,
        policyId: payload.policyId,
        amount: payload.amount,
        provider: payload.provider,
        phoneNumber: payload.phoneNumber,
      });
      sendSuccess(res, data, "Mobile money collection initiated", 201);
    } catch (error: unknown) {
      console.error("Lenco collection error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid request: " + error.errors[0].message, 400);
        return;
      }
      sendError(
        res,
        getErrorMessage(error, "Failed to initiate collection"),
        400,
      );
    }
  },

  async getCollections(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit } = req.query;
      const data = await lencoService.getCollections({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Lenco getCollections error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch collections"),
        500,
      );
    }
  },

  async getCollectionStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await lencoService.getCollectionStatus(
        req.params.reference as string,
      );
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Lenco getCollectionStatus error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch collection status"),
        500,
      );
    }
  },
};
