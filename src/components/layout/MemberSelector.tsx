"use client";

import { useEffect, useState } from "react";
import { Member } from "@/types";
import { useMember } from "@/hooks/useMember";
import { createClient } from "@/lib/supabase/client";
import { Modal, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

// Full-screen modal for first-time member selection (cannot be dismissed)
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

  // Show modal only if no member is selected (first visit)
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

  return (
    <Modal open={isOpen} dismissable={false}>
      <ModalTitle className="text-center text-xl">מי אתה/את?</ModalTitle>
      <p className="text-center text-sm text-muted-foreground mb-3">
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
    </Modal>
  );
}
