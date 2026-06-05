"use client";

import { useState, useEffect } from "react";
import { useTheme, ThemeMode } from "@/hooks/useTheme";
import { useMember } from "@/hooks/useMember";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FaSun, FaMoon, FaCircleHalfStroke, FaBell } from "react-icons/fa6";
import { cn } from "@/lib/utils";

const MODES: { mode: ThemeMode; label: string; Icon: typeof FaSun }[] = [
  { mode: "light", label: "מצב יום", Icon: FaSun },
  { mode: "dark", label: "מצב לילה", Icon: FaMoon },
  { mode: "system", label: "מצב מערכת", Icon: FaCircleHalfStroke },
];

// General settings: theme. Future home for notification toggle, etc.
export function GeneralTab() {
  const { mode, setMode } = useTheme();
  const { memberId } = useMember();
  const [isIsrael, setIsIsrael] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Check whether the current member is ישראל (debug button is for him only)
  useEffect(() => {
    if (!memberId) return;
    const supabase = createClient();
    supabase
      .from("members")
      .select("name")
      .eq("id", memberId)
      .single()
      .then(({ data }) => setIsIsrael(data?.name === "ישראל"));
  }, [memberId]);

  // Send a test push notification to all of the current member's devices
  const sendTest = async () => {
    if (!memberId) return;
    setSending(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_ids: [memberId],
          payload: {
            title: "התראת בדיקה",
            body: "אם אתה רואה את זה, ההתראות עובדות",
            tag: "test",
          },
        }),
      });
      const data = await res.json();
      setTestStatus(`נשלח ל-${data.sent ?? 0} מכשירים`);
    } catch {
      setTestStatus("שליחה נכשלה");
    } finally {
      setSending(false);
    }
  };

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

      {/* Debug-only: test push notification, visible to ישראל */}
      {isIsrael && (
        <section>
          <h2 className="text-sm font-medium mb-2">בדיקת התראות</h2>
          <div className="flex items-center gap-3">
            <Button onClick={sendTest} disabled={sending} className="gap-2">
              <FaBell className="w-4 h-4" />
              {sending ? "שולח..." : "שלח התראת בדיקה"}
            </Button>
            {testStatus && (
              <span className="text-sm text-muted-foreground">{testStatus}</span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
