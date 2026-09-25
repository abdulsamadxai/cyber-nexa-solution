# Cyber Nexa Solution

**Technology Built Around Your Business.**

A complete, production-ready platform for a technology solutions company — not a landing page, but a full business system: a fast public marketing website backed by a secure admin dashboard with a CMS, a lightweight CRM for leads, analytics, email, a media library, newsletter management, roles & permissions, and an audit trail.

**Cyber Nexa Solution** builds technology around a client's business — with trust, quality, and care at the core.

---

## Contents

- [What's inside](#whats-inside)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Database](#database)
- [Creating an admin user](#creating-an-admin-user)
- [Email setup](#email-setup)
- [File storage setup](#file-storage-setup)
- [Spam protection](#spam-protection)
- [Running in production](#running-in-production)
- [Deployment](#deployment)
- [Roles & permissions](#roles--permissions)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)

---

## What's inside

**Public website**
- Home with an animated "system map" hero, services, solutions, featured work, and calls to action
- Services, Solutions (mapped to industries), Projects/case studies with galleries
- Blog with categories, tags, reading time, and structured data (JSON-LD)
- About (mission, values, team), FAQs, Contact form, and a detailed "Start a project" inquiry form
- Newsletter sign-up with double opt-in, privacy & terms pages
- SEO built in: per-page titles/descriptions, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD
- Privacy-friendly analytics (no cookies; honours Do-Not-Track / Global Privacy Control)
- Accessible and responsive, with full reduced-motion support

**Admin dashboard** (`/admin`)
- Secure email + password auth (Argon2id), sessions in `httpOnly` cookies, CSRF protection, login rate-limiting and account lockout, password reset and email verification, invite-based onboarding
- Dashboard with KPIs, charts, recent inquiries, follow-ups, and an activity feed
- **Inquiries CRM**: statuses, priorities, assignment, notes, activity timeline, reply-by-email, follow-up scheduling, CSV export
- **Contacts**: a lightweight relationship record with per-contact inquiry history
- **CMS**: full CRUD for services, solutions, projects, blog posts + categories, testimonials, team, and FAQs, with draft/publish and clearly-marked sample content
- **Media library**: drag-free uploads, folders, image → WebP conversion, copy-URL
- **Notifications**, **email log**, **newsletter subscribers** (CSV export), **analytics**, **audit log**
- **Settings**: company details, homepage hero, about content & values, SEO defaults, social links, email behaviour, and configurable inquiry-form options — all editable in the UI
- **User management** with four roles and a granular permission system

> **Honesty about sample data.** The seed includes three **sample** projects and three **sample** blog posts, clearly labelled "(Sample)". **No fake testimonials, clients, or team members are created** — those sections start empty for you to fill with real content.

---

## Architecture

A single npm-workspaces monorepo with two apps:

```
cyber-nexa-solution/
├── apps/
│   ├── api/     Express + TypeScript + Prisma + PostgreSQL   (the backend & admin API)
│   └── web/     React + TypeScript + Vite + Tailwind         (public site + admin SPA)
├── package.json (workspaces + top-level scripts)
├── render.yaml  (one-click Render blueprint)
└── README.md
```

**Backend** — Node/Express 5, TypeScript (ESM), Prisma 7 ORM over PostgreSQL, Zod validation, Argon2id password hashing, a pluggable email layer (Resend / SendGrid / SMTP / console) and storage layer (local / S3-compatible / Cloudinary).

**Frontend** — React 18 + Vite 6, React Router, TanStack Query, Tailwind CSS, Framer Motion, Lucide icons. The public site and the admin app share one build; the admin bundle is lazy-loaded so public visitors never download it.

---

## Prerequisites

- **Node.js 20+** (a `.nvmrc` pins 22 — run `nvm use`)
- **PostgreSQL 14+** running locally or a hosted database (Neon, Supabase, Render, RDS…)
- **npm 10+**

---

## Quick start

```bash
# 1. Install all dependencies (both apps)
npm install

# 2. Create your database (example for a local Postgres)
createdb amanah
# or:  psql -c "CREATE DATABASE amanah;"

# 3. Configure the backend
cp apps/api/.env.example apps/api/.env
#    → edit apps/api/.env: set DATABASE_URL and a strong SESSION_SECRET
#      generate a secret with:  openssl rand -base64 48

# 4. Configure the frontend (defaults work for local dev)
cp apps/web/.env.example apps/web/.env

# 5. Set up the database schema and seed starter content
npm run db:migrate        # applies migrations
npm run db:seed           # services, solutions, sample projects/posts, FAQs

# 6. Create your first admin (interactive)
npm run create-admin

# 7. Start both apps in dev
npm run dev
```

Then open:
- **Website** → http://localhost:5173
- **Admin** → http://localhost:5173/admin
- **API** → http://localhost:4000/api/health

The Vite dev server proxies `/api` and `/uploads` to the backend, so you only need one URL while developing.

---

## Configuration

The repo uses **two** env files — there is no root `.env`.

### `apps/api/.env` (backend)

The most important values:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string. Hosted DBs often need `?sslmode=require`. |
| `SESSION_SECRET` | ✅ | ≥ 32 chars. Signs sessions & tokens. `openssl rand -base64 48`. |
| `FRONTEND_URL` | ✅ (prod) | Public URL of the website — used in email links, CORS, and CSRF origin checks. |
| `BACKEND_URL` | ✅ (prod) | Public URL of the API. |
| `NODE_ENV` | | `development` / `production`. |
| `PORT` | | Defaults to `4000`. |
| `TRUST_PROXY` | | Set to `1` behind a proxy/load balancer (Render, Fly, Nginx). |
| `COOKIE_SECURE` | | `true` in production (HTTPS). |
| `COOKIE_SAMESITE` | | `none` if the site and API are on **different** hosts (requires `COOKIE_SECURE=true`). |
| `EMAIL_PROVIDER` | | `console` (dev), `resend`, `sendgrid`, or `smtp`. |
| `STORAGE_PROVIDER` | | `local` (dev), `s3`, or `cloudinary`. |
| `TURNSTILE_SECRET_KEY` | | Enables Cloudflare Turnstile on public forms. |

See `apps/api/.env.example` for the full annotated list (email keys, S3/Cloudinary creds, cookie domain, log level…). The server **validates its environment on boot** and prints a clear message listing anything missing or malformed.

### `apps/web/.env` (frontend)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the API. Leave **empty** for same-origin (dev proxy, or prod behind a rewrite). |
| `VITE_PROXY_TARGET` | Where the dev server proxies `/api` and `/uploads` (default `http://localhost:4000`). |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile site key — only if you enabled Turnstile on the API. |

---

## Database

Prisma manages the schema (26 tables: users, sessions, tokens, inquiries, contacts, notes, activities, services, solutions, projects + images, blog posts/categories/tags, team, testimonials, FAQs, media, subscribers, page views, email log, audit log, settings…).

```bash
npm run db:migrate     # dev: create/apply a migration and regenerate the client
npm run db:deploy      # prod: apply committed migrations (no prompts)
npm run db:seed        # load starter content (idempotent)
npm run db:generate    # regenerate the Prisma client only
npm run db:studio      # open Prisma Studio to browse data
```

**What the seed creates:** 15 services, 10 solutions, 3 **sample** projects (marked and with no client name), 9 FAQs, 3 blog categories, and 3 **sample** blog posts. It intentionally does **not** create testimonials, team members, or an admin — you add those yourself.

Inquiry references are human-friendly: they display as `#AS1001`, `#AS1002`, …

---

## Creating an admin user

The first admin is created from the command line (there is no public sign-up):

```bash
# Interactive (prompts for email, name, password — password input is hidden)
npm run create-admin

# Non-interactive-ish (password still prompted, or pass ADMIN_PASSWORD via env for CI)
npm run create-admin -- --email you@yourcompany.com --name "Your Name"
```

This creates (or promotes) a **SUPER_ADMIN**. From there you invite everyone else from **Admin → Users** — they receive a secure link to set their own password (or, if email isn't configured yet, the dashboard shows you a one-time invite link to share).

---

## Email setup

Out of the box `EMAIL_PROVIDER=console` logs every email to the server console and records it in **Admin → Emails** — nothing is delivered. To send real email, set one of:

- **Resend** — `EMAIL_PROVIDER=resend`, `RESEND_API_KEY=…`
- **SendGrid** — `EMAIL_PROVIDER=sendgrid`, `SENDGRID_API_KEY=…`
- **SMTP** (any provider) — `EMAIL_PROVIDER=smtp`, `SMTP_HOST/PORT/USER/PASSWORD`, `SMTP_SECURE`

Set `EMAIL_FROM` to a verified sender, then use **Admin → Settings → Email → Send test email** to confirm delivery. You control which events trigger notifications (new contact, project inquiry, new subscriber) and whether customers get confirmation emails, all from Settings.

---

## File storage setup

`STORAGE_PROVIDER=local` writes uploads to `apps/api/uploads/` and serves them at `/uploads`. Uploaded raster images are converted to WebP; SVG uploads are rejected for safety.

⚠️ On ephemeral hosts (Render's free tier, Fly without a volume) the local folder is wiped on every deploy. For production use object storage:

- **S3 / Cloudflare R2 / any S3-compatible** — `STORAGE_PROVIDER=s3`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` (for R2), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, `S3_FORCE_PATH_STYLE`
- **Cloudinary** — `STORAGE_PROVIDER=cloudinary`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Spam protection

Public forms already use a honeypot field plus a minimum submit-time check. For stronger protection, add **Cloudflare Turnstile**: set `TURNSTILE_SECRET_KEY` on the API and `VITE_TURNSTILE_SITE_KEY` on the web app. When both are present, the contact and inquiry forms require a valid token.

---

## Running in production

```bash
# Build both apps
npm run build
#   → apps/api/dist  (bundled Node server)
#   → apps/web/dist  (static assets)

# Apply migrations against the production database
npm --workspace apps/api run db:deploy

# Start the API
npm --workspace apps/api run start        # node apps/api/dist/server.js

# Serve apps/web/dist with any static host / CDN (see Deployment)
```

Set `NODE_ENV=production`, `COOKIE_SECURE=true`, `TRUST_PROXY=1`, and the correct `FRONTEND_URL` / `BACKEND_URL`. If the site and API are on different hosts, also set `COOKIE_SAMESITE=none`.

---

## Deployment

There are two common shapes. Pick one.

### Option A — Render (all-in-one, included blueprint)

`render.yaml` provisions a **PostgreSQL** database, the **API** web service, and the **static** website. Push to GitHub, then in Render choose **New → Blueprint** and select the repo. After the first deploy, set `FRONTEND_URL` and `BACKEND_URL` to the URLs Render assigns (and the static-site rewrite target if your API name differs). `SESSION_SECRET` is generated for you; migrations run automatically as part of the API build.

### Option B — Vercel (site) + a Node host (API) + Neon (database)

1. **Database**: create a Postgres on [Neon](https://neon.tech), copy the connection string (with `?sslmode=require`).
2. **API**: deploy `apps/api` to any Node host (Render, Railway, Fly, a VPS). Set the env from `apps/api/.env.example`; run `npm --workspace apps/api run db:deploy` once. Note its public URL.
3. **Website**: deploy `apps/web` to Vercel (framework: Vite). Edit `apps/web/vercel.json` and replace `YOUR-API-HOST` with your API host so `/api` and `/uploads` are proxied and client-side routes fall back to `index.html`.
4. On the API, set `FRONTEND_URL` to the Vercel URL and, since hosts differ, `COOKIE_SECURE=true` + `COOKIE_SAMESITE=none`.

Any static host works for the site (Netlify, Cloudflare Pages, S3+CloudFront) as long as it rewrites unknown routes to `index.html` and forwards `/api` + `/uploads` to the API.

---

## Roles & permissions

Four roles, enforced on every admin endpoint and reflected in the UI (people only see what they can use):

| Role | Can do |
| --- | --- |
| **Super Admin** | Everything, including managing users and settings. |
| **Admin** | Everything except it can't remove the last super admin. |
| **Editor** | Content only — CMS, media, blog. No leads, users, or settings. |
| **Sales** | Leads only — inquiries, contacts, subscribers. No content or settings. |

Permissions are granular (e.g. `inquiries.read`, `content.write`, `users.write`, `settings.read`) so the roles above can be tuned in `apps/api/src/auth/permissions.ts`.

---

## Testing

```bash
npm test          # runs the API test suite
```

The backend ships with unit tests (validation, permissions, helpers) and in-process integration tests that exercise real HTTP routes against the app, covering auth, CSRF, public content, and form submission.

---

## Project structure

```
apps/api/
  prisma/            schema.prisma, migrations, seed.ts
  scripts/           create-admin, build (esbuild bundler)
  src/
    config/          env parsing & validation
    lib/             prisma, crypto, audit, settings, email templates, storage…
    auth/            sessions, tokens, permissions
    middleware/      auth guard, error handler, rate limits, security headers
    email/           provider adapters (resend/sendgrid/smtp/console)
    storage/         provider adapters (local/s3/cloudinary)
    routes/          auth, public, forms, seo, analytics, admin/*
    app.ts, server.ts

apps/web/
  src/
    components/      ui/, site/ (public), admin/ (dashboard primitives)
    pages/           public pages, admin/ (dashboard), content/ (CMS editors)
    hooks/           useSettings, useContent, useAdmin
    context/         AuthContext
    lib/             typed API client, types, formatting, icons
    App.tsx, main.tsx
  public/            favicon, robots.txt
```

---

## Troubleshooting

**"Invalid environment configuration" on API start** — the server lists exactly which variables are missing or malformed. Copy `apps/api/.env.example` to `apps/api/.env` and fill them in. `SESSION_SECRET` must be ≥ 32 characters.

**Login works but immediately logs out / 401s in production** — cookie settings. When the site and API are on different hosts you must set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none`, serve both over HTTPS, and set `TRUST_PROXY=1`. Make sure `FRONTEND_URL`/`BACKEND_URL` match your real URLs (they're used for the CSRF origin check).

**CORS errors** — add the origin to `CORS_ORIGINS` (comma-separated). `FRONTEND_URL` is always allowed.

**Uploaded images vanish after redeploy** — you're on `STORAGE_PROVIDER=local` on an ephemeral host. Switch to S3/R2 or Cloudinary.

**Prisma client / engine download errors in a restricted network** — this project uses Prisma 7's engine-free client with the `@prisma/adapter-pg` driver, so normal environments need no special setup: `npm run db:migrate` / `db:deploy` just work. Only in fully offline/sandboxed environments (where Prisma can't fetch its schema-engine binary) do you need to provide it out-of-band; standard cloud hosts are unaffected.

---

## Security notes

- Passwords hashed with **Argon2id**; sessions stored server-side and referenced by a signed `httpOnly` cookie.
- **CSRF** protection via double-submit token + origin check on all mutations.
- Login **rate-limiting** and **account lockout** after repeated failures; separate limits on form and upload endpoints.
- Security headers (CSP, HSTS in production, etc.), strict input validation with Zod on every route.
- **Soft deletes** across content, and an **audit log** of sensitive admin actions.
- The last active super admin can't be demoted, disabled, or deleted, so you can't lock yourself out.

---

Built with care for **Cyber Nexa Solution** — technology you can trust.
