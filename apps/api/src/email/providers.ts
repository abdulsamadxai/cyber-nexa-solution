import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export interface OutgoingEmail {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendResult {
  id?: string;
}

export interface EmailProvider {
  name: string;
  configured: boolean;
  send(msg: OutgoingEmail): Promise<SendResult>;
}

const toList = (to: string | string[]) => (Array.isArray(to) ? to : [to]);

const resend: EmailProvider = {
  name: "resend",
  get configured() {
    return Boolean(env.RESEND_API_KEY);
  },
  async send(msg) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: msg.from,
        to: toList(msg.to),
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) throw new Error(`Resend ${res.status}: ${body.message ?? "request failed"}`);
    return { id: body.id };
  },
};

const sendgrid: EmailProvider = {
  name: "sendgrid",
  get configured() {
    return Boolean(env.SENDGRID_API_KEY);
  },
  async send(msg) {
    const m = /^(.*)<(.+)>$/.exec(msg.from.trim());
    const from = m ? { name: m[1].trim(), email: m[2].trim() } : { email: msg.from };
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: toList(msg.to).map((email) => ({ email })) }],
        from,
        ...(msg.replyTo ? { reply_to: { email: msg.replyTo } } : {}),
        subject: msg.subject,
        content: [
          { type: "text/plain", value: msg.text },
          { type: "text/html", value: msg.html },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`SendGrid ${res.status}: ${await res.text().catch(() => "")}`);
    return { id: res.headers.get("x-message-id") ?? undefined };
  },
};

let transporter: Transporter | undefined;
const smtp: EmailProvider = {
  name: "smtp",
  get configured() {
    return Boolean(env.SMTP_HOST);
  },
  async send(msg) {
    transporter ??= nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
    const info = await transporter.sendMail({ ...msg, to: toList(msg.to) });
    return { id: info.messageId };
  },
};

/** Development provider: prints emails to the API console instead of sending. */
const consoleProvider: EmailProvider = {
  name: "console",
  configured: true,
  async send(msg) {
    logger.info(`✉  [console email] to=${toList(msg.to).join(", ")} subject="${msg.subject}"\n${msg.text}\n`);
    return { id: `console-${Date.now()}` };
  },
};

export function getProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case "resend":
      return resend;
    case "sendgrid":
      return sendgrid;
    case "smtp":
      return smtp;
    default:
      return consoleProvider;
  }
}
