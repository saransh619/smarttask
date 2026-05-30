import type { Request, Response } from "express";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { ServerSuccess, TaskPriority, TaskStatus, UserRole } from "../utils/constants.js";
import { createPaginationMeta, getPagination } from "../utils/pagination.js";
import { serverResponse } from "../utils/serverResponse.js";

export async function getAdminStats(_req: Request, res: Response) {
  const [userCount, superAdminCount, taskStats] = await Promise.all([
    User.countDocuments({ role: UserRole.USER }),
    User.countDocuments({ role: UserRole.SUPER_ADMIN }),
    Task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          todoTasks: { $sum: { $cond: [{ $eq: ["$status", TaskStatus.TODO] }, 1, 0] } },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.IN_PROGRESS] }, 1, 0] },
          },
          doneTasks: { $sum: { $cond: [{ $eq: ["$status", TaskStatus.DONE] }, 1, 0] } },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ["$priority", TaskPriority.HIGH] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  serverResponse.success(res, ServerSuccess.ADMIN.STATS, {
    users: {
      total: userCount + superAdminCount,
      standardUsers: userCount,
      superAdmins: superAdminCount,
    },
    tasks:
      taskStats[0] ?? {
        totalTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        doneTasks: 0,
        highPriorityTasks: 0,
      },
  });
}

export async function listUsers(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req);
  const userFilter = { role: UserRole.USER };
  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(userFilter),
  ]);

  serverResponse.success(res, ServerSuccess.ADMIN.USERS_LISTED, {
    users,
    meta: createPaginationMeta(total, page, limit),
  });
}
