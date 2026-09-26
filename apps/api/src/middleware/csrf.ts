import type { NextFunction, Request, Response } from "express";
import { CSRF_COOKIE } from "../auth/session.js";
import { safeEqual } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";
import { env } from "../config/env.js";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export function allowedOrigins() {
  const list = [
    env.FRONTEND_URL,
    env.BACKEND_URL,
    ...(env.CORS_ORIGINS?.split(",") ?? []),
    "http://localhost:5173",
    "http://localhost:4000",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4000",
    "http://127.0.0.1:3000",
    "https://cybernexasolution.com",
    "https://www.cybernexasolution.com",
  ];
  return list.map((o) => o.trim().replace(/\/$/, "")).filter(Boolean);
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const clean = origin.trim().replace(/\/$/, "");
  if (allowedOrigins().includes(clean)) return true;
  if (/^https:\/\/.*\.vercel\.app$/.test(clean)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;
  return false;
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
  if (origin && !isOriginAllowed(origin)) {
    throw new AppError(403, "CSRF_FAILED", "Request origin is not allowed.");
  }
  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.get("x-csrf-token");
  if (!cookie || !header || !safeEqual(cookie, header)) {
    throw new AppError(403, "CSRF_FAILED", "Your session security token expired. Refresh the page and try again.");
  }
  next();
}
