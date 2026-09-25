import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hmac } from "../lib/crypto.js";
import { trackLimiter } from "../middleware/rateLimit.js";

export const trackRouter = Router();

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|monitor/i;

export function deviceFromUA(ua: string) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "Tablet";
  if (/mobi|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

function sourceFrom(referrer: string | undefined, utm: string | undefined, host: string | undefined) {
  if (utm) return utm.toLowerCase().slice(0, 60);
  if (!referrer) return "Direct";
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    if (host && h === host.replace(/^www\./, "")) return "Internal";
    if (/google\./.test(h)) return "Google";
    if (/bing\.com/.test(h)) return "Bing";
    if (/duckduckgo/.test(h)) return "DuckDuckGo";
    if (/linkedin|lnkd\.in/.test(h)) return "LinkedIn";
    if (/facebook|fb\.com/.test(h)) return "Facebook";
    if (/t\.co|twitter|x\.com/.test(h)) return "X";
    if (/instagram/.test(h)) return "Instagram";
    return h.slice(0, 60);
  } catch {
    return "Direct";
  }
}

/**
 * Privacy-friendly page view tracking: no cookies, no raw IPs, honours
 * Do Not Track / Global Privacy Control. Unique visitors are estimated with a
 * salted hash that rotates daily, so visitors can't be followed across days.
 */
trackRouter.post("/track", trackLimiter, async (req, res) => {
  res.status(204).end();
  const ua = req.get("user-agent") ?? "";
  if (req.get("dnt") === "1" || req.get("sec-gpc") === "1" || BOT.test(ua)) return;
  const parsed = z
    .object({ path: z.string().max(300).startsWith("/"), referrer: z.string().max(500).optional(), utmSource: z.string().max(60).optional() })
    .safeParse(req.body);
  if (!parsed.success || parsed.data.path.startsWith("/admin")) return;
  const day = new Date().toISOString().slice(0, 10);
  const host = req.get("origin") ? new URL(req.get("origin")!).hostname : undefined;
  const source = sourceFrom(parsed.data.referrer, parsed.data.utmSource, host);
  await prisma.pageView
    .create({
      data: {
        path: parsed.data.path.split("?")[0],
        referrer: parsed.data.referrer ? parsed.data.referrer.slice(0, 300) : null,
        source,
        device: deviceFromUA(ua),
        visitorHash: hmac(`${day}|${req.ip}|${ua}`).slice(0, 24),
      },
    })
    .catch(() => {});
});
