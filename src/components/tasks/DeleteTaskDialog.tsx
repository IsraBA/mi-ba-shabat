"use client";

import { useState } from "react";
import { EventTask } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteTaskDialogProps {
  task: EventTask;
  onClose: () => void;
  onDeleted: () => void;
}

// Dialog for deleting a task with option to remove from all future events
export function DeleteTaskDialog({ task, onClose, onDeleted }: DeleteTaskDialogProps) {
  const [deleteFromAll, setDeleteFromAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle task deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    // Delete this specific task instance
    await supabase.from("event_tasks").delete().eq("id", task.id);

    // If user chose to delete from all future events, also delete the template
    if (deleteFromAll && task.template_id) {
      await supabase.from("task_templates").delete().eq("id", task.template_id);
    }

    onDeleted();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4" dir="rtl">
        <DialogHeader>
          <DialogTitle>מחיקת משימה</DialogTitle>
        </DialogHeader>

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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "מוחק..." : "מחיקה"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
