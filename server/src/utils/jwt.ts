import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const fallbackExpiry = "7d";

import type { UserRole } from "./constants.js";

export function signAccessToken(userId: string, role: (typeof UserRole)[keyof typeof UserRole]) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? fallbackExpiry) as SignOptions["expiresIn"];

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId, role }, secret, {
    expiresIn,
  });
}

export function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, secret) as {
    userId: string;
    role: (typeof UserRole)[keyof typeof UserRole];
  };
}
