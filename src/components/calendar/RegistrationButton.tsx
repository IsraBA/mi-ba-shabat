"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/hooks/useMember";
import { FaCheck, FaTimes } from "react-icons/fa";

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

  // Dynamic label based on event type and registration status
  const label = isRegistered
    ? eventType === "shabbat"
      ? "אנחנו לא מגיעים בשבת"
      : "אנחנו לא מגיעים לחג"
    : eventType === "shabbat"
      ? "אנחנו מגיעים בשבת!"
      : "אנחנו מגיעים לחג!";

  // Handle registration toggle
  const handleClick = async () => {
    if (!memberId) return;
    setIsLoading(true);

    try {
      const supabase = createClient();

      if (isRegistered) {
        // Unregister
        await supabase
          .from("event_registrations")
          .delete()
          .eq("member_id", memberId)
          .eq("event_date", eventDate);
      } else {
        // Register
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
          {isRegistered ? <FaTimes className="w-4 h-4" /> : <FaCheck className="w-4 h-4" />}
          {label}
        </span>
      )}
    </Button>
  );
}
