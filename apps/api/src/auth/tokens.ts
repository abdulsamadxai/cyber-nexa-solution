import { prisma, type TokenType } from "../lib/prisma.js";
import { randomToken, sha256 } from "../lib/crypto.js";
import { badRequest } from "../lib/errors.js";

export async function createAuthToken(userId: string, type: TokenType, ttlMs: number) {
  // Only one live token of each type per user.
  await prisma.authToken.deleteMany({ where: { userId, type, usedAt: null } });
  const raw = randomToken(32);
  await prisma.authToken.create({
    data: { userId, type, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + ttlMs) },
  });
  return raw;
}

/** Validates and marks a token as used in one step. Throws a friendly error when invalid. */
export async function consumeAuthToken(raw: string, type: TokenType) {
  const token = await prisma.authToken.findUnique({ where: { tokenHash: sha256(raw) }, include: { user: true } });
  if (!token || token.type !== type || token.usedAt || token.expiresAt < new Date() || token.user.deletedAt) {
    throw badRequest("This link is invalid or has expired. Request a new one.");
  }
  const updated = await prisma.authToken.updateMany({ where: { id: token.id, usedAt: null }, data: { usedAt: new Date() } });
  if (updated.count !== 1) throw badRequest("This link has already been used.");
  return token.user;
}

export async function peekAuthToken(raw: string, type: TokenType) {
  const token = await prisma.authToken.findUnique({ where: { tokenHash: sha256(raw) }, include: { user: true } });
  if (!token || token.type !== type || token.usedAt || token.expiresAt < new Date()) return null;
  return token.user;
}
