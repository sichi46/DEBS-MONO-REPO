import { Router, type IRouter, type Request, type Response } from "express";
import { lencoService } from "../services/lenco.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router: IRouter = Router();

// Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
// If CRON_SECRET is not configured the endpoint is disabled entirely.
router.post("/lenco-reconcile", async (req: Request, res: Response) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    sendError(res, "Cron endpoint not configured", 503);
    return;
  }

  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${cronSecret}`) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  try {
    const result = await lencoService.reconcileStuckTransfers();
    sendSuccess(res, result, "Reconciliation complete");
  } catch (error: unknown) {
    console.error("Cron reconcile error:", error);
    sendError(
      res,
      error instanceof Error ? error.message : "Reconciliation failed",
      500,
    );
  }
});

export default router;
