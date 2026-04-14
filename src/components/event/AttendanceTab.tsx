"use client";

import { useEffect, useState } from "react";
import { Member } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/hooks/useMember";
import { useRealtimeRegistrations } from "@/hooks/useRealtimeRegistrations";
import { RegistrationButton } from "@/components/calendar/RegistrationButton";
import { isPastDate } from "@/lib/hebcal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AttendanceTabProps {
  eventDate: string;
  eventType: "shabbat" | "holiday";
}

// Skeleton placeholder for loading state
function AttendanceSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-12 bg-muted rounded-lg" />
      <div className="h-5 bg-muted rounded w-32 mx-auto" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 bg-muted rounded-lg" />
      ))}
    </div>
  );
}

// Tab showing who's coming to this event and registration toggle
export function AttendanceTab({ eventDate, eventType }: AttendanceTabProps) {
  const { memberId } = useMember();
  const { registrations, isLoading, refetch } = useRealtimeRegistrations(eventDate);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const past = isPastDate(new Date(eventDate));

  // Fetch all family members
  useEffect(() => {
    async function fetchMembers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("members")
        .select("*")
        .order("display_order");

      if (data) {
        setMembers(data);

        // Auto-register always-attending members for future events
        if (!past) {
          const alwaysAttending = data.filter((m) => m.always_attending);
          for (const member of alwaysAttending) {
            const alreadyRegistered = registrations.some(
              (r) => r.member_id === member.id
            );
            if (!alreadyRegistered) {
              await supabase
                .from("event_registrations")
                .upsert(
                  { member_id: member.id, event_date: eventDate },
                  { onConflict: "member_id,event_date" }
                );
            }
          }
        }
      }
      setMembersLoading(false);
    }
    fetchMembers();
  }, [eventDate, past, registrations]);

  // Show skeleton while loading
  if (isLoading || membersLoading) {
    return <AttendanceSkeleton />;
  }

  // Build a set of registered member IDs for quick lookup
  const registeredIds = new Set(registrations.map((r) => r.member_id));
  const isCurrentUserRegistered = memberId ? registeredIds.has(memberId) : false;

  return (
    <div className="p-4 space-y-4">
      {/* Registration button for current user (only for future events) */}
      {!past && (
        <RegistrationButton
          eventDate={eventDate}
          eventType={eventType}
          isRegistered={isCurrentUserRegistered}
          onToggle={refetch}
        />
      )}

      {/* Summary count */}
      <div className="text-center text-sm text-muted-foreground">
        {registeredIds.size} מתוך {members.length} מגיעים
      </div>

      {/* Member list with attendance status badges */}
      <div className="space-y-2">
        {members.map((member) => {
          const isRegistered = registeredIds.has(member.id);
          return (
            <div
              key={member.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                isRegistered ? "bg-green-50 border-green-200" : "bg-muted/30"
              )}
            >
              <span className="font-medium">{member.name}</span>
              <Badge
                variant={isRegistered ? "default" : "secondary"}
                className={cn(
                  isRegistered
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isRegistered ? "מגיע/ה" : "לא מגיע/ה"}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
