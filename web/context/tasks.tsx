"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
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
    data: { title?: string; status?: "pending" | "done" }
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

export function TaskProvider({
  children,
  filters,
  setFilters,
}: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    totalPages: 0,
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(filters.page));
      params.set("limit", String(filters.limit));
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);

      const { data } = await api.get<TasksResponse>(
        `/tasks?${params.toString()}`
      );
      setTasks(data.tasks);
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      });
    } catch {
      setTasks([]);
      setPagination({ total: 0, page: 1, totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (title: string): Promise<Task> => {
      const { data } = await api.post<Task>("/tasks", { title });
      setTasks((prev) => [data, ...prev]);
      setPagination((prev) => {
        const newTotal = prev.total + 1;
        return {
          ...prev,
          total: newTotal,
          totalPages: Math.ceil(newTotal / filters.limit),
        };
      });
      return data;
    },
    [filters.limit]
  );

  const updateTask = useCallback(
    async (
      id: number,
      updateData: { title?: string; status?: "pending" | "done" }
    ): Promise<Task> => {
      const { data } = await api.patch<Task>(`/tasks/${id}`, updateData);
      setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
      return data;
    },
    []
  );

  const deleteTask = useCallback(
    async (id: number): Promise<void> => {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setPagination((prev) => {
        const newTotal = prev.total - 1;
        const newTotalPages = Math.ceil(newTotal / filters.limit) || 1;
        return {
          ...prev,
          total: newTotal,
          totalPages: newTotalPages,
        };
      });
    },
    [filters.limit]
  );

  const toggleTask = useCallback(
    async (id: number): Promise<Task> => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                status: task.status === "pending" ? "done" : "pending",
              }
            : task
        )
      );

      try {
        const { data } = await api.post<Task>(`/tasks/${id}/toggle`);
        setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
        return data;
      } catch (error) {
        await fetchTasks();
        throw error;
      }
    },
    [fetchTasks]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        pagination,
        filters,
        setFilters,
        createTask,
        updateTask,
        deleteTask,
        toggleTask,
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
