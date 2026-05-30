import type { Response } from "express";
import { CookieNames } from "./constants.js";

const isProduction = process.env.NODE_ENV === "production";

export function setAuthCookie(res: Response, token: string) {
  res.cookie(CookieNames.TOKEN, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(CookieNames.TOKEN, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
}
