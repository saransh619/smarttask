import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ServerErrors } from "../utils/constants.js";
import { serverResponse } from "../utils/serverResponse.js";

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    serverResponse.badRequest(
      res,
      ServerErrors.VALIDATION_FAILED,
      errors.array().map((error) => ({
        field: error.type === "field" ? error.path : "request",
        message: error.msg,
      })),
    );
    return;
  }

  next();
}
