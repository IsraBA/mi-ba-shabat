import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST - Register a member for an event
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { member_id, event_date } = body;

  // Validate required fields
  if (!member_id || !event_date) {
    return NextResponse.json(
      { error: "member_id and event_date are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Insert registration (upsert to prevent duplicates)
  const { data, error } = await supabase
    .from("event_registrations")
    .upsert({ member_id, event_date }, { onConflict: "member_id,event_date" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE - Unregister a member from an event
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const member_id = searchParams.get("member_id");
  const event_date = searchParams.get("event_date");

  // Validate required fields
  if (!member_id || !event_date) {
    return NextResponse.json(
      { error: "member_id and event_date are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Delete the registration
  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("member_id", member_id)
    .eq("event_date", event_date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
