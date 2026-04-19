"use client";

import { useState, useCallback } from "react";
import { useMember } from "./useMember";

// Hook that provides a function to subscribe to push notifications
// Must be triggered by user interaction (button click), not automatically
export function usePushSubscription() {
  const { memberId } = useMember();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Subscribe to push — must be called from a user gesture (click)
  const subscribe = useCallback(async () => {
    if (!memberId || !isSupported) return false;
    setIsLoading(true);

    try {
      // Request permission (requires user gesture)
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setIsLoading(false);
        return false;
      }

      // Wait for the PWA service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription();

      // Create new subscription if needed
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ) as BufferSource,
        });
      }

      // Save to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          subscription: subscription.toJSON(),
        }),
      });

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setIsLoading(false);
      // If permission was granted but subscription failed, still dismiss banner
      if (Notification.permission === "granted") {
        setIsSubscribed(true);
        return true;
      }
      return false;
    }
  }, [memberId, isSupported]);

  return { subscribe, isSubscribed, isLoading, isSupported, permissionState };
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
