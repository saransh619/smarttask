import { Router } from "express";
import { login, logout, me, register, session } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { loginRules, registerRules } from "../validators/auth.validators.js";
import { handleValidation } from "../validators/handleValidation.js";

const router = Router();

router.post("/register", registerRules, handleValidation, asyncHandler(register));
router.post("/login", loginRules, handleValidation, asyncHandler(login));
router.get("/session", asyncHandler(session));
router.get("/me", requireAuth, asyncHandler(me));
router.post("/logout", logout);

export default router;
