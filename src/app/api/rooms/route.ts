import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper to check if a member is an admin
async function checkAdmin(memberId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("is_admin")
    .eq("id", memberId)
    .single();

  return data?.is_admin ?? false;
}

// POST - Assign a member to a room for an event (moves them if already assigned elsewhere)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_date, room_id, member_id, assigned_by } = body;

  if (!event_date || !room_id || !member_id || !assigned_by) {
    return NextResponse.json(
      { error: "event_date, room_id, member_id, and assigned_by are required" },
      { status: 400 }
    );
  }

  const adminCheck = await checkAdmin(assigned_by);
  if (!adminCheck) {
    return NextResponse.json(
      { error: "Only admins can assign rooms" },
      { status: 403 }
    );
  }

  const supabase = await createClient();

  // Remove member from any other room for this event (one room per member)
  await supabase
    .from("room_assignments")
    .delete()
    .eq("event_date", event_date)
    .eq("member_id", member_id);

  // Assign to the new room
  const { data, error } = await supabase
    .from("room_assignments")
    .insert({ event_date, room_id, member_id, assigned_by })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE - Remove a room assignment
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const event_date = searchParams.get("event_date");
  const room_id = searchParams.get("room_id");
  const member_id = searchParams.get("member_id");
  const assigned_by = searchParams.get("assigned_by");

  if (!event_date || !assigned_by) {
    return NextResponse.json(
      { error: "event_date and assigned_by are required" },
      { status: 400 }
    );
  }

  const adminCheck = await checkAdmin(assigned_by);
  if (!adminCheck) {
    return NextResponse.json(
      { error: "Only admins can remove room assignments" },
      { status: 403 }
    );
  }

  const supabase = await createClient();

  // Delete specific member from room, or all members from room
  let query = supabase
    .from("room_assignments")
    .delete()
    .eq("event_date", event_date);

  if (room_id) query = query.eq("room_id", room_id);
  if (member_id) query = query.eq("member_id", member_id);

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
