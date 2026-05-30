import { Router } from "express";
import { login, logout, me, register, session } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import { loginRules, registerRules } from "../validators/auth.validators.js";
import { handleValidation } from "../validators/handleValidation.js";

const router = Router();

router.post("/register", authRateLimiter, registerRules, handleValidation, asyncHandler(register));
router.post("/login", authRateLimiter, loginRules, handleValidation, asyncHandler(login));
router.get("/session", asyncHandler(session));
router.get("/me", requireAuth, asyncHandler(me));
router.post("/logout", logout);

export default router;
