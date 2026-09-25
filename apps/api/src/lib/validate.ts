import { z } from "zod";

export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

/** Shared zod helpers */
export const zs = {
  email: z.string().trim().toLowerCase().max(254).email("Enter a valid email address"),
  name: z.string().trim().min(2, "Enter your name").max(120),
  optionalText: (max = 300) =>
    z
      .string()
      .trim()
      .max(max)
      .optional()
      .nullable()
      .transform((v) => (v ? v : null)),
  optionalUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https?:\/\/|^\//.test(v), "Enter a full URL starting with https://"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(96)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  stringList: z.array(z.string().trim().min(1).max(200)).max(50).default([]),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+()\d\s.-]*$/, "Enter a valid phone number")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
};
