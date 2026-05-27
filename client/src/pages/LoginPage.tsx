import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  { role: "Admin", email: "admin@saas.com", password: "admin123" },
  { role: "User", email: "user@saas.com", password: "user123" },
];

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.code === "AUTH_RATE_LIMIT") {
          setError("Too many login attempts. Please wait 15 minutes.");
        }
      } else {
        setError("Unable to connect to server. Is the API running?");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-brand-900 via-surface to-surface p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">
            N
          </div>
          <span className="text-xl font-semibold text-white">Nexus SaaS</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Enterprise analytics
            <br />
            <span className="text-brand-400">built for scale</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-slate-400">
            Role-based access, real-time charts, activity monitoring, and API rate limiting — all in one dashboard.
          </p>
          <ul className="mt-8 space-y-3 text-slate-400">
            {["Admin & User roles", "Interactive analytics", "Audit activity logs", "Secure API layer"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand-400" />
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
        <p className="text-sm text-slate-600">Internship Project — Task 5</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
                N
              </div>
              <span className="text-lg font-semibold">Nexus SaaS</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-1 text-slate-500">Sign in to your dashboard account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-600">
              Demo accounts
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="rounded-lg border border-surface-border bg-surface-elevated p-3 text-left text-sm transition hover:border-brand-500/50"
                >
                  <span className="font-medium text-brand-300">{acc.role}</span>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
