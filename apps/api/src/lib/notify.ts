import { prisma, type NotificationType } from "./prisma.js";
import { logger } from "./logger.js";

export async function notify(type: NotificationType, title: string, message: string, link?: string) {
  try {
    await prisma.notification.create({ data: { type, title, message, link } });
  } catch (err) {
    logger.error("notification create failed", { err: String(err) });
  }
}
