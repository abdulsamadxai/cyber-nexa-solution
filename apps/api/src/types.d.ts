import type { Role } from "./generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: { id: string; email: string; name: string; role: Role; permissions: readonly string[] };
      sessionId?: string;
    }
  }
}

export {};
