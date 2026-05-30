import { param } from "express-validator";
import { ServerErrors } from "../utils/constants.js";

export const userIdRule = [param("id").isMongoId().withMessage(ServerErrors.USER.INVALID_ID)];
