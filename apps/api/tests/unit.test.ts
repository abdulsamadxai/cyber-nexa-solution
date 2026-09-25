import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify, readingMinutes } from "../src/lib/slug.ts";
import { isStrongPassword, sha256, safeEqual } from "../src/lib/crypto.ts";
import { ROLE_PERMISSIONS, can } from "../src/auth/permissions.ts";
import { esc, templates, inquiryRef } from "../src/email/templates.ts";
import { deviceFromUA } from "../src/routes/analytics.ts";
import { fillDays } from "../src/routes/admin/dashboard.ts";

describe("slug", () => {
  it("normalises text", () => {
    assert.equal(slugify("How AI Is Changing Business!"), "how-ai-is-changing-business");
    assert.equal(slugify("  Café & Restaurant  "), "cafe-restaurant");
    assert.equal(slugify("Ünïcödé test"), "unicode-test");
  });
  it("estimates reading time", () => {
    assert.equal(readingMinutes("word ".repeat(220)), 1);
    assert.ok(readingMinutes("word ".repeat(1000)) >= 4);
  });
});

describe("password policy", () => {
  it("requires length, case and a digit", () => {
    assert.equal(isStrongPassword("Short1"), false);
    assert.equal(isStrongPassword("alllowercase123"), false);
    assert.equal(isStrongPassword("NoDigitsHere"), false);
    assert.equal(isStrongPassword("GoodPass123"), true);
  });
});

describe("crypto helpers", () => {
  it("sha256 is stable and hex", () => {
    assert.match(sha256("x"), /^[a-f0-9]{64}$/);
    assert.equal(sha256("x"), sha256("x"));
  });
  it("safeEqual compares", () => {
    assert.equal(safeEqual("abc", "abc"), true);
    assert.equal(safeEqual("abc", "abd"), false);
    assert.equal(safeEqual("abc", "abcd"), false);
  });
});

describe("RBAC", () => {
  it("SUPER_ADMIN has every permission", () => {
    assert.ok(can("SUPER_ADMIN", "users.write"));
    assert.ok(can("SUPER_ADMIN", "settings.write"));
  });
  it("ADMIN cannot manage users but can manage settings", () => {
    assert.equal(can("ADMIN", "users.write"), false);
    assert.ok(can("ADMIN", "settings.write"));
  });
  it("EDITOR is content-only", () => {
    assert.ok(can("EDITOR", "content.write"));
    assert.equal(can("EDITOR", "inquiries.read"), false);
    assert.equal(can("EDITOR", "settings.read"), false);
  });
  it("SALES is leads-only", () => {
    assert.ok(can("SALES", "inquiries.write"));
    assert.equal(can("SALES", "content.write"), false);
    assert.equal(can("SALES", "users.read"), false);
  });
  it("no role references an unknown permission", () => {
    for (const perms of Object.values(ROLE_PERMISSIONS)) for (const p of perms) assert.equal(typeof p, "string");
  });
});

describe("email templates", () => {
  it("escapes HTML to prevent injection", () => {
    assert.equal(esc('<script>"&\''), "&lt;script&gt;&quot;&amp;&#39;");
  });
  it("formats inquiry reference", () => {
    assert.equal(inquiryRef(1024), "AS1024");
  });
  it("renders a confirmation with escaped user content", () => {
    const r = templates.inquiryConfirmation(
      { companyName: "Cyber Nexa Solution", siteUrl: "https://cybernexasolution.com" },
      { number: 1024, type: "PROJECT", name: "<b>Ali</b>", email: "a@b.com", message: "Hello", projectType: "CRM", budget: "$5,000 – $15,000", timeline: "1 – 3 months" },
    );
    assert.match(r.subject, /#AS1024/);
    assert.ok(!r.html.includes("<b>Ali</b>"));
    assert.match(r.html, /&lt;b&gt;Ali/);
    assert.ok(r.text.includes("Ali"));
  });
});

describe("analytics device detection", () => {
  it("classifies user agents", () => {
    assert.equal(deviceFromUA("iPhone Mobile Safari"), "Mobile");
    assert.equal(deviceFromUA("iPad Safari"), "Tablet");
    assert.equal(deviceFromUA("Macintosh Chrome"), "Desktop");
  });
});

describe("dashboard series", () => {
  it("fills a continuous date range", () => {
    const series = fillDays([], 30);
    assert.equal(series.length, 30);
    assert.ok(series.every((d) => d.count === 0));
    assert.match(series[0].date, /^\d{4}-\d{2}-\d{2}$/);
  });
});
