import type { Request, Response } from "express";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { ServerErrors, ServerSuccess, TaskPriority, TaskStatus, UserRole } from "../utils/constants.js";
import { createPaginationMeta, getPagination } from "../utils/pagination.js";
import { serverResponse } from "../utils/serverResponse.js";

export async function getAdminStats(_req: Request, res: Response) {
  const [userCount, adminCount, superAdminCount, taskStats] = await Promise.all([
    User.countDocuments({ role: UserRole.USER }),
    User.countDocuments({ role: UserRole.ADMIN }),
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
      total: userCount + adminCount + superAdminCount,
      standardUsers: userCount,
      admins: adminCount,
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

const USER_SORT_FIELDS = new Set(["name", "email", "createdAt", "lastLogin"]);

export async function listUsers(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req);
  const search = (req.query.search as string)?.trim();
  const sortByParam = req.query.sortBy as string;
  const sortBy = USER_SORT_FIELDS.has(sortByParam) ? sortByParam : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const userFilter: Record<string, unknown> = { role: { $ne: UserRole.SUPER_ADMIN } };
  if (search) {
    userFilter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(userFilter)
      .select("name email role createdAt lastLogin")
      .sort({ [sortBy]: sortOrder })
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

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params;
  const { role } = req.body as { role: string };

  if (id === req.userId) {
    serverResponse.badRequest(res, ServerErrors.ADMIN.CANNOT_MODIFY_SELF);
    return;
  }

  const target = await User.findById(id).select("role");
  if (!target) {
    serverResponse.notFound(res, ServerErrors.USER.NOT_FOUND);
    return;
  }

  if (target.role === UserRole.SUPER_ADMIN) {
    serverResponse.badRequest(res, ServerErrors.ADMIN.CANNOT_MODIFY_SUPER_ADMIN);
    return;
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true },
  ).select("name email role createdAt lastLogin");

  serverResponse.success(res, ServerSuccess.ADMIN.USER_ROLE_UPDATED, { user });
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  if (id === req.userId) {
    serverResponse.badRequest(res, ServerErrors.ADMIN.CANNOT_MODIFY_SELF);
    return;
  }

  const target = await User.findById(id).select("role");
  if (!target) {
    serverResponse.notFound(res, ServerErrors.USER.NOT_FOUND);
    return;
  }

  if (target.role === UserRole.SUPER_ADMIN) {
    serverResponse.badRequest(res, ServerErrors.ADMIN.CANNOT_MODIFY_SUPER_ADMIN);
    return;
  }

  await User.findByIdAndDelete(id);
  await Task.deleteMany({ owner: id });

  serverResponse.success(res, ServerSuccess.ADMIN.USER_DELETED, { id });
}
