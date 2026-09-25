import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from cwd, apps/api/.env, or root .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "apps/api/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/amanah",
  },
});

