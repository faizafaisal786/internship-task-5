import { useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "../api/client";
import type { AnalyticsOverview } from "../types";

interface AiInsightsCardProps {
  data: AnalyticsOverview;
  isAdmin: boolean;
}

export function AiInsightsCard({ data, isAdmin }: AiInsightsCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ insight: string }>("/insights/analytics", {
        method: "POST",
        body: JSON.stringify({
          kpis: data.kpis,
          highlights: [
            `MRR ${data.recentMetrics.mrr}`,
            `NPS ${data.recentMetrics.nps}`,
            `Bounce ${data.recentMetrics.bounceRate}`,
            isAdmin ? "Full platform view" : "Personal account view",
          ],
        }),
      });
      setInsight(res.insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate insight");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-brand-500/20 bg-gradient-to-br from-brand-600/10 to-surface-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">AI Insights (Gemini)</h3>
        </div>
        <button type="button" className="btn-secondary text-xs" onClick={generate} disabled={loading}>
          {loading ? "Analyzing..." : insight ? "Refresh" : "Generate"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {insight ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">{insight}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Get an AI-powered summary of your dashboard metrics. API key stays on the server only.
        </p>
      )}
    </div>
  );
}
