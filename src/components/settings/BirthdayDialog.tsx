"use client";

import { useState } from "react";
import { HDate } from "@hebcal/core";
import { Modal, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Birthday } from "@/types";

interface BirthdayDialogProps {
  birthday?: Birthday | null;
  onClose: () => void;
  onSaved: () => void;
}

// Convert a stored Hebrew birthday to its Gregorian birth date for the date input
function hebrewToGregInputValue(b: Birthday): string {
  const d = new HDate(b.hebrew_day, b.hebrew_month, b.hebrew_year).greg();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Add or edit a family member's Hebrew birthday. Input is Gregorian for simplicity;
// we convert via HDate so Adar I/II distinctions are captured automatically.
export function BirthdayDialog({ birthday, onClose, onSaved }: BirthdayDialogProps) {
  const [name, setName] = useState(birthday?.name ?? "");
  const [gregDate, setGregDate] = useState(
    birthday ? hebrewToGregInputValue(birthday) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live preview of the Hebrew date the chosen Greg date will resolve to
  const hebrewPreview = (() => {
    if (!gregDate) return null;
    const d = new Date(gregDate + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    return new HDate(d).renderGematriya();
  })();

  const handleSave = async () => {
    if (!name.trim() || !gregDate) return;
    const d = new Date(gregDate + "T00:00:00");
    if (isNaN(d.getTime())) return;

    setIsSubmitting(true);
    const hd = new HDate(d);
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      hebrew_year: hd.getFullYear(),
      hebrew_month: hd.getMonth(),
      hebrew_day: hd.getDate(),
    };

    if (birthday) {
      await supabase.from("birthdays").update(payload).eq("id", birthday.id);
    } else {
      await supabase.from("birthdays").insert(payload);
    }

    onSaved();
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <ModalTitle>{birthday ? "עריכת יום הולדת" : "הוספת יום הולדת"}</ModalTitle>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">שם</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם של בן משפחה"
            className="w-full h-10 px-3 rounded-md border bg-background text-sm"
            autoFocus
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">תאריך לידה (לועזי)</label>
          <input
            type="date"
            value={gregDate}
            onChange={(e) => setGregDate(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background text-sm"
          />
          {hebrewPreview && (
            <p className="text-xs text-muted-foreground mt-1">
              בעברית: {hebrewPreview}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !gregDate || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "שומר..." : "שמור"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
