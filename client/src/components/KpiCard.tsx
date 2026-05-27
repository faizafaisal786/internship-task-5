import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
}

export function KpiCard({ title, value, change, icon: Icon }: KpiCardProps) {
  const positive = change >= 0;

  return (
    <div className="card group transition hover:border-brand-500/40 hover:shadow-glow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
        </div>
        <div className="rounded-lg bg-brand-600/15 p-2.5 text-brand-400 transition group-hover:bg-brand-600/25">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-sm">
        {positive ? (
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-400" />
        )}
        <span className={positive ? "text-emerald-400" : "text-red-400"}>
          {positive ? "+" : ""}
          {change}%
        </span>
        <span className="text-slate-500">vs last month</span>
      </div>
    </div>
  );
}
