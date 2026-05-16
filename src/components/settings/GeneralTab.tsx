"use client";

import { useTheme, ThemeMode } from "@/hooks/useTheme";
import { FaSun, FaMoon, FaCircleHalfStroke } from "react-icons/fa6";
import { cn } from "@/lib/utils";

const MODES: { mode: ThemeMode; label: string; Icon: typeof FaSun }[] = [
  { mode: "light", label: "מצב יום", Icon: FaSun },
  { mode: "dark", label: "מצב לילה", Icon: FaMoon },
  { mode: "system", label: "מצב מערכת", Icon: FaCircleHalfStroke },
];

// General settings: theme. Future home for notification toggle, etc.
export function GeneralTab() {
  const { mode, setMode } = useTheme();

  return (
    <div className="py-4 space-y-4">
      <section>
        <h2 className="text-sm font-medium mb-2">מצב תצוגה</h2>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(({ mode: m, label, Icon }) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors",
                mode === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
