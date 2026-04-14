"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { EventRegistration } from "@/types";

// Hook to subscribe to real-time registration changes for a given event date
export function useRealtimeRegistrations(eventDate: string | null) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial registrations
  const fetchRegistrations = useCallback(async () => {
    if (!eventDate) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_date", eventDate);

    if (data) setRegistrations(data);
    setIsLoading(false);
  }, [eventDate]);

  // Load initial data and subscribe to changes
  useEffect(() => {
    if (!eventDate) return;

    fetchRegistrations();

    // Subscribe to real-time changes on this event's registrations
    const supabase = createClient();
    const channel = supabase
      .channel(`registrations:${eventDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_registrations",
          filter: `event_date=eq.${eventDate}`,
        },
        () => {
          // Refetch on any change (simpler than manual state patching)
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventDate, fetchRegistrations]);

  return { registrations, isLoading, refetch: fetchRegistrations };
}
