/**
 * Creates (or promotes) a SUPER_ADMIN account.
 *
 *   npm run create-admin                          # interactive prompts
 *   npm run create-admin -- --email you@co.com --name "Your Name"   # password prompted
 *
 * For CI/automated setups you may pass ADMIN_PASSWORD via the environment
 * (never on the command line, where it would be stored in shell history).
 */
import readline from "node:readline";
import { Writable } from "node:stream";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword, isStrongPassword, passwordPolicy } from "../src/lib/crypto.js";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

let muted = false;
const out = new Writable({
  write(chunk, _enc, cb) {
    if (!muted) process.stdout.write(chunk);
    cb();
  },
});
const rl = readline.createInterface({ input: process.stdin, output: out, terminal: true });
const ask = (q: string, hidden = false) =>
  new Promise<string>((resolve) => {
    process.stdout.write(q);
    muted = hidden;
    rl.question("", (a) => {
      muted = false;
      if (hidden) process.stdout.write("\n");
      resolve(a.trim());
    });
  });

async function main() {
  console.log("\nCyber Nexa Solution — create super admin\n");
  const email = (arg("email") ?? (await ask("Email: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address.");
  const name = arg("name") ?? (await ask("Full name: "));
  if (name.length < 2) throw new Error("Name is required.");

  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    password = await ask("Password: ", true);
    const confirm = await ask("Confirm password: ", true);
    if (password !== confirm) throw new Error("Passwords do not match.");
  }
  if (!isStrongPassword(password)) throw new Error(passwordPolicy);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: "SUPER_ADMIN", emailVerifiedAt: new Date(), isActive: true },
    update: { name, passwordHash, role: "SUPER_ADMIN", emailVerifiedAt: new Date(), isActive: true, deletedAt: null, lockedUntil: null, failedLoginCount: 0 },
  });
  await prisma.auditLog.create({ data: { userId: user.id, action: "user.super_admin_created", resource: "user", resourceId: user.id, meta: { via: "cli" } } });
  console.log(`\n✔ Super admin ready: ${email}\n  Sign in at /admin/login\n`);
}

main()
  .catch((e) => {
    console.error(`\n✖ ${e instanceof Error ? e.message : e}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
