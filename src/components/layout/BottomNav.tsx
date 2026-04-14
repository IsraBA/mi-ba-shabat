"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCalendarAlt, FaHome } from "react-icons/fa";
import { cn } from "@/lib/utils";

// Navigation items configuration
const NAV_ITEMS = [
  { href: "/", label: "בית", icon: FaHome },
  { href: "/calendar", label: "לוח שנה", icon: FaCalendarAlt },
];

// Bottom navigation bar for mobile-first layout
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
