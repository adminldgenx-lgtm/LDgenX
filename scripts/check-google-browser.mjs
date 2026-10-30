import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { credentials, ref } from "./lib/supabase-management.mjs";
const origin = process.argv[2] || "http://127.0.0.1:4174",
  checks = [],
  errors = [],
  b = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const locale of ["fr", "en"]) {
    const context = await b.newContext({
        viewport: { width: 390, height: 844 },
        locale: locale === "fr" ? "fr-FR" : "en-GB",
      }),
      p = await context.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    let handoff;
    p.on("request", (r) => {
      if (r.url().includes("/authorize"))
        console.log("OAUTH_SEND", new URL(r.url()).pathname);
    });
    await p.goto(
      `${origin}/admin/connexion?lang=${locale}&suite=%2Fadmin%2Fcontenus`,
    );
    const label =
      locale === "fr" ? "Continuer avec Google" : "Continue with Google";
    await expect(
      p.getByRole("button", { name: label, exact: true }),
    ).toBeVisible();
    await p.getByRole("button", { name: label, exact: true }).click();
    await p.waitForURL((u) => u.hostname === "accounts.google.com", {
      timeout: 30000,
    });
    handoff = new URL(p.url());
    await expect(p.locator("body")).not.toContainText("redirect_uri_mismatch");
    assert.equal(
      handoff.searchParams.get("client_id"),
      credentials.GOOGLE_CLIENT_ID,
    );
    assert.equal(
      handoff.searchParams.get("redirect_uri"),
      `https://${ref}.supabase.co/auth/v1/callback`,
    );
    assert(!handoff.searchParams.get("scope").includes("calendar"));
    assert.equal(handoff.searchParams.get("prompt"), "select_account");
    checks.push(
      `${locale}: mobile button starts real Supabase/Google PKCE handoff with identity scopes only`,
    );
    await p.goto(
      `${origin}/espace/connexion?lang=${locale}&error=access_denied&error_description=cancelled`,
    );
    await expect(p.getByRole("alert")).toContainText(
      locale === "fr" ? "annulée" : "cancelled",
    );
    await expect(
      p.getByRole("button", { name: label, exact: true }),
    ).toBeVisible();
    checks.push(
      `${locale}: cancelled Google consent returns a usable login page`,
    );
    await p.goto(`${origin}/espace/inscription?lang=${locale}`);
    await expect(
      p.getByRole("button", { name: label, exact: true }),
    ).toBeVisible();
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  await mkdir("docs/editorial-qa", { recursive: true });
  await writeFile(
    "docs/editorial-qa/google-auth.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        checks,
        errors,
        limitation:
          "Tests stop at Google account consent; no real user Google account was impersonated.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Google browser: ${checks.length} checks passed. Real Google account consent remains the owner step.`,
  );
} finally {
  await b.close();
}
