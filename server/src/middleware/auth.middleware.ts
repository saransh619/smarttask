import type { NextFunction, Request, Response } from "express";
import { CookieNames, ServerErrors, UserRole } from "../utils/constants.js";
import { serverResponse } from "../utils/serverResponse.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[CookieNames.TOKEN];

  if (!token) {
    serverResponse.unauthorized(res, ServerErrors.AUTH.REQUIRED);
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch {
    serverResponse.unauthorized(res, ServerErrors.AUTH.INVALID_OR_EXPIRED_SESSION);
  }
}

export function requireRole(...allowedRoles: Array<(typeof UserRole)[keyof typeof UserRole]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      serverResponse.forbidden(res, ServerErrors.AUTH.INSUFFICIENT_ROLE);
      return;
    }

    next();
  };
}
