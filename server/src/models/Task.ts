import { Schema, model, type InferSchemaType } from "mongoose";
import { TaskPriority, TaskStatus } from "../utils/constants.js";

export const taskPriorities = Object.values(TaskPriority);
export const taskStatuses = Object.values(TaskStatus);

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: taskPriorities, default: TaskPriority.MEDIUM },
    status: { type: String, enum: taskStatuses, default: TaskStatus.TODO },
    tags: [{ type: String, trim: true, lowercase: true }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

taskSchema.index({ owner: 1, dueDate: 1, priority: 1, status: 1 });
taskSchema.index({ owner: 1, title: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema>;
export const Task = model("Task", taskSchema);
