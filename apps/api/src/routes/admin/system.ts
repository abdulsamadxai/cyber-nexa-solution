import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma, type Prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { badRequest, forbidden, notFound } from "../../lib/errors.js";
import { pageMeta, paginate, paginationSchema, param } from "../../lib/http.js";
import { audit } from "../../lib/audit.js";
import { zs } from "../../lib/validate.js";
import { getSettings, settingGroups, updateSettingGroup, type SettingGroup } from "../../lib/settings.js";
import { requirePermission } from "../../middleware/auth.js";
import { uploadLimiter } from "../../middleware/rateLimit.js";
import { storeUpload, removeStored } from "../../storage/index.js";
import { createAuthToken } from "../../auth/tokens.js";
import { revokeAllSessions } from "../../auth/session.js";
import { ROLE_LABELS } from "../../auth/permissions.js";
import { emailStatus, sendAdminInvitation, sendEmail } from "../../email/service.js";
import { templates } from "../../email/templates.js";
import { fillDays, sinceDays } from "./dashboard.js";

export const systemRouter = Router();

// ─────────────── Notifications ───────────────
systemRouter.get("/notifications", requirePermission("notifications.read"), async (req, res) => {
  const p = paginationSchema.parse(req.query);
  const where: Prisma.NotificationWhereInput = req.query.unread === "true" ? { readAt: null } : {};
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, ...paginate(p) }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { readAt: null } }),
  ]);
  res.json({ data: items, meta: { ...pageMeta(p, total), unread } });
});

systemRouter.get("/notifications/unread-count", requirePermission("notifications.read"), async (_req, res) => {
  res.json({ data: { unread: await prisma.notification.count({ where: { readAt: null } }) } });
});

systemRouter.post("/notifications/read-all", requirePermission("notifications.read"), async (_req, res) => {
  const r = await prisma.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  res.json({ data: { updated: r.count } });
});

systemRouter.patch("/notifications/:id", requirePermission("notifications.read"), async (req, res) => {
  const { read } = z.object({ read: z.boolean() }).parse(req.body);
  const n = await prisma.notification.update({ where: { id: param(req, "id") }, data: { readAt: read ? new Date() : null } });
  res.json({ data: n });
});

systemRouter.delete("/notifications/:id", requirePermission("notifications.read"), async (req, res) => {
  await prisma.notification.delete({ where: { id: param(req, "id") } });
  res.status(204).end();
});

// ─────────────── Media library ───────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 10 },
});

systemRouter.get("/media", requirePermission("media.read"), async (req, res) => {
  const p = paginationSchema.parse({ pageSize: 40, ...req.query });
  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
    ...(req.query.folder ? { folder: String(req.query.folder) } : {}),
    ...(req.query.type === "image" ? { mimeType: { startsWith: "image/" } } : req.query.type === "document" ? { mimeType: "application/pdf" } : {}),
    ...(p.q ? { OR: [{ originalName: { contains: p.q, mode: "insensitive" } }, { alt: { contains: p.q, mode: "insensitive" } }] } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, ...paginate(p), include: { uploadedBy: { select: { name: true } } } }),
    prisma.media.count({ where }),
  ]);
  res.json({ data: items, meta: { ...pageMeta(p, total), provider: env.STORAGE_PROVIDER, maxMb: env.UPLOAD_MAX_MB } });
});

systemRouter.post("/media", requirePermission("media.write"), uploadLimiter, upload.array("files", 10), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw badRequest("Choose at least one file to upload.");
  const folder = z.enum(["general", "projects", "blog", "team", "logos", "documents", "testimonials"]).catch("general").parse(req.body.folder);
  const created = [];
  for (const f of files) {
    const stored = await storeUpload(f.buffer, f.originalname, folder);
    created.push(
      await prisma.media.create({
        data: {
          filename: stored.filename,
          originalName: f.originalname.slice(0, 200),
          mimeType: stored.mimeType,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          url: stored.url,
          storageKey: stored.key,
          provider: stored.provider,
          folder,
          uploadedById: req.user!.id,
        },
      }),
    );
  }
  await audit(req, "media.uploaded", "media", created[0]?.id, { count: created.length });
  res.status(201).json({ data: created });
});

systemRouter.patch("/media/:id", requirePermission("media.write"), async (req, res) => {
  const body = z.object({ alt: zs.optionalText(200), folder: z.string().max(40).optional() }).parse(req.body);
  res.json({ data: await prisma.media.update({ where: { id: param(req, "id") }, data: body }) });
});

systemRouter.delete("/media/:id", requirePermission("media.delete"), async (req, res) => {
  const m = await prisma.media.findFirst({ where: { id: param(req, "id"), deletedAt: null } });
  if (!m) throw notFound("File");
  await removeStored(m.provider, m.storageKey).catch(() => {});
  await prisma.media.update({ where: { id: m.id }, data: { deletedAt: new Date() } });
  await audit(req, "media.deleted", "media", m.id, { name: m.originalName });
  res.status(204).end();
});

// ─────────────── Admin users ───────────────
const userSelect = { id: true, email: true, name: true, role: true, isActive: true, emailVerifiedAt: true, lastLoginAt: true, lockedUntil: true, createdAt: true, passwordHash: true } as const;
const shapeUser = ({ passwordHash, ...u }: { passwordHash: string | null } & Record<string, unknown>) => ({ ...u, invitePending: !passwordHash });

systemRouter.get("/users", requirePermission("users.read"), async (_req, res) => {
  const users = await prisma.user.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "asc" }, select: userSelect });
  res.json({ data: users.map(shapeUser), meta: { roles: ROLE_LABELS } });
});

/** Lightweight list for "assign to" dropdowns. */
systemRouter.get("/users/assignable", requirePermission("inquiries.read"), async (_req, res) => {
  res.json({ data: await prisma.user.findMany({ where: { deletedAt: null, isActive: true, passwordHash: { not: null } }, select: { id: true, name: true, role: true }, orderBy: { name: "asc" } }) });
});

const roleEnum = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "SALES"]);

systemRouter.post("/users/invite", requirePermission("users.write"), async (req, res) => {
  const body = z.object({ email: zs.email, name: zs.name, role: roleEnum }).parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing && !existing.deletedAt) throw badRequest("A user with that email already exists.", { email: "Already a user" });
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { ...body, deletedAt: null, isActive: true, passwordHash: null, emailVerifiedAt: null } })
    : await prisma.user.create({ data: { ...body } });
  const token = await createAuthToken(user.id, "INVITE", 72 * 3600_000);
  const sent = await sendAdminInvitation({ to: user.email, name: user.name, inviter: req.user!.name, role: ROLE_LABELS[user.role], token });
  await audit(req, "user.invited", "user", user.id, { email: user.email, role: user.role });
  res.status(201).json({
    data: {
      user: shapeUser(await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: userSelect })),
      emailSent: sent.ok,
      // When email isn't configured, return the link so an admin can share it securely by hand.
      inviteUrl: sent.ok ? undefined : `${env.FRONTEND_URL}/admin/accept-invite?token=${token}`,
    },
  });
});

async function assertNotLastSuperAdmin(userId: string) {
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (target?.role !== "SUPER_ADMIN") return;
  const count = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true, deletedAt: null } });
  if (count <= 1) throw badRequest("You can't remove the last active super admin.");
}

systemRouter.patch("/users/:id", requirePermission("users.write"), async (req, res) => {
  const id = param(req, "id");
  const body = z.object({ role: roleEnum, isActive: z.boolean(), name: zs.name, unlock: z.boolean() }).partial().parse(req.body);
  if (id === req.user!.id && (body.role || body.isActive === false)) throw forbidden("You can't change your own role or disable your own account.");
  if ((body.role && body.role !== "SUPER_ADMIN") || body.isActive === false) await assertNotLastSuperAdmin(id);
  const { unlock, ...data } = body;
  const user = await prisma.user.update({
    where: { id },
    data: { ...data, ...(unlock ? { lockedUntil: null, failedLoginCount: 0 } : {}) },
    select: userSelect,
  });
  if (body.isActive === false || body.role) await revokeAllSessions(id);
  await audit(req, "user.updated", "user", id, body);
  res.json({ data: shapeUser(user) });
});

systemRouter.post("/users/:id/resend-invite", requirePermission("users.write"), async (req, res) => {
  const user = await prisma.user.findFirst({ where: { id: param(req, "id"), deletedAt: null } });
  if (!user) throw notFound("User");
  if (user.passwordHash) throw badRequest("This user has already accepted their invitation.");
  const token = await createAuthToken(user.id, "INVITE", 72 * 3600_000);
  const sent = await sendAdminInvitation({ to: user.email, name: user.name, inviter: req.user!.name, role: ROLE_LABELS[user.role], token });
  res.json({ data: { emailSent: sent.ok, inviteUrl: sent.ok ? undefined : `${env.FRONTEND_URL}/admin/accept-invite?token=${token}` } });
});

systemRouter.delete("/users/:id", requirePermission("users.write"), async (req, res) => {
  const id = param(req, "id");
  if (id === req.user!.id) throw forbidden("You can't delete your own account.");
  await assertNotLastSuperAdmin(id);
  const u = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!u) throw notFound("User");
  await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false, email: `deleted-${Date.now()}-${u.email}`, passwordHash: null } });
  await revokeAllSessions(id);
  await audit(req, "user.deleted", "user", id, { email: u.email });
  res.status(204).end();
});

// ─────────────── Settings ───────────────
systemRouter.get("/settings", requirePermission("settings.read"), async (_req, res) => {
  res.json({
    data: await getSettings(),
    meta: { email: emailStatus(), storage: { provider: env.STORAGE_PROVIDER, maxMb: env.UPLOAD_MAX_MB }, turnstile: Boolean(env.TURNSTILE_SECRET_KEY) },
  });
});

systemRouter.put("/settings/:group", requirePermission("settings.write"), async (req, res) => {
  const group = param(req, "group") as SettingGroup;
  if (!settingGroups.includes(group)) throw notFound("Settings group");
  const value = await updateSettingGroup(group, req.body);
  await audit(req, "settings.updated", "settings", group);
  res.json({ data: value });
});

systemRouter.post("/settings/test-email", requirePermission("settings.write"), async (req, res) => {
  const s = await getSettings();
  const to = z.string().email().catch(req.user!.email).parse(req.body?.to);
  const r = await sendEmail(to, "securityAlert", {
    ...templates.securityAlert({ companyName: s.general.companyName, siteUrl: env.FRONTEND_URL }, { name: req.user!.name, message: "This is a test email from your admin settings. Email delivery is working." }),
    subject: "Test email from Cyber Nexa Solution admin",
  });
  res.json({ data: { ok: r.ok, provider: emailStatus().provider } });
});

// ─────────────── Analytics ───────────────
systemRouter.get("/analytics", requirePermission("analytics.read"), async (req, res) => {
  const days = z.coerce.number().int().refine((n) => [7, 30, 90].includes(n)).catch(30).parse(req.query.days);
  const since = sinceDays(days);
  const where = { createdAt: { gte: since } };
  const [views, uniques, topPages, sources, devices, totalViews, inquiriesByDay, contactCount, projectCount, topPosts] = await Promise.all([
    prisma.$queryRaw<{ d: Date; c: number }[]>`SELECT date_trunc('day', "createdAt") AS d, count(*)::int AS c FROM "PageView" WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<{ d: Date; c: number }[]>`SELECT date_trunc('day', "createdAt") AS d, count(DISTINCT "visitorHash")::int AS c FROM "PageView" WHERE "createdAt" >= ${since} GROUP BY 1 ORDER BY 1`,
    prisma.pageView.groupBy({ by: ["path"], where, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 10 }),
    prisma.pageView.groupBy({ by: ["source"], where, _count: { _all: true }, orderBy: { _count: { source: "desc" } }, take: 8 }),
    prisma.pageView.groupBy({ by: ["device"], where, _count: { _all: true } }),
    prisma.pageView.count({ where }),
    prisma.$queryRaw<{ d: Date; c: number }[]>`SELECT date_trunc('day', "createdAt") AS d, count(*)::int AS c FROM "Inquiry" WHERE "createdAt" >= ${since} AND "deletedAt" IS NULL GROUP BY 1 ORDER BY 1`,
    prisma.inquiry.count({ where: { ...where, type: "CONTACT", deletedAt: null } }),
    prisma.inquiry.count({ where: { ...where, type: "PROJECT", deletedAt: null } }),
    prisma.blogPost.findMany({ where: { deletedAt: null, views: { gt: 0 } }, orderBy: { views: "desc" }, take: 8, select: { title: true, slug: true, views: true } }),
  ]);
  const viewSeries = fillDays(views, days);
  const uniqueSeries = fillDays(uniques, days);
  const conv = fillDays(inquiriesByDay, days);
  const totalUniques = uniqueSeries.reduce((s, d) => s + d.count, 0);
  res.json({
    data: {
      days,
      totals: {
        views: totalViews,
        visitors: totalUniques,
        contactSubmissions: contactCount,
        projectInquiries: projectCount,
        conversionRate: totalUniques ? Math.round(((contactCount + projectCount) / totalUniques) * 1000) / 10 : 0,
      },
      series: viewSeries.map((v, i) => ({ date: v.date, views: v.count, visitors: uniqueSeries[i].count, inquiries: conv[i].count })),
      topPages: topPages.map((p) => ({ path: p.path, views: p._count._all })),
      sources: sources.map((s) => ({ name: s.source ?? "Direct", value: s._count._all })),
      devices: devices.map((d) => ({ name: d.device ?? "Unknown", value: d._count._all })),
      topPosts,
    },
  });
});

// ─────────────── Email log ───────────────
systemRouter.get("/emails", requirePermission("emails.read"), async (req, res) => {
  const p = paginationSchema.parse(req.query);
  const status = z.enum(["SENT", "FAILED", "SKIPPED"]).optional().catch(undefined).parse(req.query.status);
  const where: Prisma.EmailLogWhereInput = {
    ...(status ? { status } : {}),
    ...(p.q ? { OR: [{ to: { contains: p.q, mode: "insensitive" } }, { subject: { contains: p.q, mode: "insensitive" } }] } : {}),
  };
  const [items, total] = await Promise.all([prisma.emailLog.findMany({ where, orderBy: { createdAt: "desc" }, ...paginate(p) }), prisma.emailLog.count({ where })]);
  res.json({ data: items, meta: { ...pageMeta(p, total), status: emailStatus() } });
});

// ─────────────── Newsletter subscribers ───────────────
systemRouter.get("/subscribers", requirePermission("subscribers.read"), async (req, res) => {
  const p = paginationSchema.parse(req.query);
  const status = z.enum(["PENDING", "CONFIRMED", "UNSUBSCRIBED"]).optional().catch(undefined).parse(req.query.status);
  const where: Prisma.NewsletterSubscriberWhereInput = { ...(status ? { status } : {}), ...(p.q ? { email: { contains: p.q, mode: "insensitive" } } : {}) };
  const [items, total, counts] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where, orderBy: { createdAt: "desc" }, ...paginate(p), omit: { token: true } }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  res.json({ data: items, meta: { ...pageMeta(p, total), counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) } });
});

systemRouter.get("/subscribers/export", requirePermission("subscribers.read"), async (req, res) => {
  const status = z.enum(["PENDING", "CONFIRMED", "UNSUBSCRIBED"]).catch("CONFIRMED").parse(req.query.status ?? "CONFIRMED");
  const rows = await prisma.newsletterSubscriber.findMany({ where: { status }, orderBy: { createdAt: "asc" } });
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const unsub = (t: string) => `${env.FRONTEND_URL}/newsletter/unsubscribe?token=${t}`;
  const csv = ["email,status,source,subscribed_at,confirmed_at,unsubscribe_url", ...rows.map((r) => [r.email, r.status, r.source, r.createdAt.toISOString(), r.confirmedAt?.toISOString() ?? "", unsub(r.token)].map(q).join(","))].join("\n");
  await audit(req, "subscribers.exported", "newsletter", null, { status, count: rows.length });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="subscribers-${status.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

systemRouter.delete("/subscribers/:id", requirePermission("subscribers.write"), async (req, res) => {
  await prisma.newsletterSubscriber.delete({ where: { id: param(req, "id") } });
  await audit(req, "subscriber.deleted", "newsletter", param(req, "id"));
  res.status(204).end();
});

// ─────────────── Audit log ───────────────
systemRouter.get("/audit", requirePermission("audit.read"), async (req, res) => {
  const p = paginationSchema.parse(req.query);
  const where: Prisma.AuditLogWhereInput = {
    ...(req.query.resource ? { resource: String(req.query.resource) } : {}),
    ...(req.query.userId ? { userId: String(req.query.userId) } : {}),
    ...(p.q ? { action: { contains: p.q, mode: "insensitive" } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, ...paginate(p), include: { user: { select: { name: true, email: true } } } }),
    prisma.auditLog.count({ where }),
  ]);
  res.json({ data: items, meta: pageMeta(p, total) });
});
