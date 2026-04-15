"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { EventTask, Member } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/hooks/useMember";
import { isPastDate } from "@/lib/hebcal";
import { TASK_CATEGORIES } from "@/lib/constants";
import { claimedLabel } from "@/lib/gender";
import { Gender } from "@/types";
import { Button } from "@/components/ui/button";
import { TaskIcon } from "@/components/tasks/TaskIcon";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
import { DeleteTaskDialog } from "@/components/tasks/DeleteTaskDialog";
import { FaUser, FaPlus, FaTrash } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface TasksTabProps {
  eventDate: string;
}

// Skeleton placeholder for loading state
function TasksSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="h-8 bg-muted rounded w-24 mb-2" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-14 bg-muted rounded-lg mb-2" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Tab showing tasks for this event grouped by category
export function TasksTab({ eventDate }: TasksTabProps) {
  const { memberId } = useMember();
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [members, setMembers] = useState<Map<string, Member>>(new Map());
  const [myGender, setMyGender] = useState<Gender>("plural");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingTask, setDeletingTask] = useState<EventTask | null>(null);
  const past = isPastDate(new Date(eventDate));
  const generatingRef = useRef(false);

  // Fetch tasks and members
  const fetchData = useCallback(async () => {
    const supabase = createClient();

    // Fetch tasks for this event
    const { data: taskData } = await supabase
      .from("event_tasks")
      .select("*")
      .eq("event_date", eventDate);

    // If no tasks exist and not already generating, generate from templates
    if ((!taskData || taskData.length === 0) && !generatingRef.current) {
      generatingRef.current = true;
      await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_date: eventDate }),
      });

      // Refetch after generation
      const { data: newData } = await supabase
        .from("event_tasks")
        .select("*")
        .eq("event_date", eventDate);

      if (newData) setTasks(newData);
      generatingRef.current = false;
    } else if (taskData) {
      setTasks(taskData);
    }

    // Fetch members for name display
    const { data: memberData } = await supabase
      .from("members")
      .select("*");

    if (memberData) {
      const map = new Map<string, Member>();
      memberData.forEach((m) => map.set(m.id, m));
      setMembers(map);

      // Set current user's gender for claim button text
      if (memberId) {
        const me = map.get(memberId);
        if (me) setMyGender(me.gender);
      }
    }

    setIsLoading(false);
  }, [eventDate]);

  useEffect(() => {
    fetchData();

    // Subscribe to real-time task changes
    const supabase = createClient();
    const channel = supabase
      .channel(`tasks:${eventDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_tasks",
          filter: `event_date=eq.${eventDate}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventDate, fetchData]);

  // Claim or unclaim a task
  const handleClaim = async (taskId: string, currentClaim: string | null) => {
    if (!memberId || past) return;

    const supabase = createClient();
    const newClaim = currentClaim === memberId ? null : memberId;

    await supabase
      .from("event_tasks")
      .update({ claimed_by: newClaim })
      .eq("id", taskId);
  };

  // Toggle task done status
  const handleDone = async (taskId: string, currentDone: boolean) => {
    if (past) return;

    const supabase = createClient();
    await supabase
      .from("event_tasks")
      .update({ is_done: !currentDone })
      .eq("id", taskId);
  };

  if (isLoading) {
    return <TasksSkeleton />;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Add task button */}
      {!past && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowAddDialog(true)}
        >
          <FaPlus className="w-3 h-3" />
          הוספת משימה
        </Button>
      )}

      {TASK_CATEGORIES.map((category) => {
        // Filter and sort tasks alphabetically for this category
        const categoryTasks = tasks
          .filter((t) => t.category === category.key)
          .sort((a, b) => a.name.localeCompare(b.name, "he"));

        if (categoryTasks.length === 0) return null;

        return (
          <div key={category.key}>
            {/* Category header */}
            <h3
              className={cn(
                "text-lg font-bold mb-2 px-3 py-1.5 rounded-lg",
                category.bgColor,
                category.color
              )}
            >
              {category.label}
            </h3>

            {/* Task list */}
            <div className="space-y-2">
              {categoryTasks.map((task) => {
                const claimedMember = task.claimed_by
                  ? members.get(task.claimed_by)
                  : null;
                const isMyTask = task.claimed_by === memberId;

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
                      task.is_done && "opacity-60",
                      task.color || "bg-background",
                      isMyTask && !task.is_done && "ring-1 ring-primary/30"
                    )}
                  >
                    {/* Done checkbox with animation */}
                    <button
                      onClick={() => handleDone(task.id, task.is_done)}
                      disabled={past}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                        task.is_done
                          ? "bg-green-500 border-green-500 text-white scale-110"
                          : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {task.is_done && (
                        <svg className="w-3 h-3 animate-in zoom-in-50 duration-200" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    {/* Task icon */}
                    {task.icon && (
                      <TaskIcon name={task.icon} className="w-5 h-5 shrink-0 text-muted-foreground" />
                    )}

                    {/* Task name with strikethrough animation */}
                    <div className="flex-1 text-sm">
                      <span className={cn(task.is_done && "task-done")}>
                        {task.name}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Claim button / claimed by display */}
                      {!past && (
                        <Button
                          variant={isMyTask ? "default" : claimedMember ? "secondary" : "outline"}
                          size="sm"
                          className={cn(
                            "text-xs transition-all duration-300",
                            !claimedMember && "hover:scale-105"
                          )}
                          onClick={() => handleClaim(task.id, task.claimed_by)}
                          disabled={!!claimedMember && !isMyTask}
                        >
                          {claimedMember ? (
                            <span className="flex items-center gap-1">
                              <FaUser className="w-3 h-3" />
                              {claimedMember.name}
                            </span>
                          ) : (
                            claimedLabel(myGender)
                          )}
                        </Button>
                      )}

                      {/* Delete button (only for future events) */}
                      {!past && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive px-1.5"
                          onClick={() => setDeletingTask(task)}
                        >
                          <FaTrash className="w-3 h-3" />
                        </Button>
                      )}

                      {/* Past events: show who claimed */}
                      {past && claimedMember && (
                        <span className="text-xs text-muted-foreground">
                          {claimedMember.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add task dialog */}
      {showAddDialog && (
        <AddTaskDialog
          eventDate={eventDate}
          onClose={() => setShowAddDialog(false)}
          onAdded={fetchData}
        />
      )}

      {/* Delete task dialog */}
      {deletingTask && (
        <DeleteTaskDialog
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onDeleted={fetchData}
        />
      )}
    </div>
  );
}
