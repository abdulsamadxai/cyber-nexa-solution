import type { NextFunction, Request, Response } from "express";
import { CSRF_COOKIE } from "../auth/session.js";
import { safeEqual } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";
import { env } from "../config/env.js";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export function allowedOrigins() {
  const list = [env.FRONTEND_URL, env.BACKEND_URL, ...(env.CORS_ORIGINS?.split(",") ?? [])];
  return list.map((o) => o.trim().replace(/\/$/, "")).filter(Boolean);
}

/**
 * CSRF protection for cookie-authenticated routes:
 *  1. Double-submit token: the `x-csrf-token` header must match the `as_csrf` cookie.
 *  2. Origin check: browsers always send Origin on cross-site POSTs; it must be ours.
 * Session cookies are also SameSite=Lax, which blocks most cross-site requests on its own.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (SAFE.has(req.method)) return next();

  const origin = req.get("origin");
  if (origin && !allowedOrigins().includes(origin.replace(/\/$/, ""))) {
    throw new AppError(403, "CSRF_FAILED", "Request origin is not allowed.");
  }
  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.get("x-csrf-token");
  if (!cookie || !header || !safeEqual(cookie, header)) {
    throw new AppError(403, "CSRF_FAILED", "Your session security token expired. Refresh the page and try again.");
  }
  next();
}
