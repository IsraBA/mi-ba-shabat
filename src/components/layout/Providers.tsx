"use client";

import { MemberProvider } from "@/hooks/useMember";
import { usePushSubscription } from "@/hooks/usePushSubscription";

// Inner component that uses hooks (must be inside MemberProvider)
function PushSubscriptionHandler() {
  usePushSubscription();
  return null;
}

// Client-side providers wrapper for the app
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MemberProvider>
      <PushSubscriptionHandler />
      {children}
    </MemberProvider>
  );
}
