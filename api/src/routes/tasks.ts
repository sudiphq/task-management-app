import { Router } from "express";
import { and, eq, ilike, count, desc } from "drizzle-orm";

import { db } from "../db";
import { tasks } from "../db/schema";
import { authMiddleware } from "../middlewares/auth";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../utils/validations";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const result = taskQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0]?.message,
    });
  }

  const { page, limit, status, search } = result.data;
  const offset = (page - 1) * limit;

  const conditions = [eq(tasks.userId, req.userId!)];

  if (status) {
    conditions.push(eq(tasks.status, status));
  }

  if (search) {
    conditions.push(ilike(tasks.title, `%${search}%`));
  }

  const whereClause = and(...conditions);

  const [taskList, [{ total }]] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tasks.createdAt)),
    db.select({ total: count() }).from(tasks).where(whereClause),
  ]);

  return res.json({
    tasks: taskList,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/", async (req, res) => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0]?.message,
    });
  }

  const { title } = result.data;

  const [newTask] = await db
    .insert(tasks)
    .values({ title, userId: req.userId! })
    .returning();

  return res.status(201).json(newTask);
});

router.get("/:id", async (req, res) => {
  const taskId = Number(req.params.id);

  if (isNaN(taskId)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, req.userId!)))
    .limit(1);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json(task);
});

router.patch("/:id", async (req, res) => {
  const taskId = Number(req.params.id);

  if (isNaN(taskId)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0]?.message,
    });
  }

  const updates = result.data;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const [updatedTask] = await db
    .update(tasks)
    .set(updates)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, req.userId!)))
    .returning();

  if (!updatedTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json(updatedTask);
});

router.delete("/:id", async (req, res) => {
  const taskId = Number(req.params.id);

  if (isNaN(taskId)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const [deletedTask] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, req.userId!)))
    .returning();

  if (!deletedTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json({ message: "Task deleted successfully" });
});

router.post("/:id/toggle", async (req, res) => {
  const taskId = Number(req.params.id);

  if (isNaN(taskId)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, req.userId!)))
    .limit(1);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const newStatus = task.status === "pending" ? "done" : "pending";

  const [updatedTask] = await db
    .update(tasks)
    .set({ status: newStatus })
    .where(eq(tasks.id, taskId))
    .returning();

  return res.json(updatedTask);
});

export default router;
