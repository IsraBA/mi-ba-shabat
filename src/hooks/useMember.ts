"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Member } from "@/types";
import React from "react";

const STORAGE_KEY = "member_id";

// Shared member context so all components react to identity changes
interface MemberContextType {
  memberId: string | null;
  setMemberId: (id: string | null) => void;
  isLoaded: boolean;
}

const MemberContext = createContext<MemberContextType>({
  memberId: null,
  setMemberId: () => {},
  isLoaded: false,
});

// Provider component — wrap the app with this
export function MemberProvider({ children }: { children: ReactNode }) {
  const [memberId, setMemberIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load member ID from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setMemberIdState(stored);
    setIsLoaded(true);
  }, []);

  // Save member ID to localStorage and state
  const setMemberId = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setMemberIdState(id);
  }, []);

  return React.createElement(
    MemberContext.Provider,
    { value: { memberId, setMemberId, isLoaded } },
    children
  );
}

// Hook to access member identity from any component
export function useMember() {
  return useContext(MemberContext);
}

// Check if a member is an admin
export function isAdmin(member: Member | null): boolean {
  return member?.is_admin ?? false;
}
