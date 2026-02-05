import { useTasks } from "@/context/tasks";
import { Skeleton } from "../ui/skeleton";
import { TaskItem } from "./task-item";

export function TaskList() {
  const { tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <div className="grid gap-2 lg:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed border-border py-12">
        <p className="text-sm text-muted-foreground">
          No tasks found. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 lg:grid-cols-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
