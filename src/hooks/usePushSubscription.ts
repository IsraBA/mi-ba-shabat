"use client";

import { useState, useCallback, useEffect } from "react";
import { useMember } from "./useMember";

// Hook that registers the service worker and provides push subscription
export function usePushSubscription() {
  const { memberId } = useMember();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swReady, setSwReady] = useState(false);

  // Check if push is supported
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // Check current permission state
  const permissionState =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default";

  // Register service worker on mount
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW registered:", reg.scope);
        setSwReady(true);

        // Check if already subscribed
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });
  }, [isSupported]);

  // Subscribe to push — must be called from a user gesture (click)
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!memberId || !isSupported || !swReady) {
      console.error("Cannot subscribe:", { memberId, isSupported, swReady });
      return false;
    }

    setIsLoading(true);

    try {
      // Step 1: Request permission (requires user gesture)
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);

      if (permission !== "granted") {
        setIsLoading(false);
        return false;
      }

      // Step 2: Get the active SW registration
      const registration = await navigator.serviceWorker.ready;

      // Step 3: Subscribe to push manager
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ) as BufferSource,
        });
      }

      console.log("Push subscription created:", subscription.endpoint);

      // Step 4: Save to server
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          subscription: subscription.toJSON(),
        }),
      });

      if (!res.ok) {
        console.error("Failed to save subscription:", res.status, await res.text());
      } else {
        console.log("Subscription saved to server");
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setIsLoading(false);

      // If permission was granted but something else failed, still mark as done
      if (Notification.permission === "granted") {
        setIsSubscribed(true);
        return true;
      }
      return false;
    }
  }, [memberId, isSupported, swReady]);

  return { subscribe, isSubscribed, isLoading, isSupported, permissionState };
}

// Convert VAPID key from base64url to Uint8Array
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
