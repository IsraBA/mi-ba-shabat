"use client";

import { useState } from "react";
import { EventTask } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Modal, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface DeleteTaskDialogProps {
  task: EventTask;
  onClose: () => void;
  onDeleted: () => void;
}

// Modal for deleting a task with option to remove from all future events
export function DeleteTaskDialog({ task, onClose, onDeleted }: DeleteTaskDialogProps) {
  const [deleteFromAll, setDeleteFromAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle task deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    // If deleting from all future events, remove every instance from today onward
    // (covers events that were already generated before the template was deleted)
    if (deleteFromAll && task.template_id) {
      const today = new Date().toISOString().slice(0, 10);
      await supabase
        .from("event_tasks")
        .delete()
        .eq("template_id", task.template_id)
        .gte("event_date", today);
      await supabase.from("task_templates").delete().eq("id", task.template_id);
    } else {
      // Delete only this specific task instance
      await supabase.from("event_tasks").delete().eq("id", task.id);
    }

    onDeleted();
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <ModalTitle>מחיקת משימה</ModalTitle>

      <div className="space-y-4">
        <p className="text-sm">
          האם למחוק את המשימה <strong>&quot;{task.name}&quot;</strong>?
        </p>

        {/* Option to delete from all future events */}
        {task.template_id && (
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteFromAll}
              onChange={(e) => setDeleteFromAll(e.target.checked)}
              className="rounded mt-0.5"
            />
            <span className="text-sm">
              מחק גם מכל השבתות/חגים העתידיים (מחיקת התבנית)
            </span>
          </label>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            ביטול
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? "מוחק..." : "מחיקה"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
