import { body, param } from "express-validator";
import { ServerErrors, UserRole } from "../utils/constants.js";

export const userIdRule = [param("id").isMongoId().withMessage(ServerErrors.USER.INVALID_ID)];

export const updateUserRoleRules = [
  ...userIdRule,
  body("role").isIn(Object.values(UserRole)),
];
