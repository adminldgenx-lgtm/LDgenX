// The repository is public: this looks for credentials in every tracked file, and with --history
// in every past commit. Prints where a match is, never the value. Run it before pushing.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const patterns = [
  ["Supabase access token", /sbp_[a-zA-Z0-9]{20,}/],
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{10,}/],
  ["JSON Web Token", /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}/],
  ["Google API key", /AIza[0-9A-Za-z_-]{30,}/],
  ["Google client secret", /GOCSPX-[A-Za-z0-9_-]{20,}/],
  ["Resend key", /\bre_[A-Za-z0-9]{20,}\b/],
  ["Private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["Database address with password", /postgres(?:ql)?:\/\/[^\s"'/:]+:[^\s"'@]+@/],
];
const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });
const findings = [];
for (const file of git("ls-files").split("\n").filter(Boolean)) {
  if (file === "package-lock.json") continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const [name, pattern] of patterns)
    if (pattern.test(text)) findings.push(`${file}: ${name}`);
}
if (process.argv.includes("--history")) {
  const history = git(
    "log",
    "--all",
    "-p",
    "--no-color",
    "--unified=0",
    "--",
    ".",
    ":(exclude)package-lock.json",
  );
  for (const [name, pattern] of patterns)
    if (pattern.test(history)) findings.push(`history: ${name}`);
}
if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("No credentials found.");
