import { Router } from "express";
import { z } from "zod";
import { prisma, type Prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { pageMeta, paginate, paginationSchema, param, sortBy } from "../../lib/http.js";
import { audit } from "../../lib/audit.js";
import { requirePermission } from "../../middleware/auth.js";
import { sendInquiryUpdate } from "../../email/service.js";
import { inquiryRef } from "../../email/templates.js";

export const inquiriesRouter = Router();

const STATUSES = ["NEW", "CONTACTED", "IN_DISCUSSION", "PROPOSAL", "WON", "LOST", "ARCHIVED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  NEW: "New", CONTACTED: "Contacted", IN_DISCUSSION: "In discussion", PROPOSAL: "Proposal", WON: "Won", LOST: "Lost", ARCHIVED: "Archived",
};

inquiriesRouter.get("/", requirePermission("inquiries.read"), async (req, res) => {
  const p = paginationSchema.parse(req.query);
  const f = z
    .object({
      status: z.enum(STATUSES).optional(),
      priority: z.enum(PRIORITIES).optional(),
      type: z.enum(["CONTACT", "PROJECT"]).optional(),
      assignedToId: z.string().max(40).optional(),
      projectType: z.string().max(60).optional(),
      includeArchived: z.enum(["true", "false"]).optional(),
    })
    .parse(req.query);

  const where: Prisma.InquiryWhereInput = {
    deletedAt: null,
    ...(f.status ? { status: f.status } : f.includeArchived === "true" ? {} : { status: { not: "ARCHIVED" } }),
    ...(f.priority ? { priority: f.priority } : {}),
    ...(f.type ? { type: f.type } : {}),
    ...(f.projectType ? { projectType: f.projectType } : {}),
    ...(f.assignedToId ? { assignedToId: f.assignedToId === "unassigned" ? null : f.assignedToId } : {}),
  };
  if (p.q) {
    const n = Number(p.q.replace(/^#?AS/i, ""));
    where.OR = [
      { name: { contains: p.q, mode: "insensitive" } },
      { email: { contains: p.q, mode: "insensitive" } },
      { company: { contains: p.q, mode: "insensitive" } },
      { subject: { contains: p.q, mode: "insensitive" } },
      ...(Number.isInteger(n) && n > 0 ? [{ number: n }] : []),
    ];
  }
  const field = sortBy(p.sort, ["createdAt", "updatedAt", "status", "priority", "name", "number", "followUpAt"] as const, "createdAt");
  const [items, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { [field]: p.order },
      ...paginate(p),
      select: {
        id: true, number: true, type: true, status: true, priority: true, name: true, email: true, company: true,
        projectType: true, subject: true, budget: true, followUpAt: true, createdAt: true,
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.inquiry.count({ where }),
  ]);
  res.json({ data: items, meta: pageMeta(p, total) });
});

inquiriesRouter.get("/:id", requirePermission("inquiries.read"), async (req, res) => {
  const inquiry = await prisma.inquiry.findFirst({
    where: { id: param(req, "id"), deletedAt: null },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      contact: { select: { id: true, name: true, email: true, company: true, _count: { select: { inquiries: true } } } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { id: true, name: true } } } },
      activities: { orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!inquiry) throw notFound("Inquiry");
  const { ipHash: _ip, ...safe } = inquiry;
  void _ip;
  res.json({ data: { ...safe, reference: inquiryRef(inquiry.number) } });
});

inquiriesRouter.patch("/:id", requirePermission("inquiries.write"), async (req, res) => {
  const id = param(req, "id");
  const body = z
    .object({
      status: z.enum(STATUSES),
      priority: z.enum(PRIORITIES),
      assignedToId: z.string().cuid().nullable(),
      followUpAt: z.coerce.date().nullable(),
    })
    .partial()
    .parse(req.body);

  const before = await prisma.inquiry.findFirst({ where: { id, deletedAt: null }, include: { assignedTo: { select: { name: true } } } });
  if (!before) throw notFound("Inquiry");

  let assigneeName: string | null = null;
  if (body.assignedToId) {
    const u = await prisma.user.findFirst({ where: { id: body.assignedToId, deletedAt: null, isActive: true }, select: { name: true } });
    if (!u) throw badRequest("That team member can't be assigned.", { assignedToId: "Choose an active team member" });
    assigneeName = u.name;
  }

  const activities: Prisma.ActivityCreateManyInput[] = [];
  const act = (type: string, message: string, meta?: object) =>
    activities.push({ type, message, meta, inquiryId: id, contactId: before.contactId, userId: req.user!.id });

  if (body.status && body.status !== before.status)
    act("inquiry.status", `Status changed from ${STATUS_LABEL[before.status]} to ${STATUS_LABEL[body.status]}`, { from: before.status, to: body.status });
  if (body.priority && body.priority !== before.priority)
    act("inquiry.priority", `Priority changed from ${before.priority.toLowerCase()} to ${body.priority.toLowerCase()}`);
  if (body.assignedToId !== undefined && body.assignedToId !== before.assignedToId)
    act("inquiry.assigned", body.assignedToId ? `Assigned to ${assigneeName}` : "Unassigned");
  if (body.followUpAt !== undefined && body.followUpAt?.getTime() !== before.followUpAt?.getTime())
    act("inquiry.follow_up", body.followUpAt ? `Follow-up set for ${body.followUpAt.toISOString().slice(0, 10)}` : "Follow-up date cleared");

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.inquiry.update({ where: { id }, data: body });
    if (activities.length) await tx.activity.createMany({ data: activities });
    return u;
  });
  if (activities.length) await audit(req, "inquiry.updated", "inquiry", id, { changes: body });
  res.json({ data: updated });
});

inquiriesRouter.post("/:id/notes", requirePermission("inquiries.write"), async (req, res) => {
  const id = param(req, "id");
  const { content } = z.object({ content: z.string().trim().min(1, "Write a note first").max(5000) }).parse(req.body);
  const inquiry = await prisma.inquiry.findFirst({ where: { id, deletedAt: null }, select: { contactId: true } });
  if (!inquiry) throw notFound("Inquiry");
  const note = await prisma.inquiryNote.create({ data: { inquiryId: id, content, authorId: req.user!.id }, include: { author: { select: { id: true, name: true } } } });
  await prisma.activity.create({ data: { type: "inquiry.note", message: "Added an internal note", inquiryId: id, contactId: inquiry.contactId, userId: req.user!.id } });
  res.status(201).json({ data: note });
});

inquiriesRouter.delete("/:id/notes/:noteId", requirePermission("inquiries.write"), async (req, res) => {
  const note = await prisma.inquiryNote.findFirst({ where: { id: param(req, "noteId"), inquiryId: param(req, "id") } });
  if (!note) throw notFound("Note");
  if (note.authorId !== req.user!.id && !req.user!.permissions.includes("inquiries.delete"))
    throw badRequest("You can only delete your own notes.");
  await prisma.inquiryNote.delete({ where: { id: note.id } });
  res.status(204).end();
});

/** Send an email to the customer from the inquiry screen; logged to the activity timeline. */
inquiriesRouter.post("/:id/email", requirePermission("inquiries.write"), async (req, res) => {
  const id = param(req, "id");
  const body = z
    .object({
      subject: z.string().trim().min(3).max(160),
      message: z.string().trim().min(5).max(10000),
      markContacted: z.boolean().default(true),
    })
    .parse(req.body);
  const inquiry = await prisma.inquiry.findFirst({ where: { id, deletedAt: null } });
  if (!inquiry) throw notFound("Inquiry");

  const result = await sendInquiryUpdate({ to: inquiry.email, name: inquiry.name, number: inquiry.number, subject: body.subject, message: body.message, senderName: req.user!.name });
  if (!result.ok) throw badRequest("The email couldn't be sent. Check the email settings or the Emails log for details.");

  await prisma.activity.create({
    data: { type: "inquiry.email", message: `Emailed customer: “${body.subject}”`, meta: { subject: body.subject, body: body.message }, inquiryId: id, contactId: inquiry.contactId, userId: req.user!.id },
  });
  if (body.markContacted && inquiry.status === "NEW") {
    await prisma.inquiry.update({ where: { id }, data: { status: "CONTACTED" } });
    await prisma.activity.create({ data: { type: "inquiry.status", message: "Status changed from New to Contacted", inquiryId: id, contactId: inquiry.contactId, userId: req.user!.id } });
  }
  await audit(req, "inquiry.emailed", "inquiry", id);
  res.json({ data: { ok: true } });
});

inquiriesRouter.delete("/:id", requirePermission("inquiries.delete"), async (req, res) => {
  const id = param(req, "id");
  const inquiry = await prisma.inquiry.findFirst({ where: { id, deletedAt: null } });
  if (!inquiry) throw notFound("Inquiry");
  await prisma.inquiry.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit(req, "inquiry.deleted", "inquiry", id, { reference: inquiryRef(inquiry.number) });
  res.status(204).end();
});

inquiriesRouter.get("/export/csv", requirePermission("inquiries.read"), async (req, res) => {
  const rows = await prisma.inquiry.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10000 });
  const cols = ["number", "type", "status", "priority", "name", "email", "phone", "company", "country", "projectType", "budget", "timeline", "heardFrom", "createdAt"] as const;
  const esc = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // spreadsheet formula injection guard
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(c === "number" ? inquiryRef(r.number) : r[c])).join(","))].join("\n");
  await audit(req, "inquiry.exported", "inquiry", null, { count: rows.length });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});
