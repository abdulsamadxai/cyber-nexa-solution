import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { getSettings } from "../lib/settings.js";

export const seoRouter = Router();

const xmlEscape = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

seoRouter.get("/sitemap.xml", async (_req, res) => {
  const base = env.FRONTEND_URL.replace(/\/$/, "");
  const live = { published: true, deletedAt: null };
  const [services, solutions, projects] = await Promise.all([
    prisma.service.findMany({ where: live, select: { slug: true, updatedAt: true } }),
    prisma.solution.findMany({ where: live, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: live, select: { slug: true, updatedAt: true } }),
  ]);
  const staticPages = ["", "/services", "/solutions", "/industries", "/projects", "/about", "/contact", "/start-a-project", "/faq", "/privacy", "/terms"];
  const urls = [
    ...staticPages.map((p) => ({ loc: `${base}${p}`, lastmod: undefined as Date | undefined, priority: p === "" ? "1.0" : "0.7" })),
    ...services.map((s) => ({ loc: `${base}/services/${s.slug}`, lastmod: s.updatedAt, priority: "0.8" })),
    ...solutions.map((s) => ({ loc: `${base}/solutions/${s.slug}`, lastmod: s.updatedAt, priority: "0.8" })),
    ...projects.map((s) => ({ loc: `${base}/projects/${s.slug}`, lastmod: s.updatedAt, priority: "0.6" })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.toISOString()}</lastmod>` : ""}<priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`;
  res.type("application/xml").setHeader("Cache-Control", "public, max-age=3600").send(xml);
});

seoRouter.get("/robots.txt", async (_req, res) => {
  const s = await getSettings();
  const base = env.FRONTEND_URL.replace(/\/$/, "");
  const body = s.general.maintenanceMode
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`;
  res.type("text/plain").setHeader("Cache-Control", "public, max-age=3600").send(body);
});
