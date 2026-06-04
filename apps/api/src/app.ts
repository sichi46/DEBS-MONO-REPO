import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config, validateConfig } from "./config/index.js";
import authRoutes from "./routes/auth.routes.js";
import policiesRoutes from "./routes/policies.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import lencoRoutes from "./routes/lenco.routes.js";
import lencoCaptureRoutes from "./routes/lenco-capture.routes.js";
import { sendError } from "./utils/response.js";

// Validate required environment variables at startup
validateConfig();

// =============================================================================
// Create Express App
// =============================================================================

const app: Application = express();

// =============================================================================
// Middleware
// =============================================================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request logging
if (config.nodeEnv !== "test") {
  app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
}

// Raw body capture for Lenco webhook HMAC verification (must precede express.json).
// 64 KB is well above any realistic Lenco payload and prevents abuse of the
// public endpoint before signature verification runs.
app.use(
  "/api/lenco/webhooks",
  express.raw({ type: "application/json", limit: "64kb" }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =============================================================================
// Health Check
// =============================================================================

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// =============================================================================
// API Routes
// =============================================================================

app.use("/api/auth", authRoutes);
app.use("/api/policies", policiesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lenco", lencoRoutes);
app.use("/api/lenco", lencoCaptureRoutes);

// =============================================================================
// 404 Handler
// =============================================================================

app.use((_req, res) => {
  sendError(res, "Route not found", 404);
});

// =============================================================================
// Global Error Handler
// =============================================================================

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);

    const statusCode = 500;
    const message =
      config.nodeEnv === "production"
        ? "Internal server error"
        : err.message || "Internal server error";

    sendError(res, message, statusCode);
  },
);

export default app;
