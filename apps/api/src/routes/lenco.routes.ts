import { Router, type IRouter } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { lencoController } from "../controllers/lenco.controller.js";

const router: IRouter = Router();

// Admin-only: account and balance management
router.get(
  "/accounts",
  authenticate,
  requireAdmin,
  lencoController.getAccounts,
);
router.get(
  "/accounts/:id/balance",
  authenticate,
  requireAdmin,
  lencoController.getBalance,
);

// Authenticated: bank lookup (needed for payout forms)
router.get("/banks", authenticate, lencoController.getBanks);
router.post(
  "/resolve/bank-account",
  authenticate,
  lencoController.resolveBankAccount,
);

// Admin-only: recipient and transfer management
router.post(
  "/recipients",
  authenticate,
  requireAdmin,
  lencoController.createRecipient,
);
router.post(
  "/transfers",
  authenticate,
  requireAdmin,
  lencoController.initiateTransfer,
);
router.get(
  "/transfers/:reference/status",
  authenticate,
  requireAdmin,
  lencoController.getTransferStatus,
);

// Authenticated: mobile money collections (premium payments)
router.post(
  "/collections/mobile-money",
  authenticate,
  lencoController.initiateMobileMoneyCollection,
);
router.get(
  "/collections",
  authenticate,
  requireAdmin,
  lencoController.getCollections,
);
router.get(
  "/collections/:reference/status",
  authenticate,
  lencoController.getCollectionStatus,
);

// Public: webhook receiver (signature-verified internally)
router.post("/webhooks", lencoController.handleWebhook);

export default router;
