export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: number;
  title: string;
  status: "pending" | "done";
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type TasksResponse = {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
};

export type TaskFilters = {
  page: number;
  limit: number;
  status?: "pending" | "done";
  search?: string;
};
