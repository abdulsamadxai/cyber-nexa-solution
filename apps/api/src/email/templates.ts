/**
 * Branded transactional email templates. All dynamic values are HTML-escaped.
 * Layout uses tables + inline styles for broad email-client support.
 */
export const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const nl2br = (v: string) => esc(v).replace(/\n/g, "<br>");

const C = { ink: "#0E1B2C", green: "#0F7B6C", paper: "#F4F6F5", mist: "#DDE6E3", muted: "#5B6B7A" };

export interface Brand {
  companyName: string;
  siteUrl: string;
  logoUrl?: string;
  address?: string;
  email?: string;
}

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

function layout(brand: Brand, opts: { preheader: string; heading: string; body: string; cta?: { label: string; url: string }; footerNote?: string }) {
  const logo = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="${esc(brand.companyName)}" height="32" style="display:block;height:32px">`
    : `<span style="font-size:18px;font-weight:700;color:${C.ink};letter-spacing:-0.2px">${esc(brand.companyName)}</span>`;
  const cta = opts.cta
    ? `<tr><td style="padding:8px 0 24px"><a href="${esc(opts.cta.url)}" style="display:inline-block;background:${C.green};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px">${esc(opts.cta.label)}</a></td></tr>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.ink}">
<span style="display:none!important;opacity:0;height:0;width:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">
<tr><td style="padding:0 4px 18px">${logo}</td></tr>
<tr><td style="background:#ffffff;border-radius:14px;border:1px solid ${C.mist};overflow:hidden">
<div style="height:4px;background:${C.green}"></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 32px 8px">
<tr><td><h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${C.ink}">${esc(opts.heading)}</h1></td></tr>
<tr><td style="font-size:15px;line-height:1.65;color:#223246;padding-bottom:16px">${opts.body}</td></tr>
${cta}
</table></td></tr>
<tr><td style="padding:20px 8px;font-size:12px;line-height:1.6;color:${C.muted}">
${opts.footerNote ? `${opts.footerNote}<br><br>` : ""}
<strong style="color:${C.ink}">${esc(brand.companyName)}</strong> · Technology Built Around Your Business<br>
${brand.address ? `${esc(brand.address)}<br>` : ""}<a href="${esc(brand.siteUrl)}" style="color:${C.green}">${esc(brand.siteUrl.replace(/^https?:\/\//, ""))}</a>
</td></tr></table></td></tr></table></body></html>`;
}

function detailsTable(rows: [string, unknown][]) {
  const body = rows
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:${C.muted};font-size:13px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;font-size:14px;color:${C.ink}">${nl2br(String(v))}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid ${C.mist};border-bottom:1px solid ${C.mist};margin:8px 0 16px">${body}</table>`;
}

const textRows = (rows: [string, unknown][]) =>
  rows
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

export interface InquiryData {
  number: number;
  type: "CONTACT" | "PROJECT";
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  country?: string | null;
  subject?: string | null;
  message: string;
  projectType?: string | null;
  budget?: string | null;
  timeline?: string | null;
  requiredFeatures?: string | null;
  referenceUrl?: string | null;
  heardFrom?: string | null;
}

export const inquiryRef = (n: number) => `AS${n}`;

function inquiryRows(i: InquiryData): [string, unknown][] {
  return [
    ["Inquiry", `#${inquiryRef(i.number)}`],
    ["Name", i.name],
    ["Email", i.email],
    ["Phone", i.phone],
    ["Company", i.company],
    ["Country", i.country],
    ["Subject", i.subject],
    ["Project type", i.projectType],
    ["Budget", i.budget],
    ["Timeline", i.timeline],
    ["Required features", i.requiredFeatures],
    ["Reference URL", i.referenceUrl],
    ["Heard about us", i.heardFrom],
    ["Message", i.message],
  ];
}

export const templates = {
  /** Admin: new contact form message */
  contactNotification(brand: Brand, i: InquiryData, adminUrl: string): Rendered {
    const rows = inquiryRows(i);
    return {
      subject: `New contact message from ${i.name} — #${inquiryRef(i.number)}`,
      html: layout(brand, {
        preheader: `${i.name} sent a message through the website.`,
        heading: "New contact message",
        body: `<p style="margin:0 0 8px">${esc(i.name)} sent a message through the contact form.</p>${detailsTable(rows)}`,
        cta: { label: "Open in admin", url: adminUrl },
      }),
      text: `New contact message\n\n${textRows(rows)}\n\nOpen in admin: ${adminUrl}`,
    };
  },

  /** Admin: new "Start a project" inquiry */
  projectInquiryNotification(brand: Brand, i: InquiryData, adminUrl: string): Rendered {
    const rows = inquiryRows(i);
    return {
      subject: `New project inquiry: ${i.projectType ?? "Project"} — #${inquiryRef(i.number)}`,
      html: layout(brand, {
        preheader: `${i.name}${i.company ? ` from ${i.company}` : ""} wants to start a project.`,
        heading: "New project inquiry",
        body: `<p style="margin:0 0 8px">${esc(i.name)}${i.company ? ` from ${esc(i.company)}` : ""} submitted a project inquiry.</p>${detailsTable(rows)}`,
        cta: { label: "Review inquiry", url: adminUrl },
      }),
      text: `New project inquiry\n\n${textRows(rows)}\n\nReview: ${adminUrl}`,
    };
  },

  /** Customer: confirmation for either form */
  inquiryConfirmation(brand: Brand, i: InquiryData): Rendered {
    const ref = inquiryRef(i.number);
    const isProject = i.type === "PROJECT";
    const summary: [string, unknown][] = isProject
      ? [
          ["Reference", `#${ref}`],
          ["Project type", i.projectType],
          ["Budget", i.budget],
          ["Timeline", i.timeline],
        ]
      : [
          ["Reference", `#${ref}`],
          ["Subject", i.subject],
        ];
    return {
      subject: `We received your ${isProject ? "project inquiry" : "message"} — #${ref}`,
      html: layout(brand, {
        preheader: `Your reference is #${ref}. We'll reply within one business day.`,
        heading: `Thank you, ${i.name.split(" ")[0]}`,
        body: `<p style="margin:0 0 12px">We've received your ${isProject ? "project inquiry" : "message"} and a member of our team will reply within one business day.</p>${detailsTable(summary)}<p style="margin:0">If you need to add anything, reply to this email and keep the reference number in the subject.</p>`,
        footerNote: "You're receiving this email because you contacted us through our website.",
      }),
      text: `Thank you, ${i.name}.\n\nWe've received your ${isProject ? "project inquiry" : "message"} and will reply within one business day.\n\n${textRows(summary)}\n\n${brand.companyName}`,
    };
  },

  /** Customer: status update or personal message from the team about an inquiry */
  inquiryUpdate(brand: Brand, p: { name: string; number: number; subject: string; message: string; senderName: string }): Rendered {
    return {
      subject: `${p.subject} — #${inquiryRef(p.number)}`,
      html: layout(brand, {
        preheader: p.message.slice(0, 120),
        heading: p.subject,
        body: `<p style="margin:0 0 12px">Hi ${esc(p.name.split(" ")[0])},</p><p style="margin:0 0 16px">${nl2br(p.message)}</p><p style="margin:0">${esc(p.senderName)}<br><span style="color:${C.muted}">${esc(brand.companyName)}</span></p>`,
        footerNote: `Reference #${inquiryRef(p.number)}. Reply to this email to continue the conversation.`,
      }),
      text: `Hi ${p.name},\n\n${p.message}\n\n${p.senderName}\n${brand.companyName}\nReference #${inquiryRef(p.number)}`,
    };
  },

  adminInvitation(brand: Brand, p: { name: string; inviter: string; role: string; url: string }): Rendered {
    return {
      subject: `You've been invited to the ${brand.companyName} admin`,
      html: layout(brand, {
        preheader: `${p.inviter} invited you as ${p.role}.`,
        heading: "You're invited",
        body: `<p style="margin:0 0 12px">Hi ${esc(p.name)},</p><p style="margin:0">${esc(p.inviter)} invited you to the ${esc(brand.companyName)} admin as <strong>${esc(p.role)}</strong>. Set your password to activate your account. This link expires in 72 hours.</p>`,
        cta: { label: "Accept invitation", url: p.url },
        footerNote: "If you weren't expecting this invitation, you can ignore this email.",
      }),
      text: `${p.inviter} invited you to the ${brand.companyName} admin as ${p.role}.\n\nAccept: ${p.url}\n\nThis link expires in 72 hours.`,
    };
  },

  passwordReset(brand: Brand, p: { name: string; url: string }): Rendered {
    return {
      subject: "Reset your password",
      html: layout(brand, {
        preheader: "Use this link to choose a new password. It expires in 1 hour.",
        heading: "Reset your password",
        body: `<p style="margin:0 0 12px">Hi ${esc(p.name)},</p><p style="margin:0">We received a request to reset the password for your admin account. This link expires in 1 hour and can be used once.</p>`,
        cta: { label: "Choose a new password", url: p.url },
        footerNote: "If you didn't request this, you can ignore this email — your password won't change.",
      }),
      text: `Reset your password: ${p.url}\n\nThis link expires in 1 hour. If you didn't request it, ignore this email.`,
    };
  },

  emailVerification(brand: Brand, p: { name: string; url: string }): Rendered {
    return {
      subject: "Verify your email address",
      html: layout(brand, {
        preheader: "Confirm your email to finish setting up your account.",
        heading: "Verify your email",
        body: `<p style="margin:0 0 12px">Hi ${esc(p.name)},</p><p style="margin:0">Confirm this email address to activate your admin account. The link expires in 24 hours.</p>`,
        cta: { label: "Verify email", url: p.url },
      }),
      text: `Verify your email: ${p.url}`,
    };
  },

  newsletterConfirmation(brand: Brand, p: { confirmUrl: string; unsubscribeUrl: string }): Rendered {
    return {
      subject: `Confirm your subscription to ${brand.companyName}`,
      html: layout(brand, {
        preheader: "One click to confirm your subscription.",
        heading: "Confirm your subscription",
        body: `<p style="margin:0">Confirm your email to receive occasional, practical technology insights from ${esc(brand.companyName)}. No spam — unsubscribe any time.</p>`,
        cta: { label: "Confirm subscription", url: p.confirmUrl },
        footerNote: `Didn't sign up? Ignore this email, or <a href="${esc(p.unsubscribeUrl)}" style="color:${C.green}">remove your address</a>.`,
      }),
      text: `Confirm your subscription: ${p.confirmUrl}\n\nNot you? Remove your address: ${p.unsubscribeUrl}`,
    };
  },

  newsletterSubscriberNotification(brand: Brand, p: { email: string }): Rendered {
    return {
      subject: `New newsletter subscriber: ${p.email}`,
      html: layout(brand, { preheader: p.email, heading: "New newsletter subscriber", body: `<p style="margin:0">${esc(p.email)} subscribed to the newsletter.</p>` }),
      text: `New newsletter subscriber: ${p.email}`,
    };
  },

  securityAlert(brand: Brand, p: { name: string; message: string }): Rendered {
    return {
      subject: "Security alert for your admin account",
      html: layout(brand, {
        preheader: p.message,
        heading: "Security alert",
        body: `<p style="margin:0 0 12px">Hi ${esc(p.name)},</p><p style="margin:0">${esc(p.message)}</p>`,
        footerNote: "If this wasn't you, reset your password and tell your administrator.",
      }),
      text: `Security alert: ${p.message}`,
    };
  },
};

export type TemplateName = keyof typeof templates;
