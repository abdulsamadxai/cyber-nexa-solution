/**
 * Typed API client. Talks to the Cyber Nexa backend using cookie sessions and a
 * double-submit CSRF token. All admin/auth mutations attach the token from the
 * `as_csrf` cookie automatically.
 */
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export interface ApiErrorShape {
  code: string;
  message: string;
  fields?: Record<string, string>;
  requestId?: string;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

let csrfToken: string | null = null;

async function ensureCsrf(): Promise<string> {
  const existing = readCookie("as_csrf");
  if (existing) return decodeURIComponent(existing);
  if (csrfToken) return csrfToken;
  const res = await fetch(`${BASE}/api/auth/csrf`, { credentials: "include" });
  const json = await res.json();
  csrfToken = json.data.csrfToken;
  return csrfToken!;
}

type Options = Omit<RequestInit, "body"> & { body?: unknown; params?: Record<string, string | number | boolean | undefined | null> };

export async function api<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const { body, params, headers, method = "GET", ...rest } = options;
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));

  const h = new Headers(headers);
  const isMutation = method !== "GET" && method !== "HEAD";
  if (isMutation && !(body instanceof FormData)) h.set("Content-Type", "application/json");
  if (isMutation) h.set("X-CSRF-Token", await ensureCsrf());

  const res = await fetch(url.toString().replace(window.location.origin, BASE || ""), {
    method,
    credentials: "include",
    headers: h,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) throw new ApiError(res.status, "HTTP_ERROR", res.statusText);
    return (await res.text()) as unknown as T;
  }
  const json = await res.json();
  if (!res.ok) {
    const err = (json.error ?? {}) as ApiErrorShape;
    throw new ApiError(res.status, err.code ?? "ERROR", err.message ?? "Something went wrong.", err.fields);
  }
  return json as T;
}

export interface Paged<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number } & Record<string, unknown>;
}
export interface Wrapped<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export const downloadUrl = (path: string) => `${BASE}${path}`;
