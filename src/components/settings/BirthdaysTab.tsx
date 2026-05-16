"use client";

import { useEffect, useState } from "react";
import { HDate } from "@hebcal/core";
import { FaCakeCandles, FaPenToSquare, FaTrash, FaPlus } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Modal, ModalTitle } from "@/components/ui/modal";
import { BirthdayDialog } from "@/components/settings/BirthdayDialog";
import { birthdayInYear } from "@/lib/birthdays";
import type { Birthday } from "@/types";

// Render a stored Hebrew birthday as gematriya (e.g. "כ״ט בְּנִיסָן")
function renderHebrewDay(b: Birthday): string {
  return new HDate(b.hebrew_day, b.hebrew_month, b.hebrew_year).renderGematriya(false, true);
}

// Compute the person's current age — birthdays this year that have already passed
// raise the count, ones that haven't yet keep them at last year's age.
function currentAge(b: Birthday): number {
  const today = new HDate();
  const thisYear = today.getFullYear();
  const occ = birthdayInYear(b, thisYear);
  const thisYearBirthday = new HDate(occ.day, occ.month, thisYear);
  const passed = thisYearBirthday.abs() <= today.abs();
  return passed ? occ.age : occ.age - 1;
}

// Family birthdays admin: list, add, edit, delete. Open to all members.
export function BirthdaysTab() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Birthday | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Birthday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all birthdays from the DB
  const fetchBirthdays = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("birthdays")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    setBirthdays(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  // Delete the birthday currently flagged in `deleting` state (set by the trash button)
  const confirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    const supabase = createClient();
    await supabase.from("birthdays").delete().eq("id", deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    fetchBirthdays();
  };

  if (loading) {
    return <div className="py-6 text-center text-sm text-muted-foreground">טוען...</div>;
  }

  return (
    <div className="py-4 space-y-3">
      {birthdays.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          עדיין אין ימי הולדת. הוסף את הראשון!
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {birthdays.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-3 py-2.5">
              <FaCakeCandles className="w-4 h-4 text-pink-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{b.name}</div>
                <div className="text-xs text-muted-foreground">
                  {renderHebrewDay(b)} · גיל {currentAge(b)}
                </div>
              </div>
              <button
                onClick={() => setEditing(b)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                aria-label="ערוך"
              >
                <FaPenToSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleting(b)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded"
                aria-label="מחק"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={() => setEditing(null)} className="w-full gap-2">
        <FaPlus className="w-3.5 h-3.5" />
        הוספת יום הולדת
      </Button>

      {editing !== undefined && (
        <BirthdayDialog
          birthday={editing}
          onClose={() => setEditing(undefined)}
          onSaved={fetchBirthdays}
        />
      )}

      {deleting && (
        <Modal open onClose={() => setDeleting(null)}>
          <ModalTitle>מחיקת יום הולדת</ModalTitle>
          <div className="space-y-4">
            <p className="text-sm">
              האם למחוק את יום ההולדת של <strong>&quot;{deleting.name}&quot;</strong>?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleting(null)}
                className="flex-1"
              >
                ביטול
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? "מוחק..." : "מחיקה"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
