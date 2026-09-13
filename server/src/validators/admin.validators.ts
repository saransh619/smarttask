import { body, param } from "express-validator";
import { AssignableUserRoles, ServerErrors } from "../utils/constants.js";

export const userIdRule = [param("id").isMongoId().withMessage(ServerErrors.USER.INVALID_ID)];

export const updateUserRoleRules = [
  ...userIdRule,
  body("role").isIn(AssignableUserRoles),
];
