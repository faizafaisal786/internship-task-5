import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/activity", label: "Activity Logs", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sidebar fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-surface-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
            N
          </div>
          <div>
            <p className="page-title text-sm font-semibold">Nexus SaaS</p>
            <p className="text-xs text-slate-500">Dashboard v1.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-600/20 text-brand-300"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-surface-elevated dark:hover:text-slate-200"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-surface-border">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-100 p-3 dark:bg-surface-elevated">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/30 text-xs font-semibold text-brand-300">
              {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="page-title truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            {isAdmin ? (
              <span className="badge-admin flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            ) : (
              <span className="badge-user">User</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary w-full text-red-400 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md dark:border-surface-border dark:bg-surface/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="h-5 w-5 text-brand-400" />
              <span className="text-sm">Real-time analytics & monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              API connected
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
