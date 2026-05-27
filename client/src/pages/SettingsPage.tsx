import { useEffect, useState, type FormEvent } from "react";
import { Bell, Globe, Moon, Save, Shield, User } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { UserSettings } from "../types";

interface SettingsResponse {
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    createdAt?: string;
  };
  settings: UserSettings;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export function SettingsPage() {
  const { isAdmin, user } = useAuth();
  const { setTheme } = useTheme();
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<SettingsResponse>("/settings")
      .then((data) => {
        setName(data.profile.name);
        setSettings(data.settings);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load settings"));

    if (isAdmin) {
      api<{ users: AdminUser[] }>("/settings/users")
        .then((data) => setAdminUsers(data.users))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const data = await api<SettingsResponse>("/settings", {
        method: "PATCH",
        body: JSON.stringify({ name, ...settings }),
      });
      setName(data.profile.name);
      setSettings(data.settings);
      setTheme(data.settings.theme);
      setMessage("Settings saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-slate-500">Manage your profile and application preferences</p>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-5">
          <div className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-brand-400" />
            <h2 className="font-semibold">Profile</h2>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Display name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Email</label>
            <input className="input opacity-60" value={user?.email || ""} disabled />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Role</label>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <span className="badge-admin">
                  <Shield className="mr-1 inline h-3 w-3" />
                  Administrator
                </span>
              ) : (
                <span className="badge-user">Standard User</span>
              )}
            </div>
          </div>
        </div>

        <div className="card space-y-5">
          <div className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-brand-400" />
            <h2 className="font-semibold">Preferences</h2>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm text-slate-400">
              <Moon className="h-4 w-4" />
              Theme
            </label>
            <select
              className="input"
              value={settings.theme}
              onChange={(e) => {
                const theme = e.target.value as UserSettings["theme"];
                setSettings({ ...settings, theme });
                setTheme(theme);
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm text-slate-400">
              <Globe className="h-4 w-4" />
              Timezone
            </label>
            <select
              className="input"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-surface-border bg-surface-elevated p-4">
            <div>
              <p className="text-sm font-medium text-white">Email notifications</p>
              <p className="text-xs text-slate-500">Receive alerts for important events</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-surface-border bg-surface text-brand-600 focus:ring-brand-500"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({ ...settings, emailNotifications: e.target.checked })
              }
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-surface-border bg-surface-elevated p-4">
            <div>
              <p className="text-sm font-medium text-white">Two-factor authentication</p>
              <p className="text-xs text-slate-500">Add an extra layer of security</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-surface-border bg-surface text-brand-600 focus:ring-brand-500"
              checked={settings.twoFactorEnabled}
              onChange={(e) =>
                setSettings({ ...settings, twoFactorEnabled: e.target.checked })
              }
            />
          </label>
        </div>

        <div className="lg:col-span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      {isAdmin && adminUsers.length > 0 && (
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Shield className="h-5 w-5 text-brand-400" />
            User Management (Admin only)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u.id} className="border-b border-surface-border/50">
                    <td className="py-3 pr-4 text-white">{u.name}</td>
                    <td className="py-3 pr-4 text-slate-400">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={u.role === "admin" ? "badge-admin" : "badge-user"}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
