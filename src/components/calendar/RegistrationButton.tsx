"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/hooks/useMember";
import { comingLabel, notComingLabel } from "@/lib/gender";
import { Gender } from "@/types";
import { FaCheck, FaXmark } from "react-icons/fa6";

interface RegistrationButtonProps {
  eventDate: string;
  eventType: "shabbat" | "holiday";
  isRegistered: boolean;
  onToggle: () => void;
  compact?: boolean;
}

// Toggle button for registering/unregistering for an event
export function RegistrationButton({
  eventDate,
  eventType,
  isRegistered,
  onToggle,
  compact = false,
}: RegistrationButtonProps) {
  const { memberId } = useMember();
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState<Gender>("plural");

  // Fetch current member's gender for conjugation
  useEffect(() => {
    if (!memberId) return;
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
  }, [memberId]);

  // Dynamic gendered label
  const label = isRegistered
    ? notComingLabel(gender, eventType)
    : comingLabel(gender, eventType);

  // Handle registration toggle
  const handleClick = async () => {
    if (!memberId) return;
    setIsLoading(true);

    try {
      const supabase = createClient();

      if (isRegistered) {
        await supabase
          .from("event_registrations")
          .delete()
          .eq("member_id", memberId)
          .eq("event_date", eventDate);
      } else {
        await supabase
          .from("event_registrations")
          .insert({ member_id: memberId, event_date: eventDate });
      }

      onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !memberId}
      variant={isRegistered ? "destructive" : "default"}
      size={compact ? "sm" : "lg"}
      className={
        compact
          ? "text-xs"
          : "w-full text-lg font-bold h-14 rounded-xl shadow-md hover:shadow-lg transition-all"
      }
    >
      {isLoading ? (
        "..."
      ) : compact ? (
        isRegistered ? "✓" : "+"
      ) : (
        <span className="flex items-center gap-2">
          {isRegistered ? <FaXmark className="w-4 h-4" /> : <FaCheck className="w-4 h-4" />}
          {label}
        </span>
      )}
    </Button>
  );
}
