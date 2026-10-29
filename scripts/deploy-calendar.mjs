import { spawn } from "node:child_process";
import { credentials, ref } from "./lib/supabase-management.mjs";
const child = spawn(
  "npx",
  [
    "supabase",
    "functions",
    "deploy",
    "calendar",
    "--use-api",
    "--no-verify-jwt",
    "--project-ref",
    ref,
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: credentials.SUPABASE_ACCESS_TOKEN,
    },
  },
);
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
