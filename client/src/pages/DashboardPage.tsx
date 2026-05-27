import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, Percent, Users, Zap } from "lucide-react";
import { api } from "../api/client";
import { AiInsightsCard } from "../components/AiInsightsCard";
import { KpiCard } from "../components/KpiCard";
import { useAuth } from "../context/AuthContext";
import type { AnalyticsOverview } from "../types";

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<AnalyticsOverview>("/analytics/overview")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card border-red-500/30 text-red-400">
        {error || "No data available"}
      </div>
    );
  }

  const { kpis, revenueChart, trafficBySource, planDistribution, recentMetrics } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title text-2xl font-bold">Analytics Overview</h1>
        <p className="mt-1 text-slate-500">
          {isAdmin
            ? "Full platform metrics and revenue insights"
            : "Your account metrics and usage summary"}
        </p>
      </div>

      <AiInsightsCard data={data} isAdmin={isAdmin} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(kpis.totalRevenue)}
          change={kpis.revenueChange}
          icon={DollarSign}
        />
        <KpiCard
          title="Active Users"
          value={formatNumber(kpis.activeUsers)}
          change={kpis.usersChange}
          icon={Users}
        />
        <KpiCard
          title="Conversion Rate"
          value={`${kpis.conversionRate}%`}
          change={kpis.conversionChange}
          icon={Percent}
        />
        <KpiCard
          title="API Calls"
          value={formatNumber(kpis.apiCalls)}
          change={kpis.apiChange}
          icon={Zap}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-white">Revenue & User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: "#1c2030",
                  border: "1px solid #2a3042",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                fill="url(#revenueGrad)"
                strokeWidth={2}
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-white">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                dataKey="count"
                nameKey="plan"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {planDistribution.map((_, i) => (
                  <Cell
                    key={i}
                    fill={["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"][i % 4]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1c2030",
                  border: "1px solid #2a3042",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-white">Traffic by Source</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trafficBySource} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3042" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis type="category" dataKey="source" stroke="#64748b" fontSize={12} width={80} />
              <Tooltip
                contentStyle={{
                  background: "#1c2030",
                  border: "1px solid #2a3042",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                {trafficBySource.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-white">Key Metrics</h3>
          <dl className="grid grid-cols-2 gap-4">
            {[
              { label: "Avg. Session", value: recentMetrics.avgSessionDuration },
              { label: "Bounce Rate", value: recentMetrics.bounceRate },
              { label: "MRR", value: recentMetrics.mrr },
              { label: "NPS Score", value: recentMetrics.nps || "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-surface-border bg-surface-elevated p-4"
              >
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 text-xl font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
          {!isAdmin && (
            <p className="mt-4 text-xs text-slate-600">
              Limited view for standard users. Admin sees full platform data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
