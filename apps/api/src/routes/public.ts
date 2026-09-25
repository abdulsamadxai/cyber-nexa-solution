import { Router, type Response } from "express";
import { z } from "zod";
import { prisma, type Prisma } from "../lib/prisma.js";
import { notFound } from "../lib/errors.js";
import { getPublicSettings } from "../lib/settings.js";
import { pageMeta, paginate, param } from "../lib/http.js";

export const publicRouter = Router();

const cache = (res: Response, seconds = 60) =>
  res.setHeader("Cache-Control", `public, max-age=${seconds}, stale-while-revalidate=${seconds * 5}`);

const live = { published: true, deletedAt: null } as const;
export const livePosts = (): Prisma.BlogPostWhereInput => ({
  deletedAt: null,
  status: { in: ["PUBLISHED", "SCHEDULED"] },
  publishedAt: { lte: new Date() },
});

publicRouter.get("/settings/public", async (_req, res) => {
  cache(res, 60);
  res.json({ data: await getPublicSettings() });
});

// ── Services ──
const serviceCard = { id: true, title: true, slug: true, icon: true, shortDescription: true, order: true } as const;

publicRouter.get("/services", async (_req, res) => {
  cache(res);
  res.json({ data: await prisma.service.findMany({ where: live, orderBy: [{ order: "asc" }, { title: "asc" }], select: serviceCard }) });
});

publicRouter.get("/services/:slug", async (req, res) => {
  const item = await prisma.service.findFirst({ where: { ...live, slug: param(req, "slug") } });
  if (!item) throw notFound("Service");
  const related = await prisma.service.findMany({ where: { ...live, id: { not: item.id } }, take: 3, orderBy: { order: "asc" }, select: serviceCard });
  cache(res);
  res.json({ data: { ...item, related } });
});

// ── Solutions & industries ──
const solutionCard = { id: true, title: true, slug: true, icon: true, industry: true, summary: true } as const;

publicRouter.get("/solutions", async (req, res) => {
  const industry = z.string().max(80).optional().parse(req.query.industry);
  cache(res);
  res.json({
    data: await prisma.solution.findMany({
      where: { ...live, ...(industry ? { industry } : {}) },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: solutionCard,
    }),
  });
});

publicRouter.get("/solutions/:slug", async (req, res) => {
  const item = await prisma.solution.findFirst({ where: { ...live, slug: param(req, "slug") } });
  if (!item) throw notFound("Solution");
  const related = await prisma.solution.findMany({ where: { ...live, id: { not: item.id } }, take: 3, orderBy: { order: "asc" }, select: solutionCard });
  cache(res);
  res.json({ data: { ...item, related } });
});

publicRouter.get("/industries", async (_req, res) => {
  const rows = await prisma.solution.findMany({ where: live, orderBy: [{ industry: "asc" }, { order: "asc" }], select: solutionCard });
  const groups = new Map<string, typeof rows>();
  for (const r of rows) groups.set(r.industry, [...(groups.get(r.industry) ?? []), r]);
  cache(res);
  res.json({ data: [...groups.entries()].map(([industry, solutions]) => ({ industry, solutions })) });
});

// ── Projects ──
const projectCard = { id: true, title: true, slug: true, category: true, clientName: true, isSample: true, summary: true, coverImage: true, technologies: true, date: true, featured: true } as const;

publicRouter.get("/projects", async (req, res) => {
  const q = z
    .object({ category: z.string().max(80).optional(), featured: z.coerce.boolean().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(50).default(12) })
    .parse(req.query);
  const where: Prisma.ProjectWhereInput = { ...live, ...(q.category ? { category: q.category } : {}), ...(q.featured ? { featured: true } : {}) };
  const [items, total, categories] = await Promise.all([
    prisma.project.findMany({ where, orderBy: [{ featured: "desc" }, { order: "asc" }, { date: "desc" }], select: projectCard, ...paginate({ ...q, order: "desc" }) }),
    prisma.project.count({ where }),
    prisma.project.findMany({ where: live, distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
  ]);
  cache(res);
  res.json({ data: items, meta: { ...pageMeta({ ...q, order: "desc" }, total), categories: categories.map((c) => c.category) } });
});

publicRouter.get("/projects/:slug", async (req, res) => {
  const item = await prisma.project.findFirst({ where: { ...live, slug: param(req, "slug") }, include: { images: { orderBy: { order: "asc" } } } });
  if (!item) throw notFound("Project");
  cache(res);
  res.json({ data: item });
});

// ── Blog ──
const postCard = {
  id: true, title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true, authorName: true, readingMinutes: true, isSample: true,
  category: { select: { name: true, slug: true } },
  tags: { select: { name: true, slug: true } },
} as const;

publicRouter.get("/blog/posts", async (req, res) => {
  const q = z
    .object({
      q: z.string().trim().max(120).optional(),
      category: z.string().max(96).optional(),
      tag: z.string().max(96).optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(30).default(9),
    })
    .parse(req.query);
  const where: Prisma.BlogPostWhereInput = {
    ...livePosts(),
    ...(q.category ? { category: { slug: q.category } } : {}),
    ...(q.tag ? { tags: { some: { slug: q.tag } } } : {}),
    ...(q.q
      ? { OR: [{ title: { contains: q.q, mode: "insensitive" } }, { excerpt: { contains: q.q, mode: "insensitive" } }, { content: { contains: q.q, mode: "insensitive" } }] }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { publishedAt: "desc" }, select: postCard, ...paginate({ ...q, order: "desc" }) }),
    prisma.blogPost.count({ where }),
  ]);
  cache(res, 30);
  res.json({ data: items, meta: pageMeta({ ...q, order: "desc" }, total) });
});

publicRouter.get("/blog/posts/:slug", async (req, res) => {
  const post = await prisma.blogPost.findFirst({
    where: { ...livePosts(), slug: param(req, "slug") },
    select: { ...postCard, content: true, seoTitle: true, seoDescription: true, updatedAt: true, categoryId: true },
  });
  if (!post) throw notFound("Article");
  const related = await prisma.blogPost.findMany({
    where: { ...livePosts(), id: { not: post.id }, ...(post.categoryId ? { categoryId: post.categoryId } : {}) },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: postCard,
  });
  cache(res, 30);
  res.json({ data: { ...post, related } });
});

/** Counts a blog view; called once per page load by the article page. */
publicRouter.post("/blog/posts/:slug/view", async (req, res) => {
  await prisma.blogPost.updateMany({ where: { ...livePosts(), slug: param(req, "slug") }, data: { views: { increment: 1 } } });
  res.status(204).end();
});

publicRouter.get("/blog/categories", async (_req, res) => {
  const cats = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true, _count: { select: { posts: { where: livePosts() } } } },
  });
  cache(res);
  res.json({ data: cats.filter((c) => c._count.posts > 0).map(({ _count, ...c }) => ({ ...c, postCount: _count.posts })) });
});

// ── Team, testimonials, FAQ ──
publicRouter.get("/team", async (_req, res) => {
  cache(res);
  res.json({
    data: await prisma.teamMember.findMany({
      where: live,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, role: true, bio: true, photo: true, linkedin: true, github: true, email: true },
    }),
  });
});

publicRouter.get("/testimonials", async (_req, res) => {
  cache(res);
  res.json({
    data: await prisma.testimonial.findMany({
      where: live,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: { id: true, name: true, company: true, role: true, photo: true, content: true, rating: true, isSample: true },
    }),
  });
});

publicRouter.get("/faqs", async (_req, res) => {
  cache(res);
  res.json({
    data: await prisma.faq.findMany({ where: live, orderBy: [{ category: "asc" }, { order: "asc" }], select: { id: true, question: true, answer: true, category: true } }),
  });
});

// ── Site search ──
publicRouter.get("/search", async (req, res) => {
  const q = z.string().trim().min(2, "Type at least 2 characters").max(100).parse(req.query.q);
  const c = { contains: q, mode: "insensitive" as const };
  const [services, solutions, projects, posts] = await Promise.all([
    prisma.service.findMany({ where: { ...live, OR: [{ title: c }, { shortDescription: c }, { description: c }, { technologies: { has: q } }] }, take: 6, select: { title: true, slug: true, shortDescription: true } }),
    prisma.solution.findMany({ where: { ...live, OR: [{ title: c }, { summary: c }, { industry: c }, { description: c }] }, take: 6, select: { title: true, slug: true, summary: true, industry: true } }),
    prisma.project.findMany({ where: { ...live, OR: [{ title: c }, { summary: c }, { category: c }, { technologies: { has: q } }] }, take: 6, select: { title: true, slug: true, summary: true, category: true } }),
    prisma.blogPost.findMany({ where: { ...livePosts(), OR: [{ title: c }, { excerpt: c }, { content: c }] }, take: 6, orderBy: { publishedAt: "desc" }, select: { title: true, slug: true, excerpt: true, publishedAt: true } }),
  ]);
  res.json({
    data: {
      query: q,
      total: services.length + solutions.length + projects.length + posts.length,
      services: services.map((s) => ({ title: s.title, url: `/services/${s.slug}`, description: s.shortDescription })),
      solutions: solutions.map((s) => ({ title: s.title, url: `/solutions/${s.slug}`, description: s.summary, label: s.industry })),
      projects: projects.map((p) => ({ title: p.title, url: `/projects/${p.slug}`, description: p.summary, label: p.category })),
      posts: posts.map((p) => ({ title: p.title, url: `/blog/${p.slug}`, description: p.excerpt })),
    },
  });
});
