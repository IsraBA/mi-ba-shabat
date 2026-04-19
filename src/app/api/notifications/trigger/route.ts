import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToMembers, sendPushToAllExcept } from "@/lib/push";
import { memberRegistered, memberCancelled, roomAssigned } from "@/lib/notifications";
import { Gender } from "@/types";

// POST - Trigger a notification based on an event
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, member_id, event_date, event_type, room_name } = body;

  const supabase = await createClient();

  // Fetch the member who triggered the action
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

    default:
      return NextResponse.json({ error: "Unknown trigger type" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
