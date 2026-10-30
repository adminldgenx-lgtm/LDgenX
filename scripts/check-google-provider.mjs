import assert from "node:assert/strict";
import { ref, credentials, management } from "./lib/supabase-management.mjs";
const config = await management("/config/auth");
assert.equal(config.external_google_enabled, true);
assert.equal(config.external_google_client_id, credentials.GOOGLE_CLIENT_ID);
const callback =
  "https://www.ldgenx.fr/espace/connexion?lang=fr&suite=%2Fadmin%2Fmessages";
const r = await fetch(
  `https://${ref}.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(callback)}&code_challenge=${"a".repeat(43)}&code_challenge_method=s256`,
  { redirect: "manual" },
);
assert([302, 303].includes(r.status));
const google = new URL(r.headers.get("location"));
assert.equal(google.hostname, "accounts.google.com");
assert.equal(
  google.searchParams.get("client_id"),
  credentials.GOOGLE_CLIENT_ID,
);
assert.equal(
  google.searchParams.get("redirect_uri"),
  `https://${ref}.supabase.co/auth/v1/callback`,
);
assert(google.searchParams.get("scope")?.includes("email"));
assert(
  google.searchParams.get("code_challenge") || google.searchParams.get("state"),
);
console.log(
  "Google provider: correct client, Supabase callback, basic identity scopes and OAuth redirect. Real account consent remains a browser step.",
);
