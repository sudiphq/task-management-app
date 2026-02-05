"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2, Plus } from "lucide-react";

import { useTasks } from "@/context/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateTaskForm() {
  const { createTask } = useTasks();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setIsSubmitting(true);
    try {
      await createTask(trimmedTitle);
      setTitle("");
      toast.success("Task created");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.error
          : "Failed to create task";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        className="flex-1"
      />
      <Button type="submit" disabled={isSubmitting || !title.trim()}>
        {isSubmitting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <>
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Add</span>
          </>
        )}
      </Button>
    </form>
  );
}
