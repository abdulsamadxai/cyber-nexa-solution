import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, badRequest } from "../lib/errors.js";
import { burnPasswordCheck, hashPassword, isStrongPassword, passwordPolicy, randomToken, verifyPassword } from "../lib/crypto.js";
import { createSession, destroySession, revokeAllSessions, setCsrfCookie, CSRF_COOKIE } from "../auth/session.js";
import { consumeAuthToken, createAuthToken, peekAuthToken } from "../auth/tokens.js";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "../auth/permissions.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter, passwordResetLimiter } from "../middleware/rateLimit.js";
import { audit } from "../lib/audit.js";
import { notify } from "../lib/notify.js";
import { sendEmailVerification, sendPasswordReset, sendSecurityAlert } from "../email/service.js";
import { zs } from "../lib/validate.js";

export const authRouter = Router();

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

const password = z.string().refine(isStrongPassword, passwordPolicy);

function publicUser(u: { id: string; email: string; name: string; role: keyof typeof ROLE_PERMISSIONS; avatarUrl: string | null; emailVerifiedAt: Date | null; lastLoginAt: Date | null }) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    roleLabel: ROLE_LABELS[u.role],
    avatarUrl: u.avatarUrl,
    emailVerified: Boolean(u.emailVerifiedAt),
    lastLoginAt: u.lastLoginAt,
    permissions: ROLE_PERMISSIONS[u.role],
  };
}

/** Issues (or re-issues) the CSRF token. The SPA calls this once on load. */
authRouter.get("/csrf", (req, res) => {
  const token = req.cookies?.[CSRF_COOKIE] || randomToken(24);
  setCsrfCookie(res, token);
  res.json({ data: { csrfToken: token } });
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  const body = z.object({ email: zs.email, password: z.string().min(1).max(200) }).parse(req.body);
  const genericError = new AppError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || user.deletedAt || !user.passwordHash) {
    await burnPasswordCheck(body.password);
    throw genericError;
  }
  if (!user.isActive) throw new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled. Contact your administrator.");
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(423, "ACCOUNT_LOCKED", `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}, or reset your password.`);
  }

  const ok = await verifyPassword(user.passwordHash, body.password);
  if (!ok) {
    const failed = user.failedLoginCount + 1;
    const lock = failed >= MAX_FAILED;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null },
    });
    if (lock) {
      await notify("SECURITY", "Account locked", `${user.email} was locked for ${LOCK_MINUTES} minutes after ${MAX_FAILED} failed sign-in attempts.`, "/admin/users");
      await prisma.auditLog.create({ data: { userId: user.id, action: "auth.locked", resource: "user", resourceId: user.id, ip: req.ip } });
      void sendSecurityAlert({ to: user.email, name: user.name, message: `Your account was temporarily locked after ${MAX_FAILED} failed sign-in attempts.` });
    }
    throw genericError;
  }

  if (!user.emailVerifiedAt) {
    const token = await createAuthToken(user.id, "EMAIL_VERIFICATION", 24 * 3600_000);
    void sendEmailVerification({ to: user.email, name: user.name, token });
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Verify your email address first. We've sent you a new verification link.");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await createSession(req, res, user.id);
  req.user = { id: user.id, email: user.email, name: user.name, role: user.role, permissions: ROLE_PERMISSIONS[user.role] };
  await audit(req, "auth.login", "user", user.id);
  res.json({ data: publicUser(updated) });
});

authRouter.post("/logout", async (req, res) => {
  if (req.user) await audit(req, "auth.logout", "user", req.user.id);
  await destroySession(req, res);
  res.json({ data: { ok: true } });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  res.json({ data: publicUser(user) });
});

authRouter.patch("/profile", requireAuth, async (req, res) => {
  const body = z.object({ name: zs.name, avatarUrl: zs.optionalUrl }).partial().parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: body });
  await audit(req, "user.profile_updated", "user", user.id);
  res.json({ data: publicUser(user) });
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const body = z.object({ currentPassword: z.string().min(1), newPassword: password }).parse(req.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (!(await verifyPassword(user.passwordHash, body.currentPassword))) {
    throw badRequest("Your current password is incorrect.", { currentPassword: "Incorrect password" });
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } });
  await revokeAllSessions(user.id, req.sessionId);
  await audit(req, "auth.password_changed", "user", user.id);
  await notify("SECURITY", "Password changed", `${user.email} changed their password.`);
  res.json({ data: { ok: true } });
});

authRouter.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  const { email } = z.object({ email: zs.email }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.isActive && !user.deletedAt) {
    const token = await createAuthToken(user.id, "PASSWORD_RESET", 3600_000);
    await sendPasswordReset({ to: user.email, name: user.name, token });
    await prisma.auditLog.create({ data: { userId: user.id, action: "auth.password_reset_requested", resource: "user", resourceId: user.id, ip: req.ip } });
  }
  // Same response either way, so the endpoint can't be used to discover accounts.
  res.json({ data: { message: "If an account exists for that email, a reset link is on its way." } });
});

authRouter.post("/reset-password", passwordResetLimiter, async (req, res) => {
  const body = z.object({ token: z.string().min(10).max(200), password }).parse(req.body);
  const user = await consumeAuthToken(body.token, "PASSWORD_RESET");
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(body.password), failedLoginCount: 0, lockedUntil: null, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
  });
  await revokeAllSessions(user.id);
  await prisma.auditLog.create({ data: { userId: user.id, action: "auth.password_reset", resource: "user", resourceId: user.id, ip: req.ip } });
  await notify("SECURITY", "Password reset", `${user.email} reset their password using an emailed link.`);
  res.json({ data: { message: "Your password has been reset. You can now sign in." } });
});

authRouter.post("/verify-email", async (req, res) => {
  const { token } = z.object({ token: z.string().min(10).max(200) }).parse(req.body);
  const user = await consumeAuthToken(token, "EMAIL_VERIFICATION");
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  res.json({ data: { message: "Your email is verified. You can now sign in." } });
});

authRouter.get("/invite", async (req, res) => {
  const token = z.string().min(10).max(200).parse(req.query.token);
  const user = await peekAuthToken(token, "INVITE");
  if (!user) throw badRequest("This invitation is invalid or has expired. Ask an administrator to send a new one.");
  res.json({ data: { email: user.email, name: user.name, role: ROLE_LABELS[user.role] } });
});

authRouter.post("/accept-invite", async (req, res) => {
  const body = z.object({ token: z.string().min(10).max(200), name: zs.name, password }).parse(req.body);
  const user = await consumeAuthToken(body.token, "INVITE");
  await prisma.user.update({
    where: { id: user.id },
    data: { name: body.name, passwordHash: await hashPassword(body.password), emailVerifiedAt: new Date(), isActive: true },
  });
  await prisma.auditLog.create({ data: { userId: user.id, action: "auth.invite_accepted", resource: "user", resourceId: user.id, ip: req.ip } });
  res.json({ data: { message: "Your account is ready. Sign in with your new password." } });
});
