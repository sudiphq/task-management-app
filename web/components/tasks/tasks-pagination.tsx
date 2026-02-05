import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useTasks } from "@/context/tasks";

export function TaskPagination() {
  const { pagination, setFilters, isLoading } = useTasks();

  const canGoPrev = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  function handlePrev() {
    if (canGoPrev) {
      setFilters({ page: pagination.page - 1 });
    }
  }

  function handleNext() {
    if (canGoNext) {
      setFilters({ page: pagination.page + 1 });
    }
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {pagination.total} {pagination.total === 1 ? "task" : "tasks"}
        <span className="hidden sm:inline">
          {" "}
          · Page {pagination.page} of {pagination.totalPages}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handlePrev}
          disabled={!canGoPrev || isLoading}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
