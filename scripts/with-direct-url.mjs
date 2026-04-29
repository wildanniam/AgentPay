import { spawn } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error("Usage: node scripts/with-direct-url.mjs <command> [...args]");
  process.exit(1);
}

if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL is required in .env for direct database commands.");
  process.exit(1);
}

const child = spawn(command, args, {
  env: {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL
  },
  shell: true,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
