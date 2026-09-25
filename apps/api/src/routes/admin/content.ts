import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { badRequest } from "../../lib/errors.js";
import { zs } from "../../lib/validate.js";
import { readingMinutes, slugify } from "../../lib/slug.js";
import { crudRouter } from "./crud.js";

export const contentRouter = Router();

const seo = { seoTitle: zs.optionalText(70), seoDescription: zs.optionalText(170) };
const slugField = zs.slug.optional().or(z.literal(""));
const order = z.coerce.number().int().min(0).max(100000).default(0);
const icon = z.string().trim().regex(/^[A-Za-z0-9]+$/, "Pick an icon from the list").max(40);

contentRouter.use(
  "/services",
  crudRouter({
    resource: "service",
    model: "service",
    slugFrom: "title",
    softDelete: true,
    searchFields: ["title", "shortDescription"],
    sortable: ["order", "title", "updatedAt", "createdAt"],
    defaultSort: "order",
    defaultOrder: "asc",
    schema: z.object({
      title: z.string().trim().min(2).max(120),
      slug: slugField,
      icon: icon.default("Code2"),
      shortDescription: z.string().trim().min(10).max(300),
      description: z.string().trim().min(10).max(20000),
      features: zs.stringList,
      technologies: zs.stringList,
      ctaLabel: zs.optionalText(40),
      ctaUrl: zs.optionalUrl,
      order,
      published: z.boolean().default(true),
      ...seo,
    }),
  }),
);

contentRouter.use(
  "/solutions",
  crudRouter({
    resource: "solution",
    model: "solution",
    slugFrom: "title",
    softDelete: true,
    searchFields: ["title", "summary", "industry"],
    sortable: ["order", "title", "industry", "updatedAt"],
    defaultSort: "order",
    defaultOrder: "asc",
    schema: z.object({
      title: z.string().trim().min(2).max(120),
      slug: slugField,
      icon: icon.default("Boxes"),
      industry: z.string().trim().min(2).max(80),
      summary: z.string().trim().min(10).max(400),
      description: z.string().trim().min(10).max(20000),
      challenges: zs.stringList,
      features: zs.stringList,
      technologies: zs.stringList,
      order,
      published: z.boolean().default(true),
      ...seo,
    }),
  }),
);

contentRouter.use(
  "/projects",
  crudRouter({
    resource: "project",
    model: "project",
    slugFrom: "title",
    softDelete: true,
    searchFields: ["title", "summary", "category", "clientName"],
    sortable: ["order", "title", "date", "updatedAt", "category"],
    defaultSort: "updatedAt",
    include: { images: { orderBy: { order: "asc" } } },
    listInclude: { _count: { select: { images: true } } },
    filters: (q) => (q.category ? { category: String(q.category) } : {}),
    schema: z.object({
      title: z.string().trim().min(2).max(160),
      slug: slugField,
      category: z.string().trim().min(2).max(80),
      clientName: zs.optionalText(120),
      isSample: z.boolean().default(false),
      summary: z.string().trim().min(10).max(400),
      description: z.string().trim().min(10).max(20000),
      problem: z.string().trim().min(10).max(10000),
      solution: z.string().trim().min(10).max(10000),
      technologies: zs.stringList,
      features: zs.stringList,
      coverImage: zs.optionalUrl,
      projectUrl: zs.optionalUrl,
      githubUrl: zs.optionalUrl,
      date: z.coerce.date().optional().nullable(),
      featured: z.boolean().default(false),
      published: z.boolean().default(false),
      order,
      images: z.array(z.object({ url: z.string().trim().url().max(500), alt: zs.optionalText(200) })).max(30).optional(),
      ...seo,
    }),
    toData: (input, { isUpdate }) => {
      const { images, ...rest } = input;
      if (!images) return rest;
      const create = (images as { url: string; alt: string | null }[]).map((img, i) => ({ url: img.url, alt: img.alt, order: i }));
      return { ...rest, images: isUpdate ? { deleteMany: {}, create } : { create } };
    },
  }),
);

contentRouter.use(
  "/team",
  crudRouter({
    resource: "team member",
    model: "teamMember",
    softDelete: true,
    searchFields: ["name", "role"],
    sortable: ["order", "name", "updatedAt"],
    defaultSort: "order",
    defaultOrder: "asc",
    schema: z.object({
      name: zs.name,
      role: z.string().trim().min(2).max(120),
      bio: zs.optionalText(2000),
      photo: zs.optionalUrl,
      linkedin: zs.optionalUrl,
      github: zs.optionalUrl,
      email: zs.email.optional().nullable().or(z.literal("").transform(() => null)),
      order,
      published: z.boolean().default(false),
    }),
  }),
);

contentRouter.use(
  "/testimonials",
  crudRouter({
    resource: "testimonial",
    model: "testimonial",
    softDelete: true,
    searchFields: ["name", "company", "content"],
    sortable: ["order", "name", "createdAt"],
    defaultSort: "order",
    defaultOrder: "asc",
    schema: z.object({
      name: zs.name,
      company: zs.optionalText(120),
      role: zs.optionalText(120),
      photo: zs.optionalUrl,
      content: z.string().trim().min(10).max(2000),
      rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
      isSample: z.boolean().default(false),
      published: z.boolean().default(false),
      order,
    }),
  }),
);

contentRouter.use(
  "/faqs",
  crudRouter({
    resource: "faq",
    model: "faq",
    softDelete: true,
    searchFields: ["question", "answer", "category"],
    sortable: ["order", "category", "updatedAt"],
    defaultSort: "order",
    defaultOrder: "asc",
    schema: z.object({
      question: z.string().trim().min(5).max(300),
      answer: z.string().trim().min(5).max(5000),
      category: z.string().trim().min(2).max(60).default("General"),
      order,
      published: z.boolean().default(true),
    }),
  }),
);

contentRouter.use(
  "/blog/categories",
  crudRouter({
    resource: "blog category",
    model: "blogCategory",
    slugFrom: "name",
    searchFields: ["name"],
    sortable: ["name", "createdAt"],
    defaultSort: "name",
    defaultOrder: "asc",
    listInclude: { _count: { select: { posts: true } } },
    schema: z.object({ name: z.string().trim().min(2).max(80), slug: slugField, description: zs.optionalText(300) }),
  }),
);

contentRouter.use(
  "/blog/tags",
  crudRouter({
    resource: "blog tag",
    model: "blogTag",
    slugFrom: "name",
    searchFields: ["name"],
    sortable: ["name", "createdAt"],
    defaultSort: "name",
    defaultOrder: "asc",
    listInclude: { _count: { select: { posts: true } } },
    schema: z.object({ name: z.string().trim().min(1).max(60), slug: slugField }),
  }),
);

contentRouter.use(
  "/blog/posts",
  crudRouter({
    resource: "blog post",
    model: "blogPost",
    slugFrom: "title",
    softDelete: true,
    searchFields: ["title", "excerpt"],
    sortable: ["updatedAt", "publishedAt", "title", "views", "status"],
    defaultSort: "updatedAt",
    include: { tags: true, category: true },
    listInclude: { category: { select: { name: true } } },
    filters: (q) => ({
      ...(q.status && ["DRAFT", "PUBLISHED", "SCHEDULED"].includes(String(q.status)) ? { status: String(q.status) } : {}),
      ...(q.categoryId ? { categoryId: String(q.categoryId) } : {}),
    }),
    schema: z.object({
      title: z.string().trim().min(3).max(200),
      slug: slugField,
      excerpt: z.string().trim().min(10).max(500),
      content: z.string().trim().min(20).max(100000),
      featuredImage: zs.optionalUrl,
      status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
      publishedAt: z.coerce.date().optional().nullable(),
      authorName: zs.optionalText(120),
      categoryId: z.string().cuid().optional().nullable().or(z.literal("").transform(() => null)),
      tags: z.array(z.string().trim().min(1).max(60)).max(15).optional(),
      isSample: z.boolean().default(false),
      ...seo,
    }),
    toData: async (input, { req, isUpdate }) => {
      const { tags, ...rest } = input;
      const data: Record<string, unknown> = { ...rest };
      if (typeof rest.content === "string") data.readingMinutes = readingMinutes(rest.content);
      if (rest.status === "PUBLISHED" && !rest.publishedAt) data.publishedAt = new Date();
      if (rest.status === "SCHEDULED") {
        if (!rest.publishedAt || new Date(rest.publishedAt) <= new Date())
          throw badRequest("Choose a future date to schedule this article.", { publishedAt: "Pick a date and time in the future" });
      }
      if (!isUpdate) {
        data.authorId = req.user!.id;
        data.authorName = rest.authorName ?? req.user!.name;
      }
      if (tags) {
        const ops = (tags as string[])
          .map((name) => ({ name, slug: slugify(name) }))
          .filter((t) => t.slug)
          .map((t) => ({ where: { slug: t.slug }, create: t }));
        data.tags = isUpdate ? { set: [], connectOrCreate: ops } : { connectOrCreate: ops };
      }
      return data;
    },
  }),
);

/** Distinct values used for filter dropdowns in the admin. */
contentRouter.get("/meta/options", async (_req, res) => {
  const [projectCategories, industries, faqCategories] = await Promise.all([
    prisma.project.findMany({ where: { deletedAt: null }, distinct: ["category"], select: { category: true } }),
    prisma.solution.findMany({ where: { deletedAt: null }, distinct: ["industry"], select: { industry: true } }),
    prisma.faq.findMany({ where: { deletedAt: null }, distinct: ["category"], select: { category: true } }),
  ]);
  res.json({
    data: {
      projectCategories: projectCategories.map((x) => x.category),
      industries: industries.map((x) => x.industry),
      faqCategories: faqCategories.map((x) => x.category),
    },
  });
});
