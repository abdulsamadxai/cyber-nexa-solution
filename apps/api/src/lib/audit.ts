import type { Request } from "express";
import { prisma } from "./prisma.js";
import { logger } from "./logger.js";
import { clientIp } from "./http.js";

export async function audit(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string | null,
  meta?: Record<string, unknown>,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ?? null,
        action,
        resource,
        resourceId: resourceId ?? null,
        meta: (meta ?? undefined) as object | undefined,
        ip: clientIp(req),
      },
    });
  } catch (err) {
    logger.error("audit log failed", { action, resource, err: String(err) });
  }
}
