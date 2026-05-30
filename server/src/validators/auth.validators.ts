import { body } from "express-validator";
import { ServerErrors } from "../utils/constants.js";

export const registerRules = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage(ServerErrors.NAME.LENGTH),
  body("email").isEmail().normalizeEmail().withMessage(ServerErrors.EMAIL.REQUIRED),
  body("password")
    .isLength({ min: 8 })
    .withMessage(ServerErrors.PASSWORD.MIN_LENGTH),
];

export const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage(ServerErrors.EMAIL.REQUIRED),
  body("password").notEmpty().withMessage(ServerErrors.PASSWORD.REQUIRED),
];
