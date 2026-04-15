"use client";

import { useEffect, useState, useCallback } from "react";
import { FaXmark } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  dismissable?: boolean;
}

// Simple modal with backdrop blur, enter/exit animations, no library
export function Modal({ open, onClose, children, className, dismissable = true }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Handle open/close with animation (double rAF to ensure browser paints first)
  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    } else if (visible) {
      setAnimateIn(false);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  // Close on escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable && onClose) onClose();
    },
    [dismissable, onClose]
  );

  // Lock body scroll and listen for escape
  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with subtle blur */}
      <div
        className={cn(
          "absolute inset-0 bg-black/20 backdrop-blur-[4px] transition-opacity duration-200 ease-out",
          animateIn ? "opacity-100" : "opacity-0"
        )}
        onClick={dismissable ? onClose : undefined}
      />

      {/* Content card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-sm rounded-xl bg-popover p-5 shadow-xl ring-1 ring-foreground/10 transition-all duration-200 ease-out",
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-3",
          className
        )}
      >
        {/* X close button */}
        {dismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 inset-e-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}

// Modal title
export function ModalTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-base font-medium mb-3", className)}>
      {children}
    </h2>
  );
}
