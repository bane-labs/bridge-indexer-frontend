"use client";

import { useEffect } from "react";

import { applyResolvedTheme, getThemePreference, resolveTheme } from "@atlas/ui";

import type React from "react";

const STORAGE_KEY = "theme-preference";

function ThemeSync() {
  useEffect(() => {
    const applyTheme = () => {
      const preference = getThemePreference();
      const resolved = resolveTheme(preference);
      applyResolvedTheme(resolved);
    };

    applyTheme();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        applyTheme();
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (getThemePreference() === "system") {
        applyTheme();
      }
    };

    window.addEventListener("storage", handleStorage);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeSync />
      {children}
    </>
  );
}
