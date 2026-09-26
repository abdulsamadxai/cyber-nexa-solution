import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "apps/api/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const bool = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === "" ? def : ["1", "true", "yes", "on"].includes(v.toLowerCase())));

const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("postgresql://neondb_owner:npg_fnldmCFw0tp7@ep-broad-wildflower-b5kagywt-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters").default("e9b2c8a7f1d4365890abcedf1234567890abcdef1234567890abcdef12345678"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  BACKEND_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGINS: optional,
  TRUST_PROXY: z.coerce.number().default(0),

  COOKIE_DOMAIN: optional,
  COOKIE_SECURE: bool(false),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  SESSION_TTL_DAYS: z.coerce.number().default(7),

  EMAIL_PROVIDER: z.enum(["resend", "smtp", "sendgrid", "console"]).default("console"),
  EMAIL_FROM: z.string().default("Cyber Nexa Solution <cybernexasolution@gmail.com>"),
  ADMIN_EMAIL: optional,
  RESEND_API_KEY: optional,
  SENDGRID_API_KEY: optional,
  SMTP_HOST: optional,
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: bool(false),
  SMTP_USER: optional,
  SMTP_PASSWORD: optional,

  STORAGE_PROVIDER: z.enum(["local", "s3", "cloudinary"]).default("local"),
  UPLOAD_MAX_MB: z.coerce.number().default(10),
  S3_BUCKET: optional,
  S3_REGION: z.string().default("auto"),
  S3_ENDPOINT: optional,
  S3_ACCESS_KEY_ID: optional,
  S3_SECRET_ACCESS_KEY: optional,
  S3_PUBLIC_URL: optional,
  S3_FORCE_PATH_STYLE: bool(false),
  CLOUDINARY_CLOUD_NAME: optional,
  CLOUDINARY_API_KEY: optional,
  CLOUDINARY_API_SECRET: optional,
  CLOUDINARY_FOLDER: z.string().default("cybernexa"),

  TURNSTILE_SECRET_KEY: optional,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("\n✖ Invalid environment configuration:\n");
  for (const issue of parsed.error.issues) console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
  console.error("\nCopy .env.example to apps/api/.env and fill in the values.\n");
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
