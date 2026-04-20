"use client";

import { useEffect, useState, useCallback } from "react";
import { Member, EventGuest } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/hooks/useMember";
import { useRealtimeRegistrations } from "@/hooks/useRealtimeRegistrations";
import { RegistrationButton } from "@/components/calendar/RegistrationButton";
import { isPastDate } from "@/lib/hebcal";
import { attendingBadge, notAttendingBadge } from "@/lib/gender";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, ModalTitle } from "@/components/ui/modal";
import { FaPlus, FaTrash, FaUserPlus } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface AttendanceTabProps {
  eventDate: string;
  eventType: "shabbat" | "holiday";
}

// Skeleton placeholder for loading state
function AttendanceSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-14 bg-muted rounded-xl" />
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
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [deletingGuest, setDeletingGuest] = useState<EventGuest | null>(null);
  const past = isPastDate(new Date(eventDate));

  // Fetch all family members and guests
  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [membersRes, guestsRes] = await Promise.all([
      supabase.from("members").select("*").order("display_order"),
      supabase.from("event_guests").select("*").eq("event_date", eventDate).order("created_at"),
    ]);

    if (membersRes.data) {
      setMembers(membersRes.data);

      // Auto-register always-attending members for future events
      if (!past) {
        const alwaysAttending = membersRes.data.filter((m) => m.always_attending);
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

    if (guestsRes.data) setGuests(guestsRes.data);
    setMembersLoading(false);
  }, [eventDate, past, registrations]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show skeleton while loading
  if (isLoading || membersLoading) {
    return <AttendanceSkeleton />;
  }

  // Build a set of registered member IDs for quick lookup
  const registeredIds = new Set(registrations.map((r) => r.member_id));
  const isCurrentUserRegistered = memberId ? registeredIds.has(memberId) : false;
  const totalAttending = registeredIds.size + guests.length;

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
        {totalAttending} מתוך {members.length} מגיעים
        {guests.length > 0 && ` (+ ${guests.length} אורחים)`}
      </div>

      {/* Add guest button */}
      {!past && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowAddGuest(true)}
        >
          <FaPlus className="w-3 h-3" />
          הוספת אורח/ת
        </Button>
      )}

      {/* Guest list (above members) */}
      {guests.length > 0 && (
        <div className="space-y-2">
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 border-blue-200"
            >
              <span className="font-medium flex items-center gap-2">
                <FaUserPlus className="w-3.5 h-3.5 text-blue-500" />
                {guest.name}
                <span className="text-xs text-muted-foreground">(אורח/ת)</span>
              </span>
              {!past && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive px-1.5"
                  onClick={() => setDeletingGuest(guest)}
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

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
                {isRegistered
                  ? attendingBadge(member.gender)
                  : notAttendingBadge(member.gender)}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Add guest dialog */}
      {showAddGuest && (
        <AddGuestDialog
          eventDate={eventDate}
          eventType={eventType}
          memberId={memberId}
          onClose={() => setShowAddGuest(false)}
          onAdded={fetchData}
        />
      )}

      {/* Delete guest confirmation dialog */}
      {deletingGuest && (
        <DeleteGuestDialog
          guest={deletingGuest}
          onClose={() => setDeletingGuest(null)}
          onDeleted={fetchData}
        />
      )}
    </div>
  );
}

// Dialog for adding a guest
function AddGuestDialog({
  eventDate,
  eventType,
  memberId,
  onClose,
  onAdded,
}: {
  eventDate: string;
  eventType: "shabbat" | "holiday";
  memberId: string | null;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);

    const supabase = createClient();
    await supabase.from("event_guests").insert({
      event_date: eventDate,
      name: name.trim(),
      added_by: memberId,
    });

    // Notify everyone about the guest
    fetch("/api/notifications/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "guest_added",
        member_id: memberId,
        event_date: eventDate,
        event_type: eventType,
        guest_name: name.trim(),
      }),
    }).catch(() => {});

    onAdded();
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <ModalTitle>הוספת אורח/ת</ModalTitle>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="הזינו את שם האורח/ת..."
          className="w-full h-10 px-3 rounded-md border bg-background text-sm"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "מוסיף..." : "הוספה"}
        </Button>
      </div>
    </Modal>
  );
}

// Confirmation modal for deleting a guest
function DeleteGuestDialog({
  guest,
  onClose,
  onDeleted,
}: {
  guest: EventGuest;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    await supabase.from("event_guests").delete().eq("id", guest.id);
    onDeleted();
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <ModalTitle>מחיקת אורח/ת</ModalTitle>
      <div className="space-y-4">
        <p className="text-sm">
          האם למחוק את האורח/ת <strong>&quot;{guest.name}&quot;</strong>?
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? "מוחק..." : "מחיקה"}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            ביטול
          </Button>
        </div>
      </div>
    </Modal>
  );
}
