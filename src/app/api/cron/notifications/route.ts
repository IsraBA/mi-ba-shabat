import { NextRequest, NextResponse } from "next/server";
import { HDate } from "@hebcal/core";
import { createClient } from "@/lib/supabase/server";
import { sendPushToMembers } from "@/lib/push";
import {
  registrationReminder,
  registrationReminderUrgent,
  fridaySummary,
  taskKing,
  birthdayEve,
} from "@/lib/notifications";
import { birthdayInYear } from "@/lib/birthdays";
import { Gender, type Birthday } from "@/types";

// Verify cron secret to prevent unauthorized calls
function verifyCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET) return true;
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

// GET - Handle scheduled notification cron jobs
// Query param ?type= determines which notification to send
export async function GET(request: NextRequest) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const supabase = await createClient();

  // Find the next upcoming event (Shabbat or holiday)
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Look for events in the next 7 days
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  // Get all members
  const { data: allMembers } = await supabase
    .from("members")
    .select("id, name, gender, always_attending");

  if (!allMembers) {
    return NextResponse.json({ error: "No members found" }, { status: 500 });
  }

  // Find registrations for upcoming events
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("member_id, event_date")
    .gte("event_date", todayStr)
    .lte("event_date", nextWeekStr);

  const registeredMemberIds = new Set(registrations?.map((r) => r.member_id) || []);

  // Determine event type (default to shabbat)
  const eventType: "shabbat" | "holiday" = "shabbat";

  switch (type) {
    // Tuesday 19:00 - Registration reminder
    case "registration_reminder": {
      const unregistered = allMembers.filter(
        (m) => !registeredMemberIds.has(m.id) && !m.always_attending
      );

      for (const member of unregistered) {
        const payload = registrationReminder(member.gender as Gender, eventType);
        payload.url = "/calendar";
        await sendPushToMembers([member.id], payload);
      }

      return NextResponse.json({ sent: unregistered.length, type });
    }

    // Thursday 19:00 - Urgent registration reminder
    case "registration_reminder_urgent": {
      const stillUnregistered = allMembers.filter(
        (m) => !registeredMemberIds.has(m.id) && !m.always_attending
      );

      for (const member of stillUnregistered) {
        const payload = registrationReminderUrgent(member.gender as Gender, eventType);
        payload.url = "/calendar";
        await sendPushToMembers([member.id], payload);
      }

      return NextResponse.json({ sent: stillUnregistered.length, type });
    }

    // Friday 10:00 - Summary for attendees
    case "friday_summary": {
      // Find the soonest upcoming event_date in the window
      const upcomingDate = registrations
        ?.map((r) => r.event_date)
        .sort()[0] || null;

      if (!upcomingDate) {
        return NextResponse.json({ sent: 0, message: "No upcoming event" });
      }

      // Count unclaimed tasks for that specific event
      const { count: unclaimedCount } = await supabase
        .from("event_tasks")
        .select("id", { count: "exact", head: true })
        .eq("event_date", upcomingDate)
        .is("claimed_by", null);

      if (!unclaimedCount || unclaimedCount === 0) {
        return NextResponse.json({ sent: 0, message: "All tasks claimed" });
      }

      // Only members registered for THIS specific event should receive the summary
      const attendeesForEvent = new Set(
        registrations
          ?.filter((r) => r.event_date === upcomingDate)
          .map((r) => r.member_id) || []
      );
      const attendeeIds = allMembers
        .filter((m) => attendeesForEvent.has(m.id))
        .map((m) => m.id);

      const payload = fridaySummary(unclaimedCount);
      payload.url = `/event/${upcomingDate}`;
      await sendPushToMembers(attendeeIds, payload);

      return NextResponse.json({ sent: attendeeIds.length, type });
    }

    // Sunday 10:00 - Task king
    case "task_king": {
      // Find the most recent past event
      const { data: recentTasks } = await supabase
        .from("event_tasks")
        .select("claimed_by, event_date")
        .lt("event_date", todayStr)
        .not("claimed_by", "is", null)
        .order("event_date", { ascending: false })
        .limit(100);

      if (!recentTasks || recentTasks.length === 0) {
        return NextResponse.json({ sent: 0, message: "No recent tasks" });
      }

      // Get the most recent event date
      const lastEventDate = recentTasks[0].event_date;
      const lastEventTasks = recentTasks.filter((t) => t.event_date === lastEventDate);

      // Count tasks per member
      const taskCounts = new Map<string, number>();
      for (const task of lastEventTasks) {
        const count = taskCounts.get(task.claimed_by!) || 0;
        taskCounts.set(task.claimed_by!, count + 1);
      }

      // Find the top member
      let topMemberId = "";
      let topCount = 0;
      for (const [mid, count] of taskCounts) {
        if (count > topCount) {
          topMemberId = mid;
          topCount = count;
        }
      }

      const topMember = allMembers.find((m) => m.id === topMemberId);
      if (!topMember) {
        return NextResponse.json({ sent: 0, message: "No top member found" });
      }

      const payload = taskKing(topMember.name, topMember.gender as Gender, eventType);
      const everyoneIds = allMembers.map((m) => m.id);
      await sendPushToMembers(everyoneIds, payload);

      return NextResponse.json({ sent: everyoneIds.length, type, topMember: topMember.name });
    }

    // Daily 20:15 IL — eve-of-birthday push to everyone for any matching birthday tomorrow
    case "birthday_eve": {
      // Tomorrow's Hebrew date (in Israel time) — birth-day match is computed per stored birthday
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowHd = new HDate(tomorrow);
      const tomorrowYear = tomorrowHd.getFullYear();

      const { data: birthdays } = await supabase
        .from("birthdays")
        .select("*");

      if (!birthdays || birthdays.length === 0) {
        return NextResponse.json({ sent: 0, message: "No birthdays" });
      }

      const matches = (birthdays as Birthday[]).filter((b) => {
        const occ = birthdayInYear(b, tomorrowYear);
        return occ.month === tomorrowHd.getMonth() && occ.day === tomorrowHd.getDate();
      });

      if (matches.length === 0) {
        return NextResponse.json({ sent: 0, message: "No matches tomorrow" });
      }

      const everyoneIds = allMembers.map((m) => m.id);
      let totalSent = 0;
      for (const b of matches) {
        const occ = birthdayInYear(b, tomorrowYear);
        const payload = birthdayEve(b.name, occ.age);
        const res = await sendPushToMembers(everyoneIds, payload);
        totalSent += res.sent;
      }

      return NextResponse.json({
        sent: totalSent,
        type,
        names: matches.map((b) => b.name),
      });
    }

    default:
      return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
  }
}
