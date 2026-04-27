"use client";

import { useEffect, useState, useCallback } from "react";
import { Room, RoomAssignment, Member } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useMember, isAdmin } from "@/hooks/useMember";
import { isPastDate } from "@/lib/hebcal";
import { Button } from "@/components/ui/button";
import Select, { MultiValue } from "react-select";
import { FaDoorOpen, FaUser } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface RoomsTabProps {
  eventDate: string;
}

interface SelectOption {
  value: string;
  label: string;
}

// Skeleton placeholder for loading state
function RoomsSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-lg" />
      ))}
    </div>
  );
}

// Tab showing room assignments for this event
export function RoomsTab({ eventDate }: RoomsTabProps) {
  const { memberId } = useMember();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const past = isPastDate(new Date(eventDate));

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    const supabase = createClient();

    // Parallel fetch
    const [roomsRes, assignRes, membersRes, regsRes] = await Promise.all([
      supabase.from("rooms").select("*").order("display_order"),
      supabase.from("room_assignments").select("*").eq("event_date", eventDate),
      supabase.from("members").select("*").order("display_order"),
      supabase.from("event_registrations").select("member_id").eq("event_date", eventDate),
    ]);

    if (roomsRes.data) setRooms(roomsRes.data);
    if (assignRes.data) setAssignments(assignRes.data);
    if (membersRes.data) {
      setMembers(membersRes.data);
      const me = membersRes.data.find((m) => m.id === memberId);
      setCurrentMember(me || null);

      // Auto-register always-attending members if not already registered
      if (!past) {
        const regIds = new Set(regsRes.data?.map((r) => r.member_id) || []);
        const toRegister = membersRes.data.filter(
          (m) => m.always_attending && !regIds.has(m.id)
        );
        for (const m of toRegister) {
          await supabase
            .from("event_registrations")
            .upsert(
              { member_id: m.id, event_date: eventDate },
              { onConflict: "member_id,event_date" }
            );
          regIds.add(m.id);
        }
        setRegisteredIds(regIds);
      } else if (regsRes.data) {
        setRegisteredIds(new Set(regsRes.data.map((r) => r.member_id)));
      }
    } else if (regsRes.data) {
      setRegisteredIds(new Set(regsRes.data.map((r) => r.member_id)));
    }
    setIsLoading(false);
  }, [eventDate, memberId]);

  useEffect(() => {
    fetchData();

    // Subscribe to real-time room assignment changes (no filter for DELETE compatibility)
    const supabase = createClient();
    const channel = supabase
      .channel(`rooms:${eventDate}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_assignments" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventDate, fetchData]);

  // Set members for a room (handles add/remove to match selected list)
  const handleSetRoomMembers = async (roomId: string, selectedMemberIds: string[]) => {
    if (!memberId) return;
    const supabase = createClient();

    // Current assignments for this room
    const currentForRoom = assignments.filter((a) => a.room_id === roomId);
    const currentMemberIds = new Set(currentForRoom.map((a) => a.member_id));
    const newMemberIds = new Set(selectedMemberIds);

    // Members to remove (were assigned, no longer selected)
    const toRemove = currentForRoom.filter((a) => !newMemberIds.has(a.member_id));

    // Members to add (newly selected)
    const toAdd = selectedMemberIds.filter((mid) => !currentMemberIds.has(mid));

    // Remove old assignments
    for (const assignment of toRemove) {
      await supabase.from("room_assignments").delete().eq("id", assignment.id);
    }

    // Add new assignments
    if (toAdd.length > 0) {
      // First remove these members from any other room (one room per member)
      for (const mid of toAdd) {
        await supabase
          .from("room_assignments")
          .delete()
          .eq("event_date", eventDate)
          .eq("member_id", mid);
      }

      // Then assign to this room
      await supabase.from("room_assignments").insert(
        toAdd.map((mid) => ({
          event_date: eventDate,
          room_id: roomId,
          member_id: mid,
          assigned_by: memberId,
        }))
      );

      // Send room assignment notifications to newly assigned members
      const room = rooms.find((r) => r.id === roomId);
      for (const mid of toAdd) {
        fetch("/api/notifications/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "room_assigned",
            member_id: mid,
            event_date: eventDate,
            event_type: "shabbat",
            room_name: room?.name || "",
          }),
        }).catch(() => {});
      }
    }

    setEditingRoom(null);
    fetchData();
  };

  // Remove all assignments from a room
  const handleClearRoom = async (roomId: string) => {
    const supabase = createClient();
    await supabase
      .from("room_assignments")
      .delete()
      .eq("event_date", eventDate)
      .eq("room_id", roomId);
    fetchData();
  };

  if (isLoading) {
    return <RoomsSkeleton />;
  }

  // Build lookup maps
  const memberMap = new Map<string, Member>();
  for (const m of members) memberMap.set(m.id, m);

  // Group assignments by room: roomId -> member[]
  const roomMembersMap = new Map<string, Member[]>();
  const assignedMemberIds = new Set<string>();
  for (const a of assignments) {
    const member = memberMap.get(a.member_id);
    if (member) {
      const list = roomMembersMap.get(a.room_id) || [];
      list.push(member);
      roomMembersMap.set(a.room_id, list);
      assignedMemberIds.add(a.member_id);
    }
  }

  // Registered members eligible for room assignment (exclude parents — they live there)
  const registeredMembers = members.filter((m) => registeredIds.has(m.id) && !m.always_attending);
  const unassignedMembers = registeredMembers.filter((m) => !assignedMemberIds.has(m.id));

  const canEdit = isAdmin(currentMember) && !past;

  // React-select options: registered members not assigned elsewhere
  const getOptionsForRoom = (roomId: string): SelectOption[] => {
    const currentRoomMembers = roomMembersMap.get(roomId) || [];
    const currentRoomMemberIds = new Set(currentRoomMembers.map((m) => m.id));

    // Show: unassigned members + members already in THIS room
    return registeredMembers
      .filter((m) => !assignedMemberIds.has(m.id) || currentRoomMemberIds.has(m.id))
      .map((m) => ({ value: m.id, label: m.name }));
  };

  // No-options message for react-select
  const noOptionsMessage = () =>
    registeredIds.size === 0
      ? "אף אחד עדיין לא נרשם לשבת"
      : "כולם כבר משובצים";

  return (
    <div className="p-4 space-y-4">
      {/* Unassigned members notice (admin only) */}
      {canEdit && unassignedMembers.length > 0 && (
        <div className="text-sm text-center text-amber-600 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/25 p-2 rounded-lg">
          עוד לא שובצו: {unassignedMembers.map((m) => m.name).join(", ")}
        </div>
      )}

      {/* Room list */}
      <div className="space-y-3">
        {rooms.map((room) => {
          const roomMembers = roomMembersMap.get(room.id) || [];
          const isEditing = editingRoom === room.id;
          const hasMembers = roomMembers.length > 0;

          return (
            <div
              key={room.id}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                hasMembers ? "bg-green-50 dark:bg-green-500/25 border-green-200 dark:border-green-500/50" : "bg-muted/30"
              )}
            >
              {/* Room header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FaDoorOpen className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{room.name}</span>
                </div>

                {canEdit && !isEditing && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setEditingRoom(room.id)}
                    >
                      {hasMembers ? "עריכה" : "שיבוץ"}
                    </Button>
                    {hasMembers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive"
                        onClick={() => handleClearRoom(room.id)}
                      >
                        ניקוי
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Assigned members display */}
              {hasMembers && !isEditing && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {roomMembers.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-800 dark:bg-green-500/30 dark:text-green-200 px-2 py-0.5 rounded-full"
                    >
                      <FaUser className="w-3 h-3" />
                      {m.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!hasMembers && !isEditing && (
                <span className="text-sm text-muted-foreground">פנוי</span>
              )}

              {/* Edit mode: multi-select */}
              {isEditing && (
                <div className="mt-2 space-y-2">
                  <Select<SelectOption, true>
                    isMulti
                    options={getOptionsForRoom(room.id)}
                    defaultValue={roomMembers.map((m) => ({
                      value: m.id,
                      label: m.name,
                    }))}
                    onChange={(selected: MultiValue<SelectOption>) => {
                      handleSetRoomMembers(
                        room.id,
                        selected.map((s) => s.value)
                      );
                    }}
                    placeholder="בחירת ילדים..."
                    noOptionsMessage={noOptionsMessage}
                    className="text-sm"
                    classNamePrefix="rs"
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base) => ({ ...base, minHeight: 36 }),
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setEditingRoom(null)}
                  >
                    סגירה
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
