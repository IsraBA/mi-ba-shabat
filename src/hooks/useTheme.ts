"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import React from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme_mode";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  setMode: () => {},
});

// Apply the chosen mode to the <html> element by toggling the .dark class
function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && systemDark);
  root.classList.toggle("dark", isDark);
}

// Provider that syncs theme preference with <html> class and localStorage
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  // Load saved preference and apply on mount
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) || "system";
    setModeState(stored);
    applyMode(stored);
  }, []);

  // Listen to system preference changes when in "system" mode
  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyMode("system");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mode]);

  // Persist and apply when user changes the mode
  const setMode = useCallback((next: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
    applyMode(next);
  }, []);

  return React.createElement(ThemeContext.Provider, { value: { mode, setMode } }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
