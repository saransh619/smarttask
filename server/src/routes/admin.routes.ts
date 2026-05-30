import { Router } from "express";
import { getAdminStats, listUsers } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { UserRole } from "../utils/constants.js";
import { handleValidation } from "../validators/handleValidation.js";
import { paginationRules } from "../validators/pagination.validators.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.SUPER_ADMIN));

router.get("/stats", asyncHandler(getAdminStats));
router.get("/users", paginationRules, handleValidation, asyncHandler(listUsers));

export default router;
