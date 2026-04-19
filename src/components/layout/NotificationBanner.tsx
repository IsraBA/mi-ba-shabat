"use client";

import { useState, useEffect } from "react";
import { useMember } from "@/hooks/useMember";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { createClient } from "@/lib/supabase/client";
import { gendered } from "@/lib/gender";
import { Gender } from "@/types";
import { Button } from "@/components/ui/button";
import { FaBell, FaXmark } from "react-icons/fa6";

const DISMISSED_KEY = "push_banner_dismissed";

// Banner prompting user to enable push notifications
export function NotificationBanner() {
  const { memberId, isLoaded } = useMember();
  const { subscribe, isSubscribed, isLoading, isSupported, permissionState } = usePushSubscription();
  const [dismissed, setDismissed] = useState(true);
  const [gender, setGender] = useState<Gender>("plural");

  // Fetch member gender and decide whether to show banner
  useEffect(() => {
    if (!isLoaded || !memberId || !isSupported) return;
    if (permissionState === "granted" || isSubscribed) return;

    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (wasDismissed) return;

    // Fetch gender for gendered text
    async function fetchGender() {
      const supabase = createClient();
      const { data } = await supabase
        .from("members")
        .select("gender")
        .eq("id", memberId)
        .single();
      if (data?.gender) setGender(data.gender as Gender);
    }
    fetchGender();
    setDismissed(false);
  }, [isLoaded, memberId, isSupported, permissionState, isSubscribed]);

  // Handle enable button click
  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setDismissed(true);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (dismissed) return null;

  // Gendered prompt text
  const prompt = gendered(
    gender,
    "רוצה לקבל התראות מי מגיע שבת וכל זה?",
    "רוצה לקבל התראות מי מגיע שבת וכל זה?",
    "רוצים לקבל התראות מי מגיע שבת וכל זה?"
  );

  return (
    <div className="mx-3 mt-2 p-3 rounded-lg bg-violet-50 border border-violet-200 flex items-center gap-3">
      <FaBell className="w-5 h-5 text-violet-600 shrink-0" />
      <p className="text-sm flex-1">{prompt}</p>
      <Button
        size="sm"
        onClick={handleEnable}
        disabled={isLoading}
        className="shrink-0"
      >
        {isLoading ? "..." : "הפעלה"}
      </Button>
      <button
        onClick={handleDismiss}
        className="p-1 text-muted-foreground hover:text-foreground shrink-0"
      >
        <FaXmark className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
