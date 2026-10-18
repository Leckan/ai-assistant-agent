"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  preference: ThemePreference;
  setTheme: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  preference: "system",
  setTheme: () => {},
  toggleTheme: () => {},
});

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDOM(resolved: ThemeMode, storedValue: string | null) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.dataset.theme = resolved;

  const meta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
  if (meta) {
    meta.content =
      storedValue === "light" || storedValue === "dark" ? storedValue : "light dark";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [theme, setResolvedTheme] = useState<ThemeMode>("dark");

  const syncFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem("color-scheme");
      if (stored === "light" || stored === "dark") {
        setPreference(stored);
        setResolvedTheme(stored);
        applyThemeToDOM(stored, stored);
      } else {
        setPreference("system");
        const sys = getSystemTheme();
        setResolvedTheme(sys);
        applyThemeToDOM(sys, null);
      }
    } catch {
      const sys = getSystemTheme();
      setResolvedTheme(sys);
      applyThemeToDOM(sys, null);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();

    // Sync across tabs when localStorage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "color-scheme" || e.key === null) {
        syncFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Follow OS changes when in system mode (never delete stored override when OS changes)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      try {
        const stored = localStorage.getItem("color-scheme");
        if (stored !== "light" && stored !== "dark") {
          const sys = mediaQuery.matches ? "dark" : "light";
          setResolvedTheme(sys);
          applyThemeToDOM(sys, null);
        }
      } catch {
        const sys = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(sys);
        applyThemeToDOM(sys, null);
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [syncFromStorage]);

  const setTheme = useCallback((nextPref: ThemePreference) => {
    setPreference(nextPref);
    if (nextPref === "system") {
      try {
        localStorage.removeItem("color-scheme");
      } catch {
        // Ignore storage error
      }
      const sys = getSystemTheme();
      setResolvedTheme(sys);
      applyThemeToDOM(sys, null);
    } else {
      try {
        localStorage.setItem("color-scheme", nextPref);
      } catch {
        // Ignore storage error
      }
      setResolvedTheme(nextPref);
      applyThemeToDOM(nextPref, nextPref);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Target scheme = the opposite of the currently rendered scheme
    const target: ThemeMode = theme === "dark" ? "light" : "dark";
    const sys = getSystemTheme();

    // Per modern-web-guidance: if target matches system preference, remove stored value;
    // if target differs from system preference, store it literally.
    if (target === sys) {
      try {
        localStorage.removeItem("color-scheme");
      } catch {
        // Ignore storage error
      }
      setPreference("system");
      setResolvedTheme(target);
      applyThemeToDOM(target, null);
    } else {
      try {
        localStorage.setItem("color-scheme", target);
      } catch {
        // Ignore storage error
      }
      setPreference(target);
      setResolvedTheme(target);
      applyThemeToDOM(target, target);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
