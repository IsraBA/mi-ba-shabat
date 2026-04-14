"use client";

import { useEffect, useState } from "react";
import { Member } from "@/types";
import { useMember } from "@/hooks/useMember";
import { createClient } from "@/lib/supabase/client";
import { FaUser } from "react-icons/fa6";
import { TbCandle } from "react-icons/tb";

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
        <h1 className="text-lg font-bold flex items-center gap-0.75">
          <span className="flex -space-x-3 mb-0.5">
              <TbCandle className="w-5 h-5 text-amber-500" />
              <TbCandle className="w-5 h-5 text-amber-500" />
            </span>
          מי בא שבת
        </h1>

        {/* Current member indicator (display only, no switch) */}
        {isLoaded && currentMember && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FaUser className="w-3.5 h-3.5" />
            <span>{currentMember.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
