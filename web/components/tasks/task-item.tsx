"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";

import type { Task } from "@/lib/types";
import { useTasks } from "@/context/tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, updateTask, deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDone = task.status === "done";

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  async function handleToggle() {
    try {
      await toggleTask(task.id);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error
          : "Failed to update task";
      toast.error(message);
    }
  }

  async function handleSaveEdit() {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || trimmedTitle === task.title) {
      setIsEditing(false);
      setEditTitle(task.title);
      return;
    }

    setIsUpdating(true);
    try {
      await updateTask(task.id, { title: trimmedTitle });
      setIsEditing(false);
      toast.success("Task updated");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error
          : "Failed to update task";
      toast.error(message);
      setEditTitle(task.title);
    } finally {
      setIsUpdating(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditTitle(task.title);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error
          : "Failed to delete task";
      toast.error(message);
      setIsDeleting(false);
    }
  }

  const isDisabled = isUpdating || isDeleting;

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-md border px-3 py-2 transition-all",
        isDone ? "border-border/50 bg-muted/30" : "border-border bg-background"
      )}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={handleToggle}
        disabled={isDisabled}
        className={cn(isDone && "opacity-50")}
      />

      {isEditing ? (
        <div className="flex flex-1 items-center gap-1.5">
          <Input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUpdating}
            className="flex-1 h-7 text-sm"
          />
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={handleSaveEdit}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={handleCancelEdit}
            disabled={isUpdating}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              "flex-1 text-sm transition-all",
              isDone &&
                "text-muted-foreground line-through decoration-muted-foreground/50"
            )}
          >
            {task.title}
          </span>

          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              disabled={isDisabled}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDisabled}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
