import rateLimit from "express-rate-limit";
import { ServerErrors } from "../utils/constants.js";
import { serverResponse } from "../utils/serverResponse.js";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    serverResponse.tooManyRequests(res, ServerErrors.TOO_MANY_REQUESTS);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    serverResponse.tooManyRequests(res, ServerErrors.TOO_MANY_REQUESTS);
  },
});
