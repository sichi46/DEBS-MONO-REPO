import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response.js";

const tooManyRequests = "Too many requests. Please try again later.";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, tooManyRequests, 429),
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, tooManyRequests, 429),
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, tooManyRequests, 429),
});
