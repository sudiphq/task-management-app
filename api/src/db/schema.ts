import {
  integer,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  ...timestamps,
});

export const userRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;

export const taskStatus = pgEnum("task_status", ["pending", "done"]);
export type TaskStatus = (typeof taskStatus.enumValues)[number];

export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  status: taskStatus("status").notNull().default("pending"),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  ...timestamps,
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users),
}));

export type TaskInsert = typeof tasks.$inferInsert;
export type TaskSelect = typeof tasks.$inferSelect;
