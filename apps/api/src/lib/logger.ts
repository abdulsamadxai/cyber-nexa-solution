import { env } from "../config/env.js";

const levels = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof levels;
const threshold = levels[env.LOG_LEVEL];

function write(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (levels[level] < threshold) return;
  const line = { t: new Date().toISOString(), level, msg, ...meta };
  const out = level === "error" || level === "warn" ? console.error : console.log;
  out(env.NODE_ENV === "production" ? JSON.stringify(line) : `[${level}] ${msg}${meta ? " " + JSON.stringify(meta) : ""}`);
}

export const logger = {
  debug: (m: string, meta?: Record<string, unknown>) => write("debug", m, meta),
  info: (m: string, meta?: Record<string, unknown>) => write("info", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => write("warn", m, meta),
  error: (m: string, meta?: Record<string, unknown>) => write("error", m, meta),
};
