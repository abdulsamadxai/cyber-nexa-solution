import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { contentRouter } from "./content.js";
import { inquiriesRouter } from "./inquiries.js";
import { contactsRouter } from "./contacts.js";
import { dashboardRouter } from "./dashboard.js";
import { systemRouter } from "./system.js";

export const adminRouter = Router();

// Every admin route requires a signed-in user; each handler then checks a specific permission.
adminRouter.use(requireAuth);
adminRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/inquiries", inquiriesRouter);
adminRouter.use("/contacts", contactsRouter);
adminRouter.use("/content", requirePermission("content.read"), contentRouter);
adminRouter.use("/", systemRouter);
