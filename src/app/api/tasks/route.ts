import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH - Update a task (claim/unclaim, mark done)
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { task_id, ...updates } = body;

  if (!task_id) {
    return NextResponse.json(
      { error: "task_id is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_tasks")
    .update(updates)
    .eq("id", task_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Create a new task for a specific event
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_date, name, category, icon, color, is_recurring } = body;

  // Validate required fields
  if (!event_date || !name || !category) {
    return NextResponse.json(
      { error: "event_date, name, and category are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // If marked as recurring, also create a template
  let templateId = null;
  if (is_recurring) {
    const { data: template } = await supabase
      .from("task_templates")
      .insert({ name, category, icon, color, is_recurring: true })
      .select()
      .single();

    if (template) templateId = template.id;
  }

  // Create the task instance
  const { data, error } = await supabase
    .from("event_tasks")
    .insert({
      event_date,
      template_id: templateId,
      name,
      category,
      icon,
      color,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
