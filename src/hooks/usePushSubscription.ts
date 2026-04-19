"use client";

import { useEffect, useRef } from "react";
import { useMember } from "./useMember";

// Hook that subscribes the current member to push notifications
export function usePushSubscription() {
  const { memberId, isLoaded } = useMember();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !memberId || subscribedRef.current) return;

    // Don't run in development (no service worker)
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function subscribe() {
      try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        // Check if already subscribed
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          // Send existing subscription to server (in case member changed)
          await saveSubscription(memberId!, existing);
          subscribedRef.current = true;
          return;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ) as BufferSource,
        });

        // Save subscription to server
        await saveSubscription(memberId!, subscription);
        subscribedRef.current = true;
      } catch (err) {
        console.error("Push subscription failed:", err);
      }
    }

    subscribe();
  }, [isLoaded, memberId]);
}

// Save subscription to the API
async function saveSubscription(memberId: string, subscription: PushSubscription) {
  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      member_id: memberId,
      subscription: subscription.toJSON(),
    }),
  });
}

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
