import { useCallback, useEffect, useState } from "react";
import { site } from "../config/site";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const QUERY = "(prefers-color-scheme: light)";

function readPreference(): ThemePreference {
  const attr = document.documentElement.getAttribute("data-theme-preference");
  return attr === "light" || attr === "dark" ? attr : "system";
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia?.(QUERY).matches ? "light" : "dark";
}

function apply(theme: ResolvedTheme, preference: ThemePreference) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-theme-preference", preference);
  root.style.colorScheme = theme;
}

/**
 * Theme preference (System / Light / Dark). The initial value is set before first
 * paint by the inline script in index.html; this hook takes over from there.
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    const onChange = () => setSystem(mq.matches ? "light" : "dark");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved: ResolvedTheme = preference === "system" ? system : preference;

  useEffect(() => {
    apply(resolved, preference);
  }, [resolved, preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      if (next === "system") localStorage.removeItem(site.themeStorageKey);
      else localStorage.setItem(site.themeStorageKey, next);
    } catch {
      /* storage unavailable (private mode): preference lasts for this visit only */
    }
  }, []);

  return { preference, resolved, setPreference };
}
