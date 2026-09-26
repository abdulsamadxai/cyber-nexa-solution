import type { Role } from "@prisma/client";

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
