"use client";

import { useEffect, useState } from "react";
import { Member } from "@/types";
import { useMember } from "@/hooks/useMember";
import { createClient } from "@/lib/supabase/client";
import { FaUser } from "react-icons/fa6";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// App header with title and current member display (no switch option)
export function Header() {
  const { memberId, isLoaded } = useMember();
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // Fetch current member details when memberId changes
  useEffect(() => {
    if (!memberId) {
      setCurrentMember(null);
      return;
    }

    async function fetchMember() {
      const supabase = createClient();
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .single();

      if (data) setCurrentMember(data);
    }
    fetchMember();
  }, [memberId]);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="flex items-center justify-between px-4 h-14">
        {/* App title with Shabbat candles icon */}
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Image src="/icons/logo-transparent.png" alt="" width={28} height={28} />
          מי בא שבת
        </h1>

        {/* Current member indicator + theme toggle */}
        <div className="flex items-center gap-2">
          {isLoaded && currentMember && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FaUser className="w-3.5 h-3.5" />
              <span>{currentMember.name}</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
