import express, { type IRouter } from "express";
import fs from "fs";
import path from "path";

// In CJS (NodeNext without "type":"module"), __dirname is available natively.
// The routes folder is src/routes/, so two levels up reaches apps/api/.
const CAPTURES_DIR = path.resolve(__dirname, "../../webhook-captures");

const router: IRouter = express.Router();

router.post(
  "/webhooks/capture",
  express.raw({ type: "*/*", limit: "1mb" }),
  (req, res) => {
    const rawBody = (req.body as Buffer).toString("utf-8");

    let parsedBody: unknown = null;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = null;
    }

    const now = new Date();
    const captureObject = {
      capturedAt: now.toISOString(),
      headers: req.headers,
      rawBody,
      parsedBody,
    };

    fs.mkdirSync(CAPTURES_DIR, { recursive: true });

    const filename = `capture-${now.getTime()}.json`;
    const filePath = path.join(CAPTURES_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(captureObject, null, 2), "utf-8");

    console.log(`[WEBHOOK CAPTURE] Saved to: ${filename}`);
    console.log("[WEBHOOK CAPTURE] Headers:", req.headers);
    console.log("[WEBHOOK CAPTURE] Raw body:", rawBody);

    res.status(200).json({ captured: true, file: filename });
  },
);

export default router;
