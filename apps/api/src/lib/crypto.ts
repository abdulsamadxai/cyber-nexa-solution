import crypto from "node:crypto";
import { hash, verify, Algorithm } from "@node-rs/argon2";
import { env } from "../config/env.js";

const ARGON = { algorithm: Algorithm.Argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const hashPassword = (password: string) => hash(password, ARGON);

export async function verifyPassword(passwordHash: string | null | undefined, password: string) {
  if (!passwordHash) return false;
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** Keeps login timing roughly constant when the email doesn't exist. */
let dummyHash: string | undefined;
export async function burnPasswordCheck(password: string) {
  dummyHash ??= await hashPassword("timing-safe-dummy-password");
  await verifyPassword(dummyHash, password);
}

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");
export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
export const hmac = (value: string) => crypto.createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export const passwordPolicy =
  "Use at least 10 characters, including an uppercase letter, a lowercase letter and a number.";
export function isStrongPassword(pw: string) {
  return pw.length >= 10 && pw.length <= 128 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw);
}
