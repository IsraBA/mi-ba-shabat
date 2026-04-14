"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskIcon, AVAILABLE_ICONS } from "./TaskIcon";
import { TASK_CATEGORIES, TASK_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AddTaskDialogProps {
  eventDate: string;
  onClose: () => void;
  onAdded: () => void;
}

// Dialog for adding a new task to an event
export function AddTaskDialog({ eventDate, onClose, onAdded }: AddTaskDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("preparation");
  const [icon, setIcon] = useState("FaBroom");
  const [color, setColor] = useState("bg-blue-100");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit new task
  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_date: eventDate,
        name: name.trim(),
        category,
        icon,
        color,
        is_recurring: isRecurring,
      }),
    });

    onAdded();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת משימה חדשה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task name input */}
          <div>
            <label className="text-sm font-medium mb-1 block">שם המשימה</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="למשל: שטיפת רצפה"
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
              autoFocus
            />
          </div>

          {/* Category selector */}
          <div>
            <label className="text-sm font-medium mb-1 block">קטגוריה</label>
            <div className="flex gap-2">
              {TASK_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                    category === cat.key
                      ? `${cat.bgColor} ${cat.color} ${cat.borderColor}`
                      : "bg-muted border-transparent hover:border-border"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-sm font-medium mb-1 block">אייקון</label>
            <div className="grid grid-cols-7 gap-1.5">
              {AVAILABLE_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "p-2 rounded-md border flex items-center justify-center transition-colors",
                    icon === iconName
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <TaskIcon name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium mb-1 block">צבע</label>
            <div className="grid grid-cols-8 gap-2">
              {TASK_COLORS.map((c) => (
                <button
                  key={c.bg}
                  onClick={() => setColor(c.bg)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all border-2",
                    c.bg,
                    color === c.bg
                      ? `scale-110 ${c.border}`
                      : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Recurring toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">משימה קבועה (תחזור בכל שבת/חג)</span>
          </label>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "מוסיף..." : "הוספת משימה"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
