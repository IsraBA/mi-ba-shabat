import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST - Generate tasks for an event from recurring templates (idempotent)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_date } = body;

  if (!event_date) {
    return NextResponse.json(
      { error: "event_date is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check if tasks already exist for this date (prevent duplicates)
  const { count } = await supabase
    .from("event_tasks")
    .select("id", { count: "exact", head: true })
    .eq("event_date", event_date);

  if (count && count > 0) {
    return NextResponse.json({ message: "Tasks already exist", count });
  }

  // Fetch all recurring task templates
  const { data: templates } = await supabase
    .from("task_templates")
    .select("*")
    .eq("is_recurring", true)
    .order("display_order");

  if (!templates || templates.length === 0) {
    return NextResponse.json({ message: "No templates found" });
  }

  // Create task instances for this event date
  const tasks = templates.map((template) => ({
    event_date,
    template_id: template.id,
    name: template.name,
    category: template.category,
    icon: template.icon,
    color: template.color,
  }));

  const { error } = await supabase.from("event_tasks").insert(tasks);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-register always-attending members (e.g., parents) for this event
  const { data: alwaysMembers } = await supabase
    .from("members")
    .select("id")
    .eq("always_attending", true);

  if (alwaysMembers && alwaysMembers.length > 0) {
    const registrations = alwaysMembers.map((m) => ({
      member_id: m.id,
      event_date,
    }));

    await supabase
      .from("event_registrations")
      .upsert(registrations, { onConflict: "member_id,event_date" });
  }

  return NextResponse.json(
    { message: `Generated ${tasks.length} tasks` },
    { status: 201 }
  );
}
