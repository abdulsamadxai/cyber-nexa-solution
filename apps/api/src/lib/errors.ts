export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, fields?: Record<string, string>) =>
  new AppError(400, "BAD_REQUEST", message, fields);
export const unauthorized = (message = "Please sign in to continue.") => new AppError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "You don't have permission to do that.") => new AppError(403, "FORBIDDEN", message);
export const notFound = (what = "Resource") => new AppError(404, "NOT_FOUND", `${what} not found.`);
export const conflict = (message: string, fields?: Record<string, string>) =>
  new AppError(409, "CONFLICT", message, fields);
export const tooMany = (message = "Too many requests. Please wait a moment and try again.") =>
  new AppError(429, "RATE_LIMITED", message);
