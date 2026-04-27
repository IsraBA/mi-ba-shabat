"use client";

import { useTheme, ThemeMode } from "@/hooks/useTheme";
import { FaSun, FaMoon, FaCircleHalfStroke } from "react-icons/fa6";

// Cycle order: system → light → dark → system
const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABELS: Record<ThemeMode, string> = {
  system: "מצב מערכת",
  light: "מצב יום",
  dark: "מצב לילה",
};

// 3-state theme switch: light / dark / system
export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  // Pick icon based on current mode
  const Icon = mode === "light" ? FaSun : mode === "dark" ? FaMoon : FaCircleHalfStroke;

  return (
    <button
      onClick={() => setMode(NEXT_MODE[mode])}
      aria-label={LABELS[mode]}
      title={LABELS[mode]}
      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
