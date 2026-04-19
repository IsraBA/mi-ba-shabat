import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { NotificationPayload } from "@/lib/notifications";

// Configure web-push (server-side only)
webpush.setVapidDetails(
  "mailto:noreply@mi-ba-shabat.vercel.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Send push notification to specific members (server-side helper)
export async function sendPushToMembers(memberIds: string[], payload: NotificationPayload) {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, subscription")
    .in("member_id", memberIds);

  if (!subscriptions || subscriptions.length === 0) return { sent: 0 };

  let sent = 0;
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
      if (statusCode === 410 || statusCode === 404) {
        staleIds.push(sub.id);
      }
    }
  }

  // Clean up stale subscriptions
  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return { sent };
}

// Send push notification to all members except the one who triggered it
export async function sendPushToAllExcept(excludeMemberId: string, payload: NotificationPayload) {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id")
    .neq("id", excludeMemberId);

  if (!members) return { sent: 0 };

  return sendPushToMembers(members.map((m) => m.id), payload);
}
