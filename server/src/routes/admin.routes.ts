import { Router } from "express";
import {
  deleteUser,
  getAdminStats,
  listUsers,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { UserRole } from "../utils/constants.js";
import { updateUserRoleRules, userIdRule } from "../validators/admin.validators.js";
import { handleValidation } from "../validators/handleValidation.js";
import { paginationRules } from "../validators/pagination.validators.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get("/stats", asyncHandler(getAdminStats));
router.get("/users", paginationRules, handleValidation, asyncHandler(listUsers));
router.patch(
  "/users/:id/role",
  requireRole(UserRole.SUPER_ADMIN),
  updateUserRoleRules,
  handleValidation,
  asyncHandler(updateUserRole),
);
router.delete(
  "/users/:id",
  requireRole(UserRole.SUPER_ADMIN),
  userIdRule,
  handleValidation,
  asyncHandler(deleteUser),
);

export default router;
