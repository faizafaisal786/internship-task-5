import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Search, XCircle } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { ActivityLog } from "../types";

const statusConfig = {
  success: { badge: "badge-success", icon: CheckCircle2 },
  warning: { badge: "badge-warning", icon: AlertTriangle },
  error: { badge: "badge-error", icon: XCircle },
};

export function ActivityPage() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<{ total: number; last24h: number; errors: number } | null>(
    null
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const data = await api<{
        items: ActivityLog[];
        pagination: { totalPages: number };
      }>(`/activity?${params}`);
      setLogs(data.items);
      setTotalPages(data.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (isAdmin) {
      api<{ total: number; last24h: number; errors: number }>("/activity/stats")
        .then(setStats)
        .catch(() => {});
    }
  }, [isAdmin]);

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title text-2xl font-bold">Activity Logs</h1>
        <p className="mt-1 text-slate-500">
          {isAdmin ? "Audit trail for all users on the platform" : "Your recent account activity"}
        </p>
      </div>

      {isAdmin && stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total events", value: stats.total },
            { label: "Last 24 hours", value: stats.last24h },
            { label: "Errors", value: stats.errors },
          ].map(({ label, value }) => (
            <div key={label} className="card">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              className="input pl-10"
              placeholder="Search actions, resources..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="input max-w-[160px]"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-slate-500">
                <th className="pb-3 pr-4 font-medium">Time</th>
                {isAdmin && <th className="pb-3 pr-4 font-medium">User</th>}
                <th className="pb-3 pr-4 font-medium">Action</th>
                <th className="pb-3 pr-4 font-medium">Resource</th>
                <th className="pb-3 pr-4 font-medium">IP</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const cfg = statusConfig[log.status];
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-surface-border/50 transition hover:bg-surface-elevated/50"
                    >
                      <td className="py-3.5 pr-4 text-slate-400">{formatTime(log.timestamp)}</td>
                      {isAdmin && (
                        <td className="py-3.5 pr-4 font-medium text-slate-200">{log.userName}</td>
                      )}
                      <td className="py-3.5 pr-4 font-mono text-xs text-brand-300">
                        {log.action}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-400">{log.resource}</td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-slate-500">{log.ip}</td>
                      <td className="py-3.5">
                        <span className={`${cfg.badge} gap-1`}>
                          <Icon className="inline h-3 w-3" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
