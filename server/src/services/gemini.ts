import { GoogleGenerativeAI } from "@google/generative-ai";

/** Models that work with current Gemini API (fallback order) */
const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
] as const;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_NOT_CONFIGURED");
  }
  return new GoogleGenerativeAI(apiKey);
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests");
}

export async function generateAnalyticsInsight(metrics: {
  role: string;
  kpis: Record<string, number>;
  highlights: string[];
}): Promise<string> {
  const genAI = getClient();
  const prompt = `You are a SaaS analytics assistant. Given dashboard metrics for a ${metrics.role} user, write a concise executive summary in 3-4 bullet points (plain text, no markdown headers). Be specific with numbers when provided. Keep under 120 words.

KPIs: ${JSON.stringify(metrics.kpis)}
Highlights: ${metrics.highlights.join("; ")}`;

  let lastError: unknown;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();
      if (text) return text;
    } catch (err) {
      lastError = err;
      if (!isRetryable(err)) {
        console.warn(`Gemini ${modelName}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : "All Gemini models failed";
  if (message.includes("429") || message.includes("quota")) {
    throw new Error("Gemini API quota exceeded. Wait a minute or check billing at ai.google.dev");
  }
  throw new Error(message);
}
