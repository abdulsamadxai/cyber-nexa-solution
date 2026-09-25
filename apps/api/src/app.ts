import express from "express";
import path from "node:path";
import fs from "node:fs";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env, isProd } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { requestId, errorHandler, notFoundHandler } from "./middleware/error.js";
import { loadUser } from "./middleware/auth.js";
import { csrfProtection, allowedOrigins } from "./middleware/csrf.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";
import { formsRouter } from "./routes/forms.js";
import { trackRouter } from "./routes/analytics.js";
import { seoRouter } from "./routes/seo.js";
import { adminRouter } from "./routes/admin/index.js";
import { UPLOAD_DIR } from "./storage/index.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (env.TRUST_PROXY) app.set("trust proxy", env.TRUST_PROXY);

  app.use(requestId);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }, // uploaded images are shown on the web domain
      contentSecurityPolicy: env.NODE_ENV === "production" && process.env.WEB_DIST_DIR ? false : undefined,
      hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
    }),
  );
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || allowedOrigins().includes(origin.replace(/\/$/, ""))),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "X-CSRF-Token"],
      maxAge: 600,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // Locally stored uploads (STORAGE_PROVIDER=local). Served with strict headers so files can't execute as pages.
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      maxAge: "30d",
      immutable: true,
      fallthrough: false,
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
      },
    }),
  );

  app.use(seoRouter);

  app.get("/api/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", db: "ok", time: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: "degraded", db: "unreachable" });
    }
  });

  const api = express.Router();
  api.use(apiLimiter);
  api.use(loadUser);
  api.use("/auth", csrfProtection, authRouter);
  api.use("/admin", csrfProtection, adminRouter);
  api.use("/analytics", trackRouter);
  api.use(formsRouter);
  api.use(publicRouter);
  api.use(notFoundHandler);
  app.use("/api", api);

  // Serve the built frontend from the API if present (single-service deployment on Hostinger/VPS)
  const candidateDirs = [
    process.env.WEB_DIST_DIR ? path.resolve(process.env.WEB_DIST_DIR) : null,
    path.resolve(process.cwd(), "apps/web/dist"),
    path.resolve(process.cwd(), "../web/dist"),
    path.resolve(process.cwd(), "web/dist"),
  ].filter(Boolean) as string[];

  const webDist = candidateDirs.find((d) => fs.existsSync(path.join(d, "index.html")));
  if (webDist) {
    console.log(`[info] Serving frontend static assets from: ${webDist}`);
    app.use(express.static(webDist, { index: "index.html", maxAge: "1h", setHeaders: (res, p) => /\/assets\//.test(p) && res.setHeader("Cache-Control", "public, max-age=31536000, immutable") }));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(webDist, "index.html")));
  } else {
    console.warn(`[warn] No frontend build found in candidate directories: ${candidateDirs.join(", ")}`);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
