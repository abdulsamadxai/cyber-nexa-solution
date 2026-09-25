import { prisma } from "../src/lib/prisma.js";
import { defaultSettings, settingGroups } from "../src/lib/settings.js";
import { readingMinutes, slugify } from "../src/lib/slug.js";
import { blogCategories, blogPosts, faqs, projects, services, solutions } from "./seed-data.js";

/**
 * Idempotent seed: safe to run more than once. Existing records (matched by
 * slug) are left untouched so edits made in the admin are never overwritten.
 * Admin users are NOT created here — use `npm run create-admin`.
 */
async function main() {
  console.log("Seeding Cyber Nexa Solution content…");

  for (const group of settingGroups) {
    await prisma.siteSetting.upsert({ where: { key: group }, create: { key: group, value: defaultSettings[group] as object }, update: {} });
  }

  for (const [i, s] of services.entries()) {
    const slug = slugify(s.title);
    await prisma.service.upsert({
      where: { slug },
      create: { ...s, slug, order: i, ctaLabel: "Discuss your project", ctaUrl: "/start-a-project", seoTitle: `${s.title} | Cyber Nexa Solution`, seoDescription: s.shortDescription.slice(0, 160) },
      update: {},
    });
  }

  for (const [i, s] of solutions.entries()) {
    const slug = slugify(s.title);
    await prisma.solution.upsert({
      where: { slug },
      create: { ...s, slug, order: i, seoTitle: `${s.title} Software | Cyber Nexa Solution`, seoDescription: s.summary.slice(0, 160) },
      update: {},
    });
  }

  for (const [i, p] of projects.entries()) {
    const slug = slugify(p.title.replace(/\(sample\)/i, "")) + "-sample";
    await prisma.project.upsert({
      where: { slug },
      create: { ...p, slug, order: i, published: true, date: null, seoTitle: p.title, seoDescription: p.summary.slice(0, 160) },
      update: {},
    });
  }

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, order: i })) });
  }

  for (const c of blogCategories) {
    await prisma.blogCategory.upsert({ where: { slug: c.slug }, create: c, update: {} });
  }

  for (const [i, p] of blogPosts.entries()) {
    const category = await prisma.blogCategory.findUniqueOrThrow({ where: { slug: p.category } });
    const exists = await prisma.blogPost.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await prisma.blogPost.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - (i + 1) * 6 * 86400_000),
        authorName: "Cyber Nexa Solution",
        categoryId: category.id,
        isSample: true,
        readingMinutes: readingMinutes(p.content),
        seoTitle: p.title,
        seoDescription: p.excerpt.slice(0, 160),
        tags: { connectOrCreate: p.tags.map((name) => ({ where: { slug: slugify(name) }, create: { name, slug: slugify(name) } })) },
      },
    });
  }

  await prisma.notification.create({
    data: { type: "SYSTEM", title: "Welcome to your admin", message: "Sample projects and articles are marked as samples. Replace them with your own content before launch.", link: "/admin/projects" },
  });

  console.log("✔ Seed complete. Next: npm run create-admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
