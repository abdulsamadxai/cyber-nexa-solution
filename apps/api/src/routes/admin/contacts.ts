import { Router } from "express";
import { z } from "zod";
import { prisma, type Prisma } from "../../lib/prisma.js";
import { notFound } from "../../lib/errors.js";
import { pageMeta, paginate, paginationSchema, param, sortBy } from "../../lib/http.js";
import { audit } from "../../lib/audit.js";
import { zs } from "../../lib/validate.js";
import { requirePermission } from "../../middleware/auth.js";

export const contactsRouter = Router();

const contactSchema = z.object({
  name: zs.name,
  email: zs.email,
  phone: zs.phone,
  company: zs.optionalText(160),
  country: zs.optionalText(80),
  source: zs.optionalText(80),
  notes: zs.optionalText(10000),
});

contactsRouter.get("/", requirePermission("contacts.read"), async (req, res) => {
  const p = paginationSchema.parse(req.query);
  const f = z.object({ source: z.string().max(80).optional(), country: z.string().max(80).optional() }).parse(req.query);
  const where: Prisma.ContactWhereInput = {
    deletedAt: null,
    ...(f.source ? { source: f.source } : {}),
    ...(f.country ? { country: f.country } : {}),
    ...(p.q
      ? { OR: ["name", "email", "company", "phone"].map((k) => ({ [k]: { contains: p.q, mode: "insensitive" } })) }
      : {}),
  };
  const field = sortBy(p.sort, ["createdAt", "updatedAt", "name", "company"] as const, "createdAt");
  const [items, total, sources, countries] = await Promise.all([
    prisma.contact.findMany({ where, orderBy: { [field]: p.order }, ...paginate(p), include: { _count: { select: { inquiries: { where: { deletedAt: null } } } } } }),
    prisma.contact.count({ where }),
    prisma.contact.findMany({ where: { deletedAt: null, source: { not: null } }, distinct: ["source"], select: { source: true } }),
    prisma.contact.findMany({ where: { deletedAt: null, country: { not: null } }, distinct: ["country"], select: { country: true } }),
  ]);
  res.json({
    data: items,
    meta: { ...pageMeta(p, total), sources: sources.map((s) => s.source), countries: countries.map((c) => c.country) },
  });
});

contactsRouter.get("/:id", requirePermission("contacts.read"), async (req, res) => {
  const contact = await prisma.contact.findFirst({
    where: { id: param(req, "id"), deletedAt: null },
    include: {
      inquiries: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, select: { id: true, number: true, type: true, status: true, subject: true, projectType: true, createdAt: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { name: true } } } },
    },
  });
  if (!contact) throw notFound("Contact");
  res.json({ data: contact });
});

contactsRouter.post("/", requirePermission("contacts.write"), async (req, res) => {
  const body = contactSchema.parse(req.body);
  const contact = await prisma.contact.create({ data: { ...body, source: body.source ?? "Manual entry" } });
  await prisma.activity.create({ data: { type: "contact.created", message: "Contact created manually", contactId: contact.id, userId: req.user!.id } });
  await audit(req, "contact.created", "contact", contact.id);
  res.status(201).json({ data: contact });
});

contactsRouter.patch("/:id", requirePermission("contacts.write"), async (req, res) => {
  const id = param(req, "id");
  const body = contactSchema.partial().parse(req.body);
  const exists = await prisma.contact.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!exists) throw notFound("Contact");
  const contact = await prisma.contact.update({ where: { id }, data: body });
  await prisma.activity.create({ data: { type: "contact.updated", message: `Updated ${Object.keys(body).join(", ")}`, contactId: id, userId: req.user!.id } });
  await audit(req, "contact.updated", "contact", id, { fields: Object.keys(body) });
  res.json({ data: contact });
});

contactsRouter.delete("/:id", requirePermission("contacts.delete"), async (req, res) => {
  const id = param(req, "id");
  const c = await prisma.contact.findFirst({ where: { id, deletedAt: null } });
  if (!c) throw notFound("Contact");
  // Free the unique email so the person can contact us again later.
  await prisma.contact.update({ where: { id }, data: { deletedAt: new Date(), email: `deleted-${Date.now()}-${c.email}` } });
  await audit(req, "contact.deleted", "contact", id, { email: c.email });
  res.status(204).end();
});
