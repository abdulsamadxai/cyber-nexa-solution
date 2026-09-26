import type { NextFunction, Request, Response } from "express";
import { getSessionUser, SESSION_COOKIE } from "../auth/session.js";
import { ROLE_PERMISSIONS, type Permission } from "../auth/permissions.js";
import { forbidden, unauthorized } from "../lib/errors.js";

/** Loads the signed-in user (if any) from the session cookie. */
export async function loadUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.["__Host-as_session"] || req.cookies?.["as_session"] || req.cookies?.[SESSION_COOKIE];
  const session = await getSessionUser(token);
  if (session) {
    const u = session.user;
    req.user = { id: u.id, email: u.email, name: u.name, role: u.role, permissions: ROLE_PERMISSIONS[u.role] };
    req.sessionId = session.id;
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw unauthorized();
  next();
}

export function requirePermission(...perms: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    const missing = perms.filter((p) => !req.user!.permissions.includes(p));
    if (missing.length) throw forbidden();
    next();
  };
}
