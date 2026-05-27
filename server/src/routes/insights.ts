import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import { addActivityLog } from "../data/store.js";
import { generateAnalyticsInsight, isGeminiConfigured } from "../services/gemini.js";

const router = Router();

const insightsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "AI insights rate limit reached. Try again later.", code: "INSIGHTS_RATE_LIMIT" },
});

router.use(authenticate);
router.use(insightsLimiter);

router.get("/status", (_req, res) => {
  res.json({ configured: isGeminiConfigured() });
});

router.post("/analytics", async (req, res) => {
  if (!isGeminiConfigured()) {
    res.status(503).json({
      error: "Gemini API key not configured. Add GEMINI_API_KEY to server/.env",
      code: "GEMINI_NOT_CONFIGURED",
    });
    return;
  }

  const { kpis, highlights } = req.body as {
    kpis?: Record<string, number>;
    highlights?: string[];
  };

  if (!kpis) {
    res.status(400).json({ error: "kpis payload required" });
    return;
  }

  try {
    const insight = await generateAnalyticsInsight({
      role: req.user!.role,
      kpis,
      highlights: highlights ?? [],
    });

    addActivityLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      action: "AI_INSIGHT_GENERATED",
      resource: "insights",
      ip: (req.headers["x-forwarded-for"] as string) || "unknown",
      status: "success",
    });

    res.json({ insight });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    console.error("Gemini insight error:", detail);
    const isConfig = detail.includes("GEMINI_NOT_CONFIGURED");
    res.status(isConfig ? 503 : 502).json({
      error: isConfig
        ? "Gemini API key missing in server/.env"
        : "Failed to generate AI insight. Check API key and try again.",
      code: isConfig ? "GEMINI_NOT_CONFIGURED" : "GEMINI_ERROR",
    });
  }
});

export default router;
