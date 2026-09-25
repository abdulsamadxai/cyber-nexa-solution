import type { Request } from "express";
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  sort: z.string().trim().max(50).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function paginate(p: Pagination) {
  return { skip: (p.page - 1) * p.pageSize, take: p.pageSize };
}

export function pageMeta(p: Pagination, total: number) {
  return { page: p.page, pageSize: p.pageSize, total, totalPages: Math.max(1, Math.ceil(total / p.pageSize)) };
}

/** Parse a comma-separated list of allowed sort fields safely. */
export function sortBy<T extends string>(field: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(field as T) ? (field as T) : fallback;
}

export function clientIp(req: Request) {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

export function param(req: Request, name: string) {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : String(v ?? "");
}
