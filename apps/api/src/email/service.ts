import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { getSettings } from "../lib/settings.js";
import { getProvider } from "./providers.js";
import { templates, type Brand, type InquiryData, type Rendered, type TemplateName } from "./templates.js";

/**
 * Central email service. Routes never talk to providers directly — they call
 * the functions exported below. Sending never throws: failures are logged to
 * `EmailLog` so a provider outage can't break a form submission.
 */

async function brand(): Promise<Brand> {
  const s = await getSettings();
  return {
    companyName: s.general.companyName,
    siteUrl: env.FRONTEND_URL,
    logoUrl: s.general.logoUrl || undefined,
    address: s.general.address || undefined,
    email: s.general.email || undefined,
  };
}

async function fromAddress() {
  const s = await getSettings();
  const addr = /<(.+)>/.exec(env.EMAIL_FROM)?.[1] ?? env.EMAIL_FROM;
  return s.email.senderName ? `${s.email.senderName} <${addr}>` : env.EMAIL_FROM;
}

export async function adminRecipients(): Promise<string[]> {
  const s = await getSettings();
  const list = [s.email.notificationEmail, env.ADMIN_EMAIL].filter(Boolean) as string[];
  return [...new Set(list.flatMap((e) => e.split(",").map((x) => x.trim())).filter(Boolean))].slice(0, 5);
}

export async function sendEmail(to: string | string[], template: TemplateName, rendered: Rendered, replyTo?: string) {
  const provider = getProvider();
  const recipients = Array.isArray(to) ? to : [to];
  const s = await getSettings();
  const toLabel = recipients.join(", ").slice(0, 500);

  if (!recipients.length) {
    await logEmail(toLabel || "(none)", rendered.subject, template, "SKIPPED", provider.name, null, "No recipient configured");
    return { ok: false as const };
  }
  if (!provider.configured) {
    await logEmail(toLabel, rendered.subject, template, "SKIPPED", provider.name, null, `${provider.name} is not configured`);
    logger.warn(`email skipped: ${provider.name} not configured`, { template });
    return { ok: false as const };
  }
  try {
    const result = await provider.send({
      from: await fromAddress(),
      to: recipients,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      replyTo: replyTo ?? (s.email.replyTo || undefined),
    });
    await logEmail(toLabel, rendered.subject, template, "SENT", provider.name, result.id ?? null, null);
    return { ok: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("email send failed", { template, err: message });
    await logEmail(toLabel, rendered.subject, template, "FAILED", provider.name, null, message.slice(0, 1000));
    return { ok: false as const };
  }
}

async function logEmail(
  to: string,
  subject: string,
  template: string,
  status: "SENT" | "FAILED" | "SKIPPED",
  provider: string,
  providerId: string | null,
  error: string | null,
) {
  await prisma.emailLog
    .create({ data: { to, subject: subject.slice(0, 300), template, status, provider, providerId, error } })
    .catch((e) => logger.error("email log failed", { e: String(e) }));
}

const adminLink = (path: string) => `${env.FRONTEND_URL}/admin${path}`;

// ─── Named helpers used by routes ───

export async function sendAdminNotification(inquiry: InquiryData & { id: string }) {
  const s = await getSettings();
  const enabled = inquiry.type === "PROJECT" ? s.email.notifyOnProjectInquiry : s.email.notifyOnContact;
  if (!enabled) return;
  const b = await brand();
  const url = adminLink(`/inquiries/${inquiry.id}`);
  const rendered =
    inquiry.type === "PROJECT"
      ? templates.projectInquiryNotification(b, inquiry, url)
      : templates.contactNotification(b, inquiry, url);
  // Reply-To is the customer, so the team can answer directly from their inbox.
  await sendEmail(await adminRecipients(), inquiry.type === "PROJECT" ? "projectInquiryNotification" : "contactNotification", rendered, inquiry.email);
}

export async function sendContactConfirmation(inquiry: InquiryData) {
  const s = await getSettings();
  if (!s.email.sendCustomerConfirmation) return;
  await sendEmail(inquiry.email, "inquiryConfirmation", templates.inquiryConfirmation(await brand(), inquiry));
}

export const sendProjectInquiryConfirmation = sendContactConfirmation;

export async function sendInquiryUpdate(p: { to: string; name: string; number: number; subject: string; message: string; senderName: string }) {
  return sendEmail(p.to, "inquiryUpdate", templates.inquiryUpdate(await brand(), p));
}

export async function sendAdminInvitation(p: { to: string; name: string; inviter: string; role: string; token: string }) {
  const url = `${env.FRONTEND_URL}/admin/accept-invite?token=${encodeURIComponent(p.token)}`;
  return sendEmail(p.to, "adminInvitation", templates.adminInvitation(await brand(), { ...p, url }));
}

export async function sendPasswordReset(p: { to: string; name: string; token: string }) {
  const url = `${env.FRONTEND_URL}/admin/reset-password?token=${encodeURIComponent(p.token)}`;
  return sendEmail(p.to, "passwordReset", templates.passwordReset(await brand(), { name: p.name, url }));
}

export async function sendEmailVerification(p: { to: string; name: string; token: string }) {
  const url = `${env.FRONTEND_URL}/admin/verify-email?token=${encodeURIComponent(p.token)}`;
  return sendEmail(p.to, "emailVerification", templates.emailVerification(await brand(), { name: p.name, url }));
}

export async function sendNewsletterConfirmation(p: { to: string; token: string }) {
  const confirmUrl = `${env.FRONTEND_URL}/newsletter/confirm?token=${encodeURIComponent(p.token)}`;
  const unsubscribeUrl = `${env.FRONTEND_URL}/newsletter/unsubscribe?token=${encodeURIComponent(p.token)}`;
  return sendEmail(p.to, "newsletterConfirmation", templates.newsletterConfirmation(await brand(), { confirmUrl, unsubscribeUrl }));
}

export async function sendNewsletterAdminNotification(email: string) {
  const s = await getSettings();
  if (!s.email.notifyOnNewsletter) return;
  await sendEmail(await adminRecipients(), "newsletterSubscriberNotification", templates.newsletterSubscriberNotification(await brand(), { email }));
}

export async function sendSecurityAlert(p: { to: string; name: string; message: string }) {
  return sendEmail(p.to, "securityAlert", templates.securityAlert(await brand(), p));
}

export function emailStatus() {
  const p = getProvider();
  return { provider: p.name, configured: p.configured, from: env.EMAIL_FROM, adminEmailEnv: Boolean(env.ADMIN_EMAIL) };
}
