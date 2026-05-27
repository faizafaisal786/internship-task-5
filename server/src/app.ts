import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import authRoutes from "./routes/auth.js";
import analyticsRoutes from "./routes/analytics.js";
import activityRoutes from "./routes/activity.js";
import settingsRoutes from "./routes/settings.js";
import insightsRoutes from "./routes/insights.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

export function createApp() {
  const app = express();
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "SaaS Dashboard API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", apiLimiter);
  app.use("/api/auth", authRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/activity", activityRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/insights", insightsRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      code: "SERVER_ERROR",
    });
  });

  return app;
}
