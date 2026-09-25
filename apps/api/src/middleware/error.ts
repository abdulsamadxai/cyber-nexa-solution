import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { ZodError } from "zod";
import multer from "multer";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { Prisma } from "../lib/prisma.js";

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.requestId = crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Endpoint not found.", requestId: req.requestId } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const rid = req.requestId;

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_";
      fields[key] ??= issue.message;
    }
    return res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Please check the highlighted fields.", fields, requestId: rid },
    });
  }

  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message, fields: err.fields, requestId: rid } });
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "That file is too large." : "The upload could not be processed.";
    return res.status(400).json({ error: { code: "UPLOAD_ERROR", message, requestId: rid } });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | string | undefined) ?? "";
      const field = Array.isArray(target) ? target[0] : String(target).split("_").slice(1, -1).join("_") || "field";
      return res.status(409).json({
        error: {
          code: "CONFLICT",
          message: `That ${field} is already in use.`,
          fields: { [field]: `This ${field} is already in use` },
          requestId: rid,
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Record not found.", requestId: rid } });
    }
  }

  if (err && typeof err === "object" && "type" in err && (err as { type: string }).type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "BAD_JSON", message: "Malformed JSON body.", requestId: rid } });
  }
  if (err && typeof err === "object" && "type" in err && (err as { type: string }).type === "entity.too.large") {
    return res.status(413).json({ error: { code: "TOO_LARGE", message: "Request body is too large.", requestId: rid } });
  }

  // Unknown error: log everything, reveal nothing.
  logger.error("unhandled error", {
    requestId: rid,
    method: req.method,
    path: req.path,
    err: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
  });
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong on our side. Please try again.", requestId: rid },
  });
}
