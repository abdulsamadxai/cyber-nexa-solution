import type { Request, Response, CookieOptions } from "express";
import { prisma } from "../lib/prisma.js";
import { env, isProd } from "../config/env.js";
import { randomToken, sha256 } from "../lib/crypto.js";
import { clientIp } from "../lib/http.js";

export const SESSION_COOKIE = isProd ? "__Host-as_session" : "as_session";
export const CSRF_COOKIE = "as_csrf";

export function isRequestSecure(req?: Request): boolean {
  if (!req) return isProd || env.COOKIE_SECURE;
  const proto = req.get("x-forwarded-proto");
  if (proto) return proto === "https";
  if (req.secure) return true;
  const host = req.get("host") || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return false;
  return isProd || env.COOKIE_SECURE;
}

function cookieBase(req?: Request): CookieOptions {
  const secure = isRequestSecure(req);
  return {
    secure,
    sameSite: secure ? env.COOKIE_SAMESITE : "lax",
    path: "/",
    // __Host- cookies must not set a Domain; only use COOKIE_DOMAIN outside that prefix.
    ...(env.COOKIE_DOMAIN && !SESSION_COOKIE.startsWith("__Host-") ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export async function createSession(req: Request, res: Response, userId: string) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 86_400_000);
  await prisma.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      expiresAt,
      ip: clientIp(req),
      userAgent: req.get("user-agent")?.slice(0, 300),
    },
  });
  const secure = isRequestSecure(req);
  const cookieName = secure ? "__Host-as_session" : "as_session";
  res.cookie(cookieName, token, { ...cookieBase(req), httpOnly: true, expires: expiresAt, secure });
}

export async function destroySession(req: Request, res: Response) {
  const token = req.cookies?.["__Host-as_session"] || req.cookies?.["as_session"] || req.cookies?.[SESSION_COOKIE];
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  res.clearCookie("__Host-as_session", { path: "/" });
  res.clearCookie("as_session", { path: "/" });
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date() || !session.user.isActive || session.user.deletedAt) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  // Refresh "last seen" at most once every 5 minutes to avoid a write per request.
  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60_000) {
    await prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  }
  return session;
}

export function setCsrfCookie(res: Response, token: string, req?: Request) {
  const secure = isRequestSecure(req);
  res.cookie(CSRF_COOKIE, token, { ...cookieBase(req), httpOnly: false, maxAge: 7 * 86_400_000, secure });
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  await prisma.session.deleteMany({ where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) } });
}
