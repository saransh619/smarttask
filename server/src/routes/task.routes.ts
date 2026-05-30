import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { handleValidation } from "../validators/handleValidation.js";
import {
  createTaskRules,
  listTaskRules,
  taskIdRule,
  updateTaskRules,
} from "../validators/task.validators.js";

const router = Router();

router.use(requireAuth);

router.get("/", listTaskRules, handleValidation, asyncHandler(listTasks));
router.post("/", createTaskRules, handleValidation, asyncHandler(createTask));
router.get("/:id", taskIdRule, handleValidation, asyncHandler(getTask));
router.patch("/:id", updateTaskRules, handleValidation, asyncHandler(updateTask));
router.delete("/:id", taskIdRule, handleValidation, asyncHandler(deleteTask));

export default router;
