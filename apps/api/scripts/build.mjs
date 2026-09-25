// Bundles the API into dist/ with esbuild. Third-party packages stay external
// (installed from node_modules at runtime); the generated Prisma client is bundled.
import { build } from "esbuild";

await build({
  entryPoints: ["src/server.ts", "scripts/create-admin.ts"],
  outdir: "dist",
  outbase: ".",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  packages: "external",
  sourcemap: true,
  logLevel: "info",
  entryNames: "[name]",
});
