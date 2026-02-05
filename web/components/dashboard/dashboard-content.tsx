"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";

import type { TaskFilters } from "@/lib/types";
import { useAuth } from "@/context/auth";
import { TaskProvider } from "@/context/tasks";
import { Button } from "@/components/ui/button";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskFilters as TaskFiltersComponent } from "@/components/tasks/task-filters";
import { DashboardPageSkeleton } from "@/components/dashboard/skeleton";
import { TaskList } from "@/components/tasks/tasks-list";
import { TaskPagination } from "@/components/tasks/tasks-pagination";

export function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, logout } = useAuth();

  const filters: TaskFilters = useMemo(
    () => ({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      status: (searchParams.get("status") as "pending" | "done") || undefined,
      search: searchParams.get("search") || undefined,
    }),
    [searchParams]
  );

  const setFilters = useCallback(
    (newFilters: Partial<TaskFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      const updatedFilters = {
        ...filters,
        ...newFilters,
        page: newFilters.page ?? 1,
      };

      if (updatedFilters.page > 1) {
        params.set("page", String(updatedFilters.page));
      } else {
        params.delete("page");
      }

      if (updatedFilters.limit !== 10) {
        params.set("limit", String(updatedFilters.limit));
      } else {
        params.delete("limit");
      }

      if (updatedFilters.status) {
        params.set("status", updatedFilters.status);
      } else {
        params.delete("status");
      }

      if (updatedFilters.search) {
        params.set("search", updatedFilters.search);
      } else {
        params.delete("search");
      }

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "/dashboard", {
        scroll: false,
      });
    },
    [searchParams, filters, router]
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isLoading || !user) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <h1 className="font-semibold text-sm">Task Manager</h1>
          <Button variant="ghost" size="xs" onClick={handleLogout}>
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <TaskProvider filters={filters} setFilters={setFilters}>
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                Welcome, {user?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your tasks and stay organized.
              </p>
            </div>

            <div className="space-y-3">
              <CreateTaskForm />
              <TaskFiltersComponent />
            </div>

            <div className="space-y-3">
              <TaskList />
              <TaskPagination />
            </div>
          </div>
        </TaskProvider>
      </main>
    </div>
  );
}
