import { z } from "zod";
import { prisma } from "./prisma.js";

/**
 * Site settings are stored as one JSON document per group in `SiteSetting`.
 * Every group has a zod schema (validation for admin updates) and defaults.
 */
const url = z.string().trim().max(500).url().or(z.literal(""));
// Image fields may be an absolute URL or a root-relative path like /logo.png
const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/"), "Enter a URL or a path starting with /");
const text = (max = 300) => z.string().trim().max(max);

export const settingSchemas = {
  general: z.object({
    companyName: text(120).min(1),
    tagline: text(200),
    logoUrl: imageUrl,
    faviconUrl: imageUrl,
    email: z.string().trim().email().or(z.literal("")),
    phone: text(60),
    whatsapp: text(40),
    whatsapp2: text(40),
    address: text(300),
    footerText: text(400),
    googleAnalyticsId: z.string().trim().regex(/^(G-[A-Z0-9]+)?$/i, "Use a GA4 ID like G-XXXXXXX").or(z.literal("")),
    maintenanceMode: z.boolean(),
    maintenanceMessage: text(400),
  }),
  social: z.object({
    linkedin: url,
    github: url,
    x: url,
    facebook: url,
    instagram: url,
    youtube: url,
  }),
  seo: z.object({
    defaultTitle: text(120).min(1),
    defaultDescription: text(300),
    ogImage: imageUrl,
  }),
  hero: z.object({
    heading: text(160).min(1),
    description: text(400),
    primaryCtaLabel: text(40),
    primaryCtaUrl: text(200),
    secondaryCtaLabel: text(40),
    secondaryCtaUrl: text(200),
  }),
  about: z.object({
    heading: text(160),
    intro: text(600),
    body: text(8000),
    mission: text(600),
    values: z.array(z.object({ title: text(80), description: text(300) })).max(12),
  }),
  email: z.object({
    notificationEmail: z.string().trim().email().or(z.literal("")),
    companyEmail: z.string().trim().email().or(z.literal("")),
    senderName: text(80),
    replyTo: z.string().trim().email().or(z.literal("")),
    notifyOnContact: z.boolean(),
    notifyOnProjectInquiry: z.boolean(),
    notifyOnNewsletter: z.boolean(),
    sendCustomerConfirmation: z.boolean(),
    newsletterDoubleOptIn: z.boolean(),
  }),
  inquiry: z.object({
    projectTypes: z.array(text(60).min(1)).min(1).max(30),
    budgetOptions: z.array(text(60).min(1)).min(1).max(20),
    timelineOptions: z.array(text(60).min(1)).min(1).max(20),
    heardFromOptions: z.array(text(60).min(1)).min(1).max(20),
  }),
};

export type SettingGroup = keyof typeof settingSchemas;
export type Settings = { [K in SettingGroup]: z.infer<(typeof settingSchemas)[K]> };
export const settingGroups = Object.keys(settingSchemas) as SettingGroup[];
export const PUBLIC_GROUPS: SettingGroup[] = ["general", "social", "seo", "hero", "about", "inquiry"];

export const defaultSettings: Settings = {
  general: {
    companyName: "Cyber Nexa Solution",
    tagline: "Technology Built Around Your Business.",
    logoUrl: "",
    faviconUrl: "",
    email: "cybernexasolution@gmail.com",
    phone: "",
    whatsapp: "+92 330 5961567",
    whatsapp2: "+92 319 5209215",
    address: "",
    footerText:
      "Cyber Nexa Solution designs and builds websites, applications, AI solutions and business software for organisations that want technology they can trust.",
    googleAnalyticsId: "",
    maintenanceMode: false,
    maintenanceMessage: "We're making some improvements and will be back shortly.",
  },
  social: { linkedin: "", github: "", x: "", facebook: "", instagram: "", youtube: "" },
  seo: {
    defaultTitle: "Cyber Nexa Solution — Technology Built Around Your Business",
    defaultDescription:
      "Websites, web and mobile applications, AI solutions, automation and custom business software, designed around how your business actually works.",
    ogImage: "/logo.png",
  },
  hero: {
    heading: "Technology Built Around Your Business.",
    description:
      "We design and build websites, applications, AI solutions, automation systems, and custom software that help businesses work smarter and grow.",
    primaryCtaLabel: "Start a Project",
    primaryCtaUrl: "/start-a-project",
    secondaryCtaLabel: "Explore Services",
    secondaryCtaUrl: "/services",
  },
  about: {
    heading: "A technology partner that starts with your business",
    intro:
      "At Cyber Nexa Solution, trust is the foundation of every engagement. We build what you actually need, explain it honestly, and stand behind it long after launch.",
    body:
      "We work with businesses that have outgrown spreadsheets, disconnected tools and off-the-shelf software that almost fits. Before we write code, we learn how your team works: where time is lost, where data goes missing, and what a better day looks like for the people using the system.\n\nFrom there we design and build the right thing — a website, an internal system, a mobile app, an AI assistant or an integration that ties everything together — and we stay involved as your business changes.",
    mission:
      "To make dependable, well-built technology accessible to growing businesses, delivered with honesty and care.",
    values: [
      { title: "Trust", description: "Clear estimates, honest advice and no surprises. We say what we will do, then do it." },
      { title: "Understanding", description: "We learn your operations before proposing a solution." },
      { title: "Quality", description: "Secure, maintainable software that keeps working after launch." },
      { title: "Partnership", description: "Support, improvements and advice long after the first release." },
    ],
  },
  email: {
    notificationEmail: "cybernexasolution@gmail.com",
    companyEmail: "cybernexasolution@gmail.com",
    senderName: "Cyber Nexa Solution",
    replyTo: "cybernexasolution@gmail.com",
    notifyOnContact: true,
    notifyOnProjectInquiry: true,
    notifyOnNewsletter: false,
    sendCustomerConfirmation: true,
    newsletterDoubleOptIn: true,
  },
  inquiry: {
    projectTypes: [
      "Website",
      "Web Application",
      "Mobile App",
      "AI Solution",
      "AI Chatbot",
      "Custom Software",
      "CRM",
      "ERP",
      "POS",
      "Automation",
      "API Integration",
      "Other",
    ],
    budgetOptions: [
      "Under $2,000",
      "$2,000 – $5,000",
      "$5,000 – $15,000",
      "$15,000 – $50,000",
      "$50,000+",
      "Not sure yet",
    ],
    timelineOptions: ["As soon as possible", "Within 1 month", "1 – 3 months", "3 – 6 months", "Flexible"],
    heardFromOptions: ["Google search", "Social media", "Referral", "LinkedIn", "Event", "Other"],
  },
};

let cache: { at: number; value: Settings } | null = null;
const TTL = 30_000;

export async function getSettings(): Promise<Settings> {
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  const rows = await prisma.siteSetting.findMany();
  const value = structuredClone(defaultSettings) as Settings;
  for (const row of rows) {
    const group = row.key as SettingGroup;
    if (!(group in settingSchemas)) continue;
    // Merge stored values over defaults so newly added keys always have a value.
    (value as Record<string, unknown>)[group] = { ...defaultSettings[group], ...(row.value as object) };
  }
  cache = { at: Date.now(), value };
  return value;
}

export async function updateSettingGroup<K extends SettingGroup>(group: K, input: unknown): Promise<Settings[K]> {
  const current = (await getSettings())[group];
  const merged = settingSchemas[group].parse({ ...current, ...(input as object) });
  await prisma.siteSetting.upsert({
    where: { key: group },
    create: { key: group, value: merged as object },
    update: { value: merged as object },
  });
  cache = null;
  return merged as Settings[K];
}

export async function getPublicSettings() {
  const s = await getSettings();
  return Object.fromEntries(PUBLIC_GROUPS.map((g) => [g, s[g]]));
}

export function clearSettingsCache() {
  cache = null;
}
