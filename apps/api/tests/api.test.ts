/**
 * Integration tests: boots the real Express app against the configured database
 * and drives it over HTTP with a cookie jar. Requires a reachable DATABASE_URL
 * (the same one used for development). Run with: npm test
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { createApp } from "../src/app.ts";
import { prisma } from "../src/lib/prisma.ts";
import { hashPassword } from "../src/lib/crypto.ts";

let server: Server;
let base = "";
const jar = new Map<string, string>();

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
function storeCookies(res: Response) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    jar.set(pair.slice(0, idx), pair.slice(idx + 1));
  }
}
async function json(res: Response): Promise<any> { return res.json(); }
async function api(path: string, init: RequestInit & { csrf?: string } = {}) {
  const headers = new Headers(init.headers);
  if (cookieHeader()) headers.set("cookie", cookieHeader());
  if (init.csrf) headers.set("x-csrf-token", init.csrf);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("origin", process.env.BACKEND_URL || "http://localhost:4000");
  const res = await fetch(base + path, { ...init, headers });
  storeCookies(res);
  return res;
}

before(async () => {
  process.env.NODE_ENV = "test";
  await prisma.user.upsert({
    where: { email: "cybernexasolution@gmail.com" },
    create: { email: "cybernexasolution@gmail.com", name: "QA Admin", role: "SUPER_ADMIN", passwordHash: await hashPassword("QaAdmin123!"), emailVerifiedAt: new Date(), isActive: true },
    update: { passwordHash: await hashPassword("QaAdmin123!"), role: "SUPER_ADMIN", isActive: true, deletedAt: null, lockedUntil: null, failedLoginCount: 0 },
  });
  await prisma.user.upsert({
    where: { email: "sales@cybernexa.com" },
    create: { email: "sales@cybernexa.com", name: "QA Sales", role: "SALES", passwordHash: await hashPassword("QaSales123!"), emailVerifiedAt: new Date(), isActive: true },
    update: { passwordHash: await hashPassword("QaSales123!"), role: "SALES", isActive: true, deletedAt: null },
  });
  await new Promise<void>((resolve) => {
    server = createApp().listen(0, () => {
      const addr = server.address();
      base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
      resolve();
    });
  });
});

after(async () => {
  server?.close();
  await prisma.$disconnect();
});

async function login(email: string, password: string) {
  jar.clear();
  const csrf = (await json(await api("/api/auth/csrf"))).data.csrfToken as string;
  const res = await api("/api/auth/login", { method: "POST", csrf, body: JSON.stringify({ email, password }) });
  return { res, csrf };
}

describe("health & public content", () => {
  it("reports healthy", async () => {
    const res = await api("/api/health");
    assert.equal(res.status, 200);
    assert.equal((await json(res)).status, "ok");
  });
  it("lists services and opens one by slug", async () => {
    const list = (await json(await api("/api/services"))).data;
    assert.ok(list.length > 0);
    const detail = await api(`/api/services/${list[0].slug}`);
    assert.equal(detail.status, 200);
    assert.equal((await detail.json()).data.slug, list[0].slug);
  });
  it("returns 404 for an unknown service", async () => {
    assert.equal((await api("/api/services/does-not-exist")).status, 404);
  });
  it("searches across content", async () => {
    const data = (await json(await api("/api/search?q=crm"))).data;
    assert.ok(data.total > 0);
  });
  it("serves sitemap and robots", async () => {
    assert.match(await (await api("/sitemap.xml")).text(), /<urlset/);
    assert.match(await (await api("/robots.txt")).text(), /Sitemap:/);
  });
});

describe("public forms", () => {
  it("rejects invalid contact input with field errors", async () => {
    const res = await api("/api/contact", { method: "POST", body: JSON.stringify({ name: "x", email: "bad" }) });
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.error.code, "VALIDATION_ERROR");
    assert.ok(body.error.fields.email);
  });
  it("blocks honeypot submissions", async () => {
    const res = await api("/api/contact", { method: "POST", body: JSON.stringify({ name: "Bot Bot", email: "bot@x.com", subject: "hello there", message: "this is spam content here", website: "http://spam.example" }) });
    assert.equal(res.status, 400);
  });
  it("accepts a valid contact and returns a reference", async () => {
    const res = await api("/api/contact", { method: "POST", body: JSON.stringify({ name: "Test Person", email: `qa+${Date.now()}@example.com`, subject: "Website project", message: "We would like a new website for our company.", startedAt: Date.now() - 9000 }) });
    assert.equal(res.status, 201);
    assert.match((await json(res)).data.reference, /^AS\d+$/);
  });
  it("validates project inquiry against configured options", async () => {
    const bad = await api("/api/inquiries", { method: "POST", body: JSON.stringify({ name: "Test Person", email: "qa@example.com", country: "Pakistan", projectType: "Nonsense", budget: "x", timeline: "y", description: "x".repeat(30), startedAt: 1 }) });
    assert.equal(bad.status, 422);
  });
});

describe("authentication", () => {
  it("rejects wrong credentials", async () => {
    const { res } = await login("cybernexasolution@gmail.com", "wrongpass");
    assert.equal(res.status, 401);
  });
  it("rejects login without a CSRF token", async () => {
    jar.clear();
    await api("/api/auth/csrf");
    const res = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "cybernexasolution@gmail.com", password: "QaAdmin123!" }) });
    assert.equal(res.status, 403);
  });
  it("signs in with valid credentials and returns the user", async () => {
    const { res } = await login("cybernexasolution@gmail.com", "QaAdmin123!");
    assert.equal(res.status, 200);
    assert.equal((await json(res)).data.role, "SUPER_ADMIN");
    assert.equal((await json(await api("/api/auth/me"))).data.email, "cybernexasolution@gmail.com");
  });
});

describe("admin RBAC", () => {
  it("SUPER_ADMIN can create and delete a service", async () => {
    const { csrf } = await login("cybernexasolution@gmail.com", "QaAdmin123!");
    const created = await api("/api/admin/content/services", { method: "POST", csrf, body: JSON.stringify({ title: `QA Service ${Date.now()}`, shortDescription: "A description used only by tests here.", description: "Full description used only by the automated test suite." }) });
    assert.equal(created.status, 201);
    const id = (await created.json()).data.id;
    assert.equal((await api(`/api/admin/content/services/${id}`, { method: "DELETE", csrf })).status, 204);
  });
  it("SALES is denied content, users and settings", async () => {
    const { csrf } = await login("sales@cybernexa.com", "QaSales123!");
    assert.equal((await api("/api/admin/inquiries")).status, 200);
    assert.equal((await api("/api/admin/content/services", { method: "POST", csrf, body: JSON.stringify({ title: "no", shortDescription: "xxxxxxxxxx", description: "xxxxxxxxxx" }) })).status, 403);
    assert.equal((await api("/api/admin/users")).status, 403);
    assert.equal((await api("/api/admin/settings")).status, 403);
  });
  it("blocks admin API without a session", async () => {
    jar.clear();
    assert.equal((await api("/api/admin/dashboard")).status, 401);
  });
});
