import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./auth/route.js";

const app: Express = express();


// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"]
}));

// Health Check
app.get("/health", (_, res) => res.send({ status: "ok" }));

// Route Mounting
app.use("/api/v1/auth", authRouter);

export default app;
