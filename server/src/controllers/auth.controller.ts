import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { CookieNames, ServerErrors, ServerSuccess } from "../utils/constants.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { signAccessToken, verifyAccessToken } from "../utils/jwt.js";
import { serverResponse } from "../utils/serverResponse.js";

function serializeUser(user: { _id: unknown; name: string; email: string; role: string }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    serverResponse.conflict(res, ServerErrors.USER.EXISTS);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });
  const token = signAccessToken(String(user._id), user.role);

  setAuthCookie(res, token);
  serverResponse.created(res, ServerSuccess.AUTH.REGISTERED, {
    user: serializeUser(user),
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    serverResponse.unauthorized(res, ServerErrors.AUTH.INVALID_CREDENTIALS);
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    serverResponse.unauthorized(res, ServerErrors.AUTH.INVALID_CREDENTIALS);
    return;
  }

  const token = signAccessToken(String(user._id), user.role);
  setAuthCookie(res, token);
  serverResponse.success(res, ServerSuccess.AUTH.LOGIN, {
    user: serializeUser(user),
  });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.userId);

  if (!user) {
    serverResponse.notFound(res, ServerErrors.USER.NOT_FOUND);
    return;
  }

  serverResponse.success(res, ServerSuccess.AUTH.ME, {
    user: serializeUser(user),
  });
}

export async function session(req: Request, res: Response) {
  res.set("Cache-Control", "no-store");
  const token = req.cookies?.[CookieNames.TOKEN];

  if (!token) {
    serverResponse.success(res, ServerSuccess.AUTH.SESSION, { user: null });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      clearAuthCookie(res);
      serverResponse.success(res, ServerSuccess.AUTH.SESSION, { user: null });
      return;
    }

    serverResponse.success(res, ServerSuccess.AUTH.SESSION, {
      user: serializeUser(user),
    });
  } catch {
    clearAuthCookie(res);
    serverResponse.success(res, ServerSuccess.AUTH.SESSION, { user: null });
  }
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  serverResponse.success(res, ServerSuccess.AUTH.LOGOUT);
}
