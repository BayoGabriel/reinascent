/**
 * One-time administrator bootstrap (npm run admin:create).
 *
 * Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_DISPLAY_NAME
 * environment variables, or an interactive prompt that never echoes the
 * password. The script reuses the app's env validation, user schema, and
 * service layer, and is safe to rerun: it never overwrites an existing
 * admin and refuses to elevate a non-admin account. It prints only safe
 * outcome messages — never the password or hash.
 *
 * Run with the react-server condition so "server-only" modules resolve:
 *   node --conditions=react-server --import tsx scripts/create-admin.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });

import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

import { adminBootstrapSchema } from "@/features/auth/schemas";
import { getMongoClient } from "@/server/db/mongodb";
import { createInitialAdmin } from "@/server/services/user.service";

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  if (hidden) {
    // Suppress echo by swallowing everything except line terminators.
    const writer = rl as unknown as { _writeToOutput: (c: string) => void };
    writer._writeToOutput = (chunk: string) => {
      if (chunk === "\n" || chunk === "\r" || chunk === "\r\n") {
        stdout.write(chunk);
      }
    };
  }
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<number> {
  const email = process.env.ADMIN_EMAIL ?? (await ask("Admin email: "));
  const password =
    process.env.ADMIN_PASSWORD ?? (await ask("Admin password: ", true));
  const displayName = process.env.ADMIN_DISPLAY_NAME ?? "Administrator";

  const parsed = adminBootstrapSchema.safeParse({ email, password, displayName });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      console.error(`Invalid ${issue.path.join(".")}: ${issue.message}`);
    }
    return 1;
  }

  const result = await createInitialAdmin(parsed.data);
  switch (result.outcome) {
    case "created":
      console.log(`Administrator created for ${result.email}.`);
      return 0;
    case "already-admin":
      console.log("An administrator already exists for that email. No changes made.");
      return 0;
    case "refused-existing-user":
      console.error(
        "A non-admin account already uses that email. Refusing to elevate it.",
      );
      return 1;
  }
}

main()
  .catch(() => {
    console.error("Failed to create administrator. Check configuration and database connectivity.");
    process.exitCode = 1;
  })
  .then(async (code) => {
    if (typeof code === "number") process.exitCode = code;
    try {
      const client = await getMongoClient();
      await client.close();
    } catch {
      // Connection may never have opened; nothing to close.
    }
  });
