import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";
import { emailStatus } from "./email/service.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  const email = emailStatus();
  logger.info(`Cyber Nexa API listening on ${env.BACKEND_URL} (port ${env.PORT}, ${env.NODE_ENV})`);
  logger.info(`Email provider: ${email.provider}${email.configured ? "" : " (NOT CONFIGURED — emails will be skipped)"}; storage: ${env.STORAGE_PROVIDER}`);
});

/** Housekeeping: expired sessions/tokens and analytics older than 13 months. */
async function cleanup() {
  try {
    const now = new Date();
    const [s, t, v] = await Promise.all([
      prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.authToken.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - 7 * 86400_000) } } }),
      prisma.pageView.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - 395 * 86400_000) } } }),
    ]);
    if (s.count + t.count + v.count) logger.info("cleanup", { sessions: s.count, tokens: t.count, pageViews: v.count });
  } catch (err) {
    logger.warn("cleanup failed", { err: String(err) });
  }
}
const timer = setInterval(cleanup, 60 * 60_000);
setTimeout(cleanup, 10_000);

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  clearInterval(timer);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
