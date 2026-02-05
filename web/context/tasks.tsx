"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Task, TasksResponse, TaskFilters } from "@/lib/types";

type Pagination = {
  total: number;
  page: number;
  totalPages: number;
};

type TaskContextType = {
  tasks: Task[];
  isLoading: boolean;
  pagination: Pagination;
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  createTask: (title: string) => Promise<Task>;
  updateTask: (
    id: number,
    data: { title?: string; status?: "pending" | "done" },
  ) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<Task>;
};

const TaskContext = createContext<TaskContextType | null>(null);

type TaskProviderProps = {
  children: ReactNode;
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
};

const buildTasksQueryKey = (filters: TaskFilters) => [
  "tasks",
  filters.page,
  filters.limit,
  filters.status ?? "all",
  filters.search ?? "",
];

const matchesFilters = (task: Task, filters: TaskFilters) => {
  const matchesStatus = !filters.status || task.status === filters.status;
  const searchTerm = filters.search?.trim().toLowerCase();
  const matchesSearch =
    !searchTerm || task.title.toLowerCase().includes(searchTerm);
  return matchesStatus && matchesSearch;
};

export function TaskProvider({
  children,
  filters,
  setFilters,
}: TaskProviderProps) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => buildTasksQueryKey(filters), [filters]);

  const tasksQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(filters.page));
      params.set("limit", String(filters.limit));
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);

      const { data } = await api.get<TasksResponse>(
        `/tasks?${params.toString()}`,
      );
      return data;
    },
    placeholderData: (previous) => previous,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post<Task>("/tasks", { title });
      return data;
    },
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);

      if (!previous) {
        return { previous };
      }

      const now = new Date().toISOString();
      const optimisticTask: Task = {
        id: -Date.now(),
        title,
        status: "pending",
        userId: 0,
        createdAt: now,
        updatedAt: now,
      };

      if (!matchesFilters(optimisticTask, filters)) {
        return { previous };
      }

      const shouldInsert = filters.page === 1;
      const nextTasks = shouldInsert
        ? [optimisticTask, ...previous.tasks].slice(0, filters.limit)
        : previous.tasks;

      const newTotal = previous.total + 1;
      queryClient.setQueryData<TasksResponse>(queryKey, {
        ...previous,
        tasks: nextTasks,
        total: newTotal,
        totalPages: Math.max(1, Math.ceil(newTotal / filters.limit)),
      });

      return { previous, optimisticId: optimisticTask.id };
    },
    onSuccess: (task, _title, context) => {
      if (!context?.optimisticId) return;
      queryClient.setQueryData<TasksResponse>(queryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          tasks: current.tasks.map((item) =>
            item.id === context.optimisticId ? task : item,
          ),
        };
      });
    },
    onError: (_error, _title, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { title?: string; status?: "pending" | "done" };
    }) => {
      const { data: updated } = await api.patch<Task>(`/tasks/${id}`, data);
      return updated;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);

      if (!previous) {
        return { previous };
      }

      const existing = previous.tasks.find((task) => task.id === id);
      if (!existing) {
        return { previous };
      }

      const optimisticTask: Task = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const matches = matchesFilters(optimisticTask, filters);
      const nextTasks = matches
        ? previous.tasks.map((task) => (task.id === id ? optimisticTask : task))
        : previous.tasks.filter((task) => task.id !== id);

      const totalDelta = matches ? 0 : -1;
      const newTotal = Math.max(0, previous.total + totalDelta);

      queryClient.setQueryData<TasksResponse>(queryKey, {
        ...previous,
        tasks: nextTasks,
        total: newTotal,
        totalPages: Math.max(1, Math.ceil(newTotal / filters.limit)),
      });

      return { previous };
    },
    onSuccess: (task) => {
      queryClient.setQueryData<TasksResponse>(queryKey, (current) => {
        if (!current) return current;
        if (!matchesFilters(task, filters)) {
          return {
            ...current,
            tasks: current.tasks.filter((item) => item.id !== task.id),
          };
        }
        return {
          ...current,
          tasks: current.tasks.map((item) =>
            item.id === task.id ? task : item,
          ),
        };
      });
    },
    onError: (_error, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);

      if (!previous) {
        return { previous };
      }

      const wasInList = previous.tasks.some((task) => task.id === id);
      if (!wasInList) {
        return { previous };
      }

      const nextTasks = previous.tasks.filter((task) => task.id !== id);
      const newTotal = Math.max(0, previous.total - 1);

      queryClient.setQueryData<TasksResponse>(queryKey, {
        ...previous,
        tasks: nextTasks,
        total: newTotal,
        totalPages: Math.max(1, Math.ceil(newTotal / filters.limit)),
      });

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Task>(`/tasks/${id}/toggle`);
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TasksResponse>(queryKey);

      if (!previous) {
        return { previous };
      }

      const existing = previous.tasks.find((task) => task.id === id);
      if (!existing) {
        return { previous };
      }

      const optimisticTask: Task = {
        ...existing,
        status: existing.status === "pending" ? "done" : "pending",
        updatedAt: new Date().toISOString(),
      };

      const matches = matchesFilters(optimisticTask, filters);
      const nextTasks = matches
        ? previous.tasks.map((task) => (task.id === id ? optimisticTask : task))
        : previous.tasks.filter((task) => task.id !== id);

      const totalDelta = matches ? 0 : -1;
      const newTotal = Math.max(0, previous.total + totalDelta);

      queryClient.setQueryData<TasksResponse>(queryKey, {
        ...previous,
        tasks: nextTasks,
        total: newTotal,
        totalPages: Math.max(1, Math.ceil(newTotal / filters.limit)),
      });

      return { previous };
    },
    onSuccess: (task) => {
      queryClient.setQueryData<TasksResponse>(queryKey, (current) => {
        if (!current) return current;
        if (!matchesFilters(task, filters)) {
          return {
            ...current,
            tasks: current.tasks.filter((item) => item.id !== task.id),
          };
        }
        return {
          ...current,
          tasks: current.tasks.map((item) =>
            item.id === task.id ? task : item,
          ),
        };
      });
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const tasks = tasksQuery.data?.tasks ?? [];
  const pagination: Pagination = {
    total: tasksQuery.data?.total ?? 0,
    page: filters.page,
    totalPages: Math.max(1, tasksQuery.data?.totalPages ?? 1),
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading: tasksQuery.isLoading,
        pagination,
        filters,
        setFilters,
        createTask: (title) => createTaskMutation.mutateAsync(title),
        updateTask: (id, data) => updateTaskMutation.mutateAsync({ id, data }),
        deleteTask: (id) => deleteTaskMutation.mutateAsync(id),
        toggleTask: (id) => toggleTaskMutation.mutateAsync(id),
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
