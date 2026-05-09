"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ensureNavStack } from "@/lib/navStack";

// Runs once on first client mount to seed the back stack for deep-link entries,
// then (if entries were injected) listens for popstate to force Next.js to render
// the popped URL — its internal router state doesn't track our raw pushState entries,
// so without a nudge the URL changes but the page stays.
export function NavStackInit() {
  const router = useRouter();

  useEffect(() => {
    const injected = ensureNavStack();
    if (!injected) return;

    const onPopState = () => {
      router.replace(window.location.pathname + window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [router]);

  return null;
}
