import { z } from "zod";

export const registerSchema = z.object({
  name: z.string({ error: "Name is required"}).min(2, "Name must be at least 2 characters"),
  email: z.string({ error: "Email is required"}).email("Invalid email address"),
  password: z.string({ error: "Password is required"}).min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string({ error: "Email is required"}).email("Invalid email address"),
  password: z.string({ error: "Password is required"}).min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const createTaskSchema = z.object({
  title: z.string({ message: "Title is required" }).min(1, "Title is required").max(255),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  status: z.enum(["pending", "done"]).optional(),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["pending", "done"]).optional(),
  search: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
