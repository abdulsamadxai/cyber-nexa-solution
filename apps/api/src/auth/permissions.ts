import type { Role } from "../generated/prisma/client.js";

/**
 * Role-based access control. Permissions are enforced by `requirePermission`
 * on every admin API route; the frontend only uses them to hide navigation.
 */
export const PERMISSIONS = [
  "dashboard.view",
  "inquiries.read",
  "inquiries.write",
  "inquiries.delete",
  "contacts.read",
  "contacts.write",
  "contacts.delete",
  "content.read",
  "content.write",
  "content.delete",
  "media.read",
  "media.write",
  "media.delete",
  "notifications.read",
  "analytics.read",
  "emails.read",
  "subscribers.read",
  "subscribers.write",
  "settings.read",
  "settings.write",
  "users.read",
  "users.write",
  "audit.read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const all = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  // Everything, including managing admin users and their roles.
  SUPER_ADMIN: all,
  // Everything except creating/editing/removing admin users.
  ADMIN: all.filter((p) => p !== "users.write"),
  // Website content and media.
  EDITOR: [
    "dashboard.view",
    "content.read",
    "content.write",
    "content.delete",
    "media.read",
    "media.write",
    "media.delete",
    "notifications.read",
    "analytics.read",
  ],
  // Leads: inquiries, contacts and newsletter subscribers.
  SALES: [
    "dashboard.view",
    "inquiries.read",
    "inquiries.write",
    "contacts.read",
    "contacts.write",
    "notifications.read",
    "subscribers.read",
    "media.read",
  ],
};

export const can = (role: Role, permission: Permission) => ROLE_PERMISSIONS[role].includes(permission);

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  SALES: "Sales",
};
