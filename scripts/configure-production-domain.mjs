// Update domain-related configuration only. Preserve email, providers, users and data.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { management, saveCredentials } from "./lib/supabase-management.mjs";
import { productionOrigin } from "../supabase/functions/_shared/site.ts";
import {
  portalOrigins,
  portalAuthRedirects,
} from "../supabase/functions/_shared/origins.ts";

const before = await management("/config/auth");
await management(
  "/config/auth",
  {
    site_url: productionOrigin,
    uri_allow_list: portalAuthRedirects.join(","),
  },
  "PATCH",
);
await management("/secrets", [
  { name: "PORTAL_SITE_URL", value: productionOrigin },
  { name: "PORTAL_ALLOWED_ORIGINS", value: portalOrigins.join(",") },
]);
await saveCredentials({ PORTAL_SITE_URL: productionOrigin });
const after = await management("/config/auth");
assert.equal(after.site_url, productionOrigin);
assert.deepEqual(
  after.uri_allow_list.split(",").sort(),
  [...portalAuthRedirects].sort(),
);
for (const key of [
  "mailer_autoconfirm",
  "smtp_host",
  "external_google_enabled",
  "disable_signup",
])
  assert.equal(
    after[key],
    before[key],
    `Unrelated Auth setting changed: ${key}`,
  );
const result = {
  checkedAt: new Date().toISOString(),
  siteUrl: after.site_url,
  authRedirects: portalAuthRedirects,
  allowedOrigins: portalOrigins,
  emailAndProviderSettingsPreserved: true,
  edgeSecretsUpdated: ["PORTAL_SITE_URL", "PORTAL_ALLOWED_ORIGINS"],
};
const output =
  process.env.LDGENX_QA_OUTPUT ?? "docs/production-domain-2026-10-28";
await mkdir(output, { recursive: true });
await writeFile(
  `${output}/supabase-domain-after.json`,
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  `Supabase Auth and Edge domain settings verified for ${productionOrigin}. Email/provider settings preserved.`,
);
