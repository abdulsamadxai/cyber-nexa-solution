import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requirePermission } from "../../middleware/auth.js";

export const dashboardRouter = Router();

export function fillDays(rows: { d: Date; c: number }[], days: number) {
  const map = new Map(rows.map((r) => [new Date(r.d).toISOString().slice(0, 10), Number(r.c)]));
  const out: { date: string; count: number }[] = [];
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export function sinceDays(days: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d;
}

dashboardRouter.get("/", requirePermission("dashboard.view"), async (req, res) => {
  const days = z.coerce.number().int().refine((n) => [7, 30, 90].includes(n)).catch(30).parse(req.query.days);
  const since = sinceDays(days);
  const perms = req.user!.permissions;
  const canLeads = perms.includes("inquiries.read");
  const canContent = perms.includes("content.read");
  const nd = { deletedAt: null };
  const livePost = { ...nd, status: { in: ["PUBLISHED", "SCHEDULED"] as ("PUBLISHED" | "SCHEDULED")[] }, publishedAt: { lte: new Date() } };

  const [
    totalInquiries, newInquiries, contactMessages, projectInquiries, contacts,
    publishedProjects, publishedPosts, services, solutions, unreadNotifications, subscribers,
  ] = await Promise.all([
    canLeads ? prisma.inquiry.count({ where: nd }) : 0,
    canLeads ? prisma.inquiry.count({ where: { ...nd, status: "NEW" } }) : 0,
    canLeads ? prisma.inquiry.count({ where: { ...nd, type: "CONTACT" } }) : 0,
    canLeads ? prisma.inquiry.count({ where: { ...nd, type: "PROJECT" } }) : 0,
    canLeads ? prisma.contact.count({ where: nd }) : 0,
    prisma.project.count({ where: { ...nd, published: true } }),
    prisma.blogPost.count({ where: livePost }),
    prisma.service.count({ where: { ...nd, published: true } }),
    prisma.solution.count({ where: { ...nd, published: true } }),
    prisma.notification.count({ where: { readAt: null } }),
    prisma.newsletterSubscriber.count({ where: { status: "CONFIRMED" } }),
  ]);

  const [overTime, byType, bySource, recentInquiries, recentActivity, topPosts, followUps] = await Promise.all([
    canLeads
      ? prisma.$queryRaw<{ d: Date; c: number }[]>`SELECT date_trunc('day', "createdAt") AS d, count(*)::int AS c FROM "Inquiry" WHERE "createdAt" >= ${since} AND "deletedAt" IS NULL GROUP BY 1 ORDER BY 1`
      : [],
    canLeads
      ? prisma.inquiry.groupBy({ by: ["projectType"], where: { ...nd, type: "PROJECT", createdAt: { gte: since } }, _count: { _all: true } })
      : [],
    canLeads ? prisma.inquiry.groupBy({ by: ["heardFrom"], where: { ...nd, createdAt: { gte: since } }, _count: { _all: true } }) : [],
    canLeads
      ? prisma.inquiry.findMany({
          where: nd,
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, number: true, type: true, name: true, company: true, projectType: true, subject: true, status: true, priority: true, createdAt: true },
        })
      : [],
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
    canContent
      ? prisma.blogPost.findMany({ where: livePost, orderBy: { views: "desc" }, take: 5, select: { id: true, title: true, slug: true, views: true } })
      : [],
    canLeads
      ? prisma.inquiry.findMany({
          where: { ...nd, followUpAt: { lte: new Date(Date.now() + 7 * 86400_000) }, status: { notIn: ["WON", "LOST", "ARCHIVED"] } },
          orderBy: { followUpAt: "asc" },
          take: 5,
          select: { id: true, number: true, name: true, followUpAt: true },
        })
      : [],
  ]);

  res.json({
    data: {
      days,
      stats: { totalInquiries, newInquiries, contactMessages, projectInquiries, contacts, publishedProjects, publishedPosts, services, solutions, unreadNotifications, subscribers },
      charts: {
        inquiriesOverTime: fillDays(overTime, days),
        projectTypes: byType.map((r) => ({ name: r.projectType ?? "Other", value: r._count._all })).sort((a, b) => b.value - a.value),
        leadSources: bySource.map((r) => ({ name: r.heardFrom ?? "Not specified", value: r._count._all })).sort((a, b) => b.value - a.value),
        topPosts,
      },
      recentInquiries,
      followUps,
      recentActivity: recentActivity.map((a) => ({ id: a.id, action: a.action, resource: a.resource, resourceId: a.resourceId, user: a.user?.name ?? "System", createdAt: a.createdAt })),
    },
  });
});
