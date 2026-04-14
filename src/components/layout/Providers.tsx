"use client";

import { MemberProvider } from "@/hooks/useMember";

// Client-side providers wrapper for the app
export function Providers({ children }: { children: React.ReactNode }) {
  return <MemberProvider>{children}</MemberProvider>;
}
