import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToMembers, sendPushToAllExcept } from "@/lib/push";
import { memberRegistered, memberCancelled, roomAssigned, guestAdded, registeredByAdmin, cancelledByAdmin } from "@/lib/notifications";
import { Gender } from "@/types";

// POST - Trigger a notification based on an event
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, member_id, event_date, event_type, room_name, admin_id } = body;

  const supabase = await createClient();

  // Fetch the member who triggered the action (or, for admin-acting types, the target)
  const { data: member } = await supabase
    .from("members")
    .select("name, gender")
    .eq("id", member_id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const gender = member.gender as Gender;
  const eType = event_type as "shabbat" | "holiday";

  switch (type) {
    case "member_registered": {
      // Notify everyone except the person who registered
      const payload = memberRegistered(member.name, gender, eType);
      payload.url = `/event/${event_date}`;
      await sendPushToAllExcept(member_id, payload);
      break;
    }

    case "member_cancelled": {
      // Notify everyone except the person who cancelled
      const payload = memberCancelled(member.name, gender, eType);
      payload.url = `/event/${event_date}`;
      await sendPushToAllExcept(member_id, payload);
      break;
    }

    case "room_assigned": {
      // Notify the specific member who was assigned to a room
      const payload = roomAssigned(gender, room_name, eType);
      payload.url = `/event/${event_date}`;
      await sendPushToMembers([member_id], payload);
      break;
    }

    case "guest_added": {
      // Notify everyone that a guest is coming
      const { guest_name } = body;
      const payload = guestAdded(guest_name, eType);
      payload.url = `/event/${event_date}`;
      await sendPushToAllExcept(member_id, payload);
      break;
    }

    case "registered_by_admin":
    case "cancelled_by_admin": {
      // Admin registered/cancelled someone else: send a personal note to the target
      // ("{adminName} רשמה אותך ...") AND broadcast the regular change to everyone
      // except the admin and the target.
      if (!admin_id) {
        return NextResponse.json({ error: "admin_id required" }, { status: 400 });
      }
      const { data: admin } = await supabase
        .from("members")
        .select("name, gender")
        .eq("id", admin_id)
        .single();
      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }
      const adminGender = admin.gender as Gender;
      const isRegister = type === "registered_by_admin";

      // Personal notification to the target ("אמא רשמה אותך לשבת")
      const personalPayload = isRegister
        ? registeredByAdmin(admin.name, adminGender, eType)
        : cancelledByAdmin(admin.name, adminGender, eType);
      personalPayload.url = `/event/${event_date}`;
      await sendPushToMembers([member_id], personalPayload);

      // Broadcast to everyone else (excluding admin AND target)
      const broadcastPayload = isRegister
        ? memberRegistered(member.name, gender, eType)
        : memberCancelled(member.name, gender, eType);
      broadcastPayload.url = `/event/${event_date}`;
      const { data: allMembers } = await supabase.from("members").select("id");
      const broadcastIds = (allMembers ?? [])
        .map((m) => m.id)
        .filter((id) => id !== admin_id && id !== member_id);
      if (broadcastIds.length > 0) {
        await sendPushToMembers(broadcastIds, broadcastPayload);
      }
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown trigger type" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
