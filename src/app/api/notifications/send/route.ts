import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";
import { NotificationPayload } from "@/lib/notifications";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:noreply@mi-ba-shabat.vercel.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// POST - Send push notification to specified members
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { member_ids, payload }: { member_ids: string[]; payload: NotificationPayload } = body;

  if (!member_ids || !payload) {
    return NextResponse.json(
      { error: "member_ids and payload are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Fetch push subscriptions for the target members
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, member_id, subscription")
    .in("member_id", member_ids);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, message: "No subscriptions found" });
  }

  // Send push to each subscription
  let sent = 0;
  let failed = 0;
  const staleIds: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        sub.subscription as webpush.PushSubscription,
        JSON.stringify(payload)
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      // 410 Gone or 404 means subscription expired — remove it
      if (statusCode === 410 || statusCode === 404) {
        staleIds.push(sub.id);
      }
      failed++;
    }
  }

  // Clean up stale subscriptions
  if (staleIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", staleIds);
  }

  return NextResponse.json({ sent, failed, cleaned: staleIds.length });
}
