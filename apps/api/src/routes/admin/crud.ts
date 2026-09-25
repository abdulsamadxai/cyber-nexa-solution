import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../lib/errors.js";
import { pageMeta, paginate, paginationSchema, param, sortBy } from "../../lib/http.js";
import { audit } from "../../lib/audit.js";
import { slugify } from "../../lib/slug.js";
import { requirePermission } from "../../middleware/auth.js";
import type { Permission } from "../../auth/permissions.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Model = "service" | "solution" | "project" | "blogPost" | "blogCategory" | "blogTag" | "teamMember" | "testimonial" | "faq";

type AnyRecord = Record<string, any>;

export interface CrudConfig {
  /** Human-readable name used in errors and audit logs, e.g. "service" */
  resource: string;
  model: Model;
  schema: z.ZodObject<any>;
  searchFields: string[];
  sortable: readonly string[];
  defaultSort: string;
  defaultOrder?: "asc" | "desc";
  softDelete?: boolean;
  /** Field used to generate a slug when none is supplied */
  slugFrom?: string;
  include?: AnyRecord;
  listInclude?: AnyRecord;
  /** Extra list filters from query params */
  filters?: (query: AnyRecord) => AnyRecord;
  /** Transform validated input into Prisma data */
  toData?: (input: AnyRecord, ctx: { req: Request; isUpdate: boolean; id?: string }) => Promise<AnyRecord> | AnyRecord;
  permissions?: { read: Permission; write: Permission; delete: Permission };
}

const delegate = (model: Model) => (prisma as any)[model];

async function uniqueSlug(model: Model, base: string, excludeId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; i < 100; i++) {
    const found = await delegate(model).findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!found) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

export function crudRouter(cfg: CrudConfig) {
  const r = Router();
  const perms = cfg.permissions ?? { read: "content.read", write: "content.write", delete: "content.delete" };
  const d = delegate(cfg.model);
  const notDeleted = cfg.softDelete ? { deletedAt: null } : {};

  r.get("/", requirePermission(perms.read), async (req, res) => {
    const p = paginationSchema.parse(req.query);
    const where: AnyRecord = { ...notDeleted, ...(cfg.filters?.(req.query as AnyRecord) ?? {}) };
    if (p.q) where.OR = cfg.searchFields.map((f) => ({ [f]: { contains: p.q, mode: "insensitive" } }));
    if (req.query.published === "true" || req.query.published === "false") where.published = req.query.published === "true";
    const field = sortBy(p.sort, cfg.sortable, cfg.defaultSort);
    const order = p.sort ? p.order : (cfg.defaultOrder ?? p.order);
    const [items, total] = await Promise.all([
      d.findMany({ where, orderBy: { [field]: order }, include: cfg.listInclude, ...paginate(p) }),
      d.count({ where }),
    ]);
    res.json({ data: items, meta: pageMeta(p, total) });
  });

  r.get("/:id", requirePermission(perms.read), async (req, res) => {
    const item = await d.findFirst({ where: { id: param(req, "id"), ...notDeleted }, include: cfg.include });
    if (!item) throw notFound(cfg.resource);
    res.json({ data: item });
  });

  r.post("/", requirePermission(perms.write), async (req, res) => {
    const input = cfg.schema.parse(req.body) as AnyRecord;
    if (cfg.slugFrom && "slug" in cfg.schema.shape) {
      input.slug = input.slug ? input.slug : await uniqueSlug(cfg.model, String(input[cfg.slugFrom] ?? ""));
    }
    const data = cfg.toData ? await cfg.toData(input, { req, isUpdate: false }) : input;
    const item = await d.create({ data, include: cfg.include });
    await audit(req, `${cfg.resource}.created`, cfg.resource, item.id, { title: item.title ?? item.name ?? item.question });
    res.status(201).json({ data: item });
  });

  r.patch("/:id", requirePermission(perms.write), async (req, res) => {
    const id = param(req, "id");
    const existing = await d.findFirst({ where: { id, ...notDeleted }, select: { id: true } });
    if (!existing) throw notFound(cfg.resource);
    const input = cfg.schema.partial().parse(req.body) as AnyRecord;
    if (cfg.slugFrom && "slug" in input && !input.slug && input[cfg.slugFrom]) {
      input.slug = await uniqueSlug(cfg.model, String(input[cfg.slugFrom]), id);
    } else if ("slug" in input && !input.slug) delete input.slug;
    const data = cfg.toData ? await cfg.toData(input, { req, isUpdate: true, id }) : input;
    const item = await d.update({ where: { id }, data, include: cfg.include });
    const action = Object.keys(input).length === 1 && "published" in input ? (input.published ? "published" : "unpublished") : "updated";
    await audit(req, `${cfg.resource}.${action}`, cfg.resource, id, { fields: Object.keys(input) });
    res.json({ data: item });
  });

  r.delete("/:id", requirePermission(perms.delete), async (req, res) => {
    const id = param(req, "id");
    const existing = await d.findFirst({ where: { id, ...notDeleted } });
    if (!existing) throw notFound(cfg.resource);
    if (cfg.softDelete) {
      // Free the slug so it can be reused by a new record.
      const extra = "slug" in existing ? { slug: `${existing.slug}--deleted-${Date.now()}` } : {};
      await d.update({ where: { id }, data: { deletedAt: new Date(), ...extra, ...("published" in existing ? { published: false } : {}) } });
    } else {
      await d.delete({ where: { id } });
    }
    await audit(req, `${cfg.resource}.deleted`, cfg.resource, id, { title: existing.title ?? existing.name ?? existing.question });
    res.status(204).end();
  });

  return r;
}
