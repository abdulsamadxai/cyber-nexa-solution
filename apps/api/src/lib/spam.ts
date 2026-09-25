import type { Request } from "express";
import { env } from "../config/env.js";
import { badRequest } from "./errors.js";
import { logger } from "./logger.js";

/**
 * Layered spam protection for public forms:
 *  - honeypot field (`website`) that humans never see
 *  - minimum time between rendering and submitting the form
 *  - optional Cloudflare Turnstile verification (enabled when TURNSTILE_SECRET_KEY is set)
 *  - IP rate limiting (see middleware/rateLimit.ts)
 */
export async function checkSpam(req: Request, body: { website?: string | null; startedAt?: number | null; turnstileToken?: string | null }) {
  if (body.website) throw badRequest("Your message could not be sent. Please try again.");
  if (body.startedAt && Date.now() - body.startedAt < 2500) {
    throw badRequest("That was quick! Please check your details and submit again.");
  }
  if (env.TURNSTILE_SECRET_KEY) {
    if (!body.turnstileToken) throw badRequest("Please complete the verification check.");
    const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: body.turnstileToken, remoteip: req.ip ?? "" });
    try {
      const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
      const json = (await r.json()) as { success: boolean };
      if (!json.success) throw badRequest("Verification failed. Please try again.");
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Verification")) throw err;
      logger.warn("turnstile verification error", { err: String(err) });
      throw badRequest("We couldn't verify your submission. Please try again.");
    }
  }
}

/** Blocks header-injection style content and obvious link spam in free text. */
export function looksLikeLinkSpam(text: string) {
  const links = text.match(/https?:\/\//gi)?.length ?? 0;
  return links > 5;
}
