import { Router, type Request } from "express";
import { z } from "zod";
import { prisma, type InquiryType } from "../lib/prisma.js";
import { badRequest, notFound } from "../lib/errors.js";
import { zs } from "../lib/validate.js";
import { hmac, randomToken } from "../lib/crypto.js";
import { checkSpam, looksLikeLinkSpam } from "../lib/spam.js";
import { notify } from "../lib/notify.js";
import { getSettings } from "../lib/settings.js";
import { formLimiter, newsletterLimiter } from "../middleware/rateLimit.js";
import { inquiryRef } from "../email/templates.js";
import {
  sendAdminNotification,
  sendContactConfirmation,
  sendNewsletterAdminNotification,
  sendNewsletterConfirmation,
  sendProjectInquiryConfirmation,
} from "../email/service.js";

export const formsRouter = Router();

const antiSpam = {
  website: z.string().max(200).optional().nullable(),
  startedAt: z.coerce.number().optional().nullable(),
  turnstileToken: z.string().max(4000).optional().nullable(),
};

const contactSchema = z.object({
  name: zs.name,
  email: zs.email,
  phone: zs.phone,
  company: zs.optionalText(160),
  subject: z.string().trim().min(3, "Add a short subject").max(160),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
  ...antiSpam,
});

async function createInquiry(req: Request, type: InquiryType, data: Record<string, unknown> & { name: string; email: string; message: string }, source: string) {
  const email = data.email;
  const str = (k: string) => (typeof data[k] === "string" && data[k] ? (data[k] as string) : null);
  const contact = await prisma.contact.upsert({
    where: { email },
    create: { email, name: data.name, phone: str("phone"), company: str("company"), country: str("country"), source },
    update: {
      name: data.name,
      ...(str("phone") ? { phone: str("phone") } : {}),
      ...(str("company") ? { company: str("company") } : {}),
      ...(str("country") ? { country: str("country") } : {}),
      deletedAt: null,
    },
  });
  const inquiry = await prisma.inquiry.create({
    data: {
      type,
      name: data.name,
      email,
      phone: str("phone"),
      company: str("company"),
      country: str("country"),
      subject: str("subject"),
      message: data.message,
      projectType: str("projectType"),
      budget: str("budget"),
      timeline: str("timeline"),
      requiredFeatures: str("requiredFeatures"),
      referenceUrl: str("referenceUrl"),
      heardFrom: str("heardFrom"),
      priority: type === "PROJECT" ? "HIGH" : "MEDIUM",
      contactId: contact.id,
      ipHash: hmac(`ip:${req.ip}`).slice(0, 32),
      userAgent: req.get("user-agent")?.slice(0, 300) ?? null,
    },
  });
  await prisma.activity.create({
    data: {
      type: "inquiry.created",
      message: `${type === "PROJECT" ? "Project inquiry" : "Contact message"} #${inquiryRef(inquiry.number)} received from the website`,
      inquiryId: inquiry.id,
      contactId: contact.id,
    },
  });
  return inquiry;
}

formsRouter.post("/contact", formLimiter, async (req, res) => {
  const body = contactSchema.parse(req.body);
  await checkSpam(req, body);
  if (looksLikeLinkSpam(body.message)) throw badRequest("Your message contains too many links.", { message: "Please remove some links" });

  const inquiry = await createInquiry(req, "CONTACT", body, "Contact form");
  await notify("CONTACT_INQUIRY", `New message from ${body.name}`, body.subject, `/admin/inquiries/${inquiry.id}`);
  await Promise.allSettled([sendAdminNotification({ ...inquiry, type: "CONTACT" }), sendContactConfirmation({ ...inquiry, type: "CONTACT" })]);

  res.status(201).json({ data: { reference: inquiryRef(inquiry.number), message: "Thanks — your message has been sent." } });
});

formsRouter.post("/inquiries", formLimiter, async (req, res) => {
  const s = await getSettings();
  const oneOf = (list: string[], label: string) =>
    z.string().trim().refine((v) => list.includes(v), `Choose a ${label} from the list`);

  const body = z
    .object({
      name: zs.name,
      email: zs.email,
      phone: zs.phone,
      company: zs.optionalText(160),
      country: z.string().trim().min(2, "Enter your country").max(80),
      projectType: oneOf(s.inquiry.projectTypes, "project type"),
      budget: oneOf(s.inquiry.budgetOptions, "budget"),
      timeline: oneOf(s.inquiry.timelineOptions, "timeline"),
      description: z.string().trim().min(20, "Describe your project in at least 20 characters").max(8000),
      requiredFeatures: zs.optionalText(4000),
      referenceUrl: zs.optionalUrl,
      heardFrom: z.string().trim().max(80).optional().nullable().transform((v) => v || null),
      ...antiSpam,
    })
    .parse(req.body);
  await checkSpam(req, body);
  if (looksLikeLinkSpam(body.description)) throw badRequest("Your description contains too many links.");

  const inquiry = await createInquiry(req, "PROJECT", { ...body, message: body.description, subject: `${body.projectType} project` }, body.heardFrom ?? "Project inquiry form");
  await notify(
    "PROJECT_INQUIRY",
    `New ${body.projectType} inquiry`,
    `${body.name}${body.company ? ` (${body.company})` : ""} · ${body.budget} · ${body.timeline}`,
    `/admin/inquiries/${inquiry.id}`,
  );
  await Promise.allSettled([sendAdminNotification({ ...inquiry, type: "PROJECT" }), sendProjectInquiryConfirmation({ ...inquiry, type: "PROJECT" })]);

  res.status(201).json({
    data: { reference: inquiryRef(inquiry.number), message: "Thanks — we've received your project details and will reply within one business day." },
  });
});

// ── Newsletter ──
formsRouter.post("/newsletter/subscribe", newsletterLimiter, async (req, res) => {
  const body = z.object({ email: zs.email, source: z.string().max(60).optional(), ...antiSpam }).parse(req.body);
  if (body.website) throw badRequest("Subscription failed. Please try again.");
  const s = await getSettings();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: body.email } });

  if (existing?.status === "CONFIRMED") {
    return res.json({ data: { status: "CONFIRMED", message: "You're already subscribed. Thank you!" } });
  }
  const doubleOptIn = s.email.newsletterDoubleOptIn;
  const token = existing?.token ?? randomToken(24);
  const status = doubleOptIn ? "PENDING" : "CONFIRMED";
  await prisma.newsletterSubscriber.upsert({
    where: { email: body.email },
    create: { email: body.email, token, status, source: body.source ?? "footer", confirmedAt: doubleOptIn ? null : new Date() },
    update: { status, unsubscribedAt: null, confirmedAt: doubleOptIn ? null : new Date() },
  });

  if (doubleOptIn) {
    await sendNewsletterConfirmation({ to: body.email, token });
    return res.status(201).json({ data: { status, message: "Almost done — check your inbox to confirm your subscription." } });
  }
  await notify("NEWSLETTER_SUBSCRIBER", "New newsletter subscriber", body.email, "/admin/subscribers");
  void sendNewsletterAdminNotification(body.email);
  res.status(201).json({ data: { status, message: "You're subscribed. Thank you!" } });
});

formsRouter.post("/newsletter/confirm", newsletterLimiter, async (req, res) => {
  const { token } = z.object({ token: z.string().min(10).max(100) }).parse(req.body);
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { token } });
  if (!sub) throw notFound("Subscription");
  if (sub.status !== "CONFIRMED") {
    await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: "CONFIRMED", confirmedAt: new Date(), unsubscribedAt: null } });
    await notify("NEWSLETTER_SUBSCRIBER", "New newsletter subscriber", sub.email, "/admin/subscribers");
    void sendNewsletterAdminNotification(sub.email);
  }
  res.json({ data: { message: "Your subscription is confirmed. Thank you!" } });
});

formsRouter.post("/newsletter/unsubscribe", newsletterLimiter, async (req, res) => {
  const { token } = z.object({ token: z.string().min(10).max(100) }).parse(req.body);
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { token } });
  if (!sub) throw notFound("Subscription");
  await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() } });
  res.json({ data: { message: "You've been unsubscribed and won't receive further emails." } });
});
