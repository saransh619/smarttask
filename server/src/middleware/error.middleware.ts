import type { NextFunction, Request, Response } from "express";
import { ServerErrors } from "../utils/constants.js";
import { serverResponse } from "../utils/serverResponse.js";

export function notFound(req: Request, res: Response, _next: NextFunction) {
  serverResponse.notFound(res, `${ServerErrors.ROUTE_NOT_FOUND}: ${req.originalUrl}`);
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(error);
  serverResponse.error(res, ServerErrors.INTERNAL_SERVER_ERROR);
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
