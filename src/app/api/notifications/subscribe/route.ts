import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST - Save a push subscription for a member
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { member_id, subscription } = body;

  if (!member_id || !subscription) {
    return NextResponse.json(
      { error: "member_id and subscription are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Delete any existing subscription for this endpoint (prevent duplicates)
  const endpoint = subscription.endpoint;
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("member_id", member_id)
    .filter("subscription->>endpoint", "eq", endpoint);

  // Insert new subscription
  const { data, error } = await supabase
    .from("push_subscriptions")
    .insert({ member_id, subscription })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE - Remove a push subscription
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const member_id = searchParams.get("member_id");

  if (!member_id) {
    return NextResponse.json(
      { error: "member_id is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("member_id", member_id);

  return NextResponse.json({ success: true });
}
