"use client";

import { useEffect, useState } from "react";
import { Member } from "@/types";
import { useMember } from "@/hooks/useMember";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Full-screen dialog for first-time member selection (cannot be dismissed)
export function MemberSelector() {
  const { memberId, setMemberId, isLoaded } = useMember();
  const [members, setMembers] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch members from Supabase
  useEffect(() => {
    async function fetchMembers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("members")
        .select("*")
        .order("display_order");

      if (data) setMembers(data);
    }
    fetchMembers();
  }, []);

  // Show dialog only if no member is selected (first visit)
  useEffect(() => {
    if (isLoaded && !memberId) {
      setIsOpen(true);
    }
  }, [isLoaded, memberId]);

  // Handle member selection
  const handleSelect = (id: string) => {
    setMemberId(id);
    setIsOpen(false);
  };

  // Cannot be dismissed without selecting a member
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm [&>button]:hidden" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            מי אתה/את?
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground mb-2">
          בחר/י את שמך כדי להתחיל
        </p>
        <div className="grid grid-cols-2 gap-2">
          {members.map((member) => (
            <Button
              key={member.id}
              variant="outline"
              className="h-12 text-base hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleSelect(member.id)}
            >
              {member.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
