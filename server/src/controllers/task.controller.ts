import type { Request, Response } from "express";
import { Task } from "../models/Task.js";
import { filterWithHashMaps, searchTasks, sortTasks } from "../ds/taskAlgorithms.js";
import {
  ApiMeta,
  ServerErrors,
  ServerSuccess,
  SortBy,
  TaskStatus,
  UserRole,
} from "../utils/constants.js";
import { createPaginationMeta, getPagination } from "../utils/pagination.js";
import { serverResponse } from "../utils/serverResponse.js";

type SortByValue = (typeof SortBy)[keyof typeof SortBy];
type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus];

function ownerId(req: Request) {
  return req.userId;
}

function taskAccessFilter(req: Request): { owner?: string } {
  return req.role === UserRole.SUPER_ADMIN ? {} : { owner: ownerId(req) };
}

function normalizeTags(tags?: string[]) {
  return [...new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

function isOverdueTask(task: { dueDate: Date | string; status: string }) {
  const dueDate = new Date(task.dueDate);
  const today = new Date();

  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return task.status !== TaskStatus.DONE && dueDate < today;
}

export async function listTasks(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req);
  const tasks = await Task.find(taskAccessFilter(req)).lean();
  const filtered = filterWithHashMaps(tasks, {
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    priority: typeof req.query.priority === "string" ? req.query.priority : undefined,
    tag: typeof req.query.tag === "string" ? req.query.tag : undefined,
  });
  const searched = searchTasks(
    filtered,
    typeof req.query.search === "string" ? req.query.search : undefined,
  );
  const sorted = sortTasks(
    searched,
    typeof req.query.sortBy === "string" ? (req.query.sortBy as SortByValue) : SortBy.SMART,
    req.query.sortOrder === "desc" ? "desc" : "asc",
    req.query.algorithm === "quick" ? "quick" : "merge",
  );
  const stats = {
    todo: sorted.filter((task) => task.status === "Todo").length,
    inProgress: sorted.filter((task) => task.status === "In Progress").length,
    done: sorted.filter((task) => task.status === "Done").length,
    highPriority: sorted.filter((task) => task.priority === "High").length,
    overdue: sorted.filter(isOverdueTask).length,
  };
  const paginatedTasks = sorted.slice(skip, skip + limit);

  serverResponse.success(res, ServerSuccess.TASK.LISTED, {
    tasks: paginatedTasks,
    meta: {
      ...createPaginationMeta(sorted.length, page, limit),
      stats,
      algorithms: ApiMeta.DSA_ALGORITHMS,
    },
  });
}

export async function createTask(req: Request, res: Response) {
  const status = req.body.status ?? TaskStatus.TODO;
  const position = await Task.countDocuments({ owner: ownerId(req), status });
  const task = await Task.create({
    ...req.body,
    status,
    position,
    tags: normalizeTags(req.body.tags),
    owner: ownerId(req),
  });

  serverResponse.created(res, ServerSuccess.TASK.CREATED, { task });
}

export async function getTask(req: Request, res: Response) {
  const task = await Task.findOne({ _id: req.params.id, ...taskAccessFilter(req) });

  if (!task) {
    serverResponse.notFound(res, ServerErrors.TASK.NOT_FOUND);
    return;
  }

  serverResponse.success(res, ServerSuccess.TASK.FETCHED, { task });
}

export async function updateTask(req: Request, res: Response) {
  const payload = {
    ...req.body,
    ...(req.body.tags ? { tags: normalizeTags(req.body.tags) } : {}),
  };
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, ...taskAccessFilter(req) },
    payload,
    { new: true, runValidators: true },
  );

  if (!task) {
    serverResponse.notFound(res, ServerErrors.TASK.NOT_FOUND);
    return;
  }

  serverResponse.success(res, ServerSuccess.TASK.UPDATED, { task });
}

export async function reorderTask(req: Request, res: Response) {
  const task = await Task.findOne({ _id: req.params.id, ...taskAccessFilter(req) });

  if (!task) {
    serverResponse.notFound(res, ServerErrors.TASK.NOT_FOUND);
    return;
  }

  const nextStatus = req.body.status as TaskStatusValue;
  const beforeTaskId = typeof req.body.beforeTaskId === "string" ? req.body.beforeTaskId : null;
  const afterTaskId = typeof req.body.afterTaskId === "string" ? req.body.afterTaskId : null;
  const ownerFilter = req.role === UserRole.SUPER_ADMIN ? { owner: task.owner } : { owner: ownerId(req) };
  const columnTasks = await Task.find({
    ...ownerFilter,
    status: nextStatus,
    _id: { $ne: task._id },
  }).sort({ position: 1, createdAt: 1 });

  const taskIds = columnTasks.map((item) => item._id.toString());
  let insertIndex = columnTasks.length;

  if (beforeTaskId) {
    const beforeIndex = taskIds.indexOf(beforeTaskId);
    if (beforeIndex >= 0) {
      insertIndex = beforeIndex;
    }
  } else if (afterTaskId) {
    const afterIndex = taskIds.indexOf(afterTaskId);
    if (afterIndex >= 0) {
      insertIndex = afterIndex + 1;
    }
  }

  columnTasks.splice(insertIndex, 0, task);

  await Promise.all(
    columnTasks.map((item, index) => {
      const isMovedTask = item._id.toString() === task._id.toString();

      return Task.updateOne(
        { _id: item._id },
        {
          $set: {
            position: index,
            ...(isMovedTask ? { status: nextStatus } : {}),
          },
        },
      );
    }),
  );

  const updatedTask = await Task.findById(task._id);

  serverResponse.success(res, ServerSuccess.TASK.REORDERED, { task: updatedTask });
}

export async function deleteTask(req: Request, res: Response) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, ...taskAccessFilter(req) });

  if (!task) {
    serverResponse.notFound(res, ServerErrors.TASK.NOT_FOUND);
    return;
  }

  serverResponse.success(res, ServerSuccess.TASK.DELETED, { id: req.params.id });
}
