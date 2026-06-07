import { body, param, query } from "express-validator";
import { taskPriorities, taskStatuses } from "../models/Task.js";
import { ServerErrors, SortBy, SortingAlgorithm, SortOrder } from "../utils/constants.js";

function isTodayOrFutureDate(value: string) {
  const dueDate = new Date(value);
  const today = new Date();

  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return dueDate >= today;
}

export const taskIdRule = [param("id").isMongoId().withMessage(ServerErrors.TASK.INVALID_ID)];

export const createTaskRules = [
  body("title").trim().isLength({ min: 1, max: 120 }).withMessage(ServerErrors.TASK.TITLE_REQUIRED),
  body("description").optional().trim().isLength({ max: 1000 }),
  body("dueDate")
    .isISO8601()
    .withMessage(ServerErrors.TASK.DUE_DATE_REQUIRED)
    .custom(isTodayOrFutureDate)
    .withMessage(ServerErrors.TASK.DUE_DATE_PAST)
    .toDate(),
  body("priority").optional().isIn(taskPriorities),
  body("status").optional().isIn(taskStatuses),
  body("tags").optional().isArray(),
  body("tags.*").optional().trim().isLength({ min: 1, max: 32 }),
];

export const updateTaskRules = [
  ...taskIdRule,
  body("title").optional().trim().isLength({ min: 1, max: 120 }),
  body("description").optional().trim().isLength({ max: 1000 }),
  body("dueDate").optional().isISO8601().toDate(),
  body("priority").optional().isIn(taskPriorities),
  body("status").optional().isIn(taskStatuses),
  body("tags").optional().isArray(),
  body("tags.*").optional().trim().isLength({ min: 1, max: 32 }),
];

export const listTaskRules = [
  query("status").optional().isIn(taskStatuses),
  query("priority").optional().isIn(taskPriorities),
  query("tag").optional().trim().isLength({ min: 1 }),
  query("search").optional().trim(),
  query("sortBy").optional().isIn(Object.values(SortBy)),
  query("sortOrder").optional().isIn(Object.values(SortOrder)),
  query("algorithm").optional().isIn(Object.values(SortingAlgorithm)),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
];
