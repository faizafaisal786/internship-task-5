import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";
import type { UserSettings } from "../types";

type Theme = UserSettings["theme"];

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeState | null>(null);

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyToDocument(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  localStorage.setItem("theme-resolved", resolved);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "dark";
  });
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    resolveTheme((localStorage.getItem("theme") as Theme) || "dark")
  );

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem("theme", next);
    const r = resolveTheme(next);
    setResolved(r);
    applyToDocument(r);
  }, []);

  useEffect(() => {
    const r = resolveTheme(theme);
    setResolved(r);
    applyToDocument(r);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = resolveTheme("system");
      setResolved(r);
      applyToDocument(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    if (!user) return;
    api<{ settings: UserSettings }>("/settings")
      .then((data) => setTheme(data.settings.theme))
      .catch(() => {});
  }, [user, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, resolved }), [theme, setTheme, resolved]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
