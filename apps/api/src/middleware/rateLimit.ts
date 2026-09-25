import rateLimit, { type Options } from "express-rate-limit";
import { isTest } from "../config/env.js";

/**
 * In-memory rate limiting. For multiple API instances, plug in a shared store
 * such as `rate-limit-redis` (see README → Scaling).
 */
function limiter(windowMs: number, limit: number, message: string, extra: Partial<Options> = {}) {
  return rateLimit({
    windowMs,
    limit: isTest ? 10_000 : limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ error: { code: "RATE_LIMITED", message, requestId: req.requestId } });
    },
    ...extra,
  });
}

export const apiLimiter = limiter(60_000, 300, "Too many requests. Please slow down.");
export const formLimiter = limiter(15 * 60_000, 5, "You've sent several messages recently. Please wait a few minutes before trying again.");
export const newsletterLimiter = limiter(60 * 60_000, 5, "Too many subscription attempts. Please try again later.");
export const loginLimiter = limiter(15 * 60_000, 10, "Too many sign-in attempts. Please wait 15 minutes and try again.");
export const passwordResetLimiter = limiter(60 * 60_000, 5, "Too many password reset requests. Please try again later.");
export const trackLimiter = limiter(60_000, 60, "Too many requests.");
export const uploadLimiter = limiter(60_000, 30, "Too many uploads. Please wait a moment.");
