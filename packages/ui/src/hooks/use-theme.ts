"use client";

import { useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme-preference";
const DARK_CLASS = "dark";

/**
 * Get theme preference from localStorage
 */
export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage might be unavailable
  }

  return "system";
}

/**
 * Set theme preference in localStorage
 */
export function setThemePreference(preference: ThemePreference): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Resolve theme preference to actual theme
 */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") {
    return preference;
  }

  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Apply resolved theme to document
 */
export function applyResolvedTheme(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
}

/**
 * React hook for theme management
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    // Initialize from stored preference
    const stored = getThemePreference();
    setPreferenceState(stored);
    const resolved = resolveTheme(stored);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);

    // Subscribe to system theme changes if preference is "system"
    if (stored === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        applyResolvedTheme(newResolved);
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, []);

  const setPreference = (newPreference: ThemePreference) => {
    setPreferenceState(newPreference);
    setThemePreference(newPreference);

    const resolved = resolveTheme(newPreference);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);

    // Re-subscribe to system changes if switching to system mode
    if (newPreference === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        applyResolvedTheme(newResolved);
      };

      mediaQuery.addEventListener("change", handleChange);
    }
  };

  const toggle = () => {
    const newPreference = resolvedTheme === "dark" ? "light" : "dark";
    setPreference(newPreference);
  };

  const setSystem = () => {
    setPreference("system");
  };

  return {
    preference,
    resolvedTheme,
    setPreference,
    toggle,
    setSystem,
  };
}
