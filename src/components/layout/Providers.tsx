"use client";

import { MemberProvider } from "@/hooks/useMember";
import { ThemeProvider } from "@/hooks/useTheme";

// Client-side providers wrapper for the app
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MemberProvider>{children}</MemberProvider>
    </ThemeProvider>
  );
}
