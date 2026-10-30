// UI validation uses intercepted Auth responses: no accounts, emails or sessions are created.
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const origin = process.argv[2] ?? "http://127.0.0.1:4174";
const output = process.env.LDGENX_QA_OUTPUT ?? "docs/auth-qa/local";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const checks = [],
  exceptions = [];
const corsHeaders = {
  "X-Supabase-Api-Version": "2024-01-01",
  "Access-Control-Expose-Headers": "X-Supabase-Api-Version",
  "Access-Control-Allow-Origin": new URL(origin).origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization,apikey,content-type,x-client-info,x-supabase-api-version",
};
const ok = (label) => {
  checks.push(label);
  console.log(label);
};
try {
  for (const locale of ["fr", "en"]) {
    const fr = locale === "fr";
    const context = await browser.newContext({
      locale: fr ? "fr-FR" : "en-GB",
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => exceptions.push(e.message));
    for (const [path, kind] of [
      ["/espace/connexion", "login"],
      ["/admin/connexion", "admin"],
      ["/espace/inscription", "register"],
      ["/espace/mot-de-passe", "forgot"],
    ]) {
      await page.goto(`${origin}${path}?lang=${locale}`);
      await expect(page.locator(".p-auth-access h1")).toBeVisible();
      if (kind === "register") {
        await expect(page.locator(".p-auth-fields .p-field input")).toHaveCount(
          5,
        );
        await expect(page.locator("textarea,input[type=tel]")).toHaveCount(0);
        await expect(page.getByRole("checkbox")).toBeVisible();
      } else if (kind !== "forgot") {
        await expect(page.locator(".p-auth-fields .p-field input")).toHaveCount(
          2,
        );
        await expect(page.locator(".p-auth-heading")).toContainText(
          fr ? "Accédez à votre compte LDgenX." : "Access your LDgenX account.",
        );
        await expect(
          page.getByLabel(fr ? "Adresse e-mail" : "E-mail address", {
            exact: true,
          }),
        ).toHaveAttribute("autocomplete", "username");
        await expect(
          page.getByRole("link", {
            name: fr ? "Créer un compte" : "Create an account",
            exact: true,
          }),
        ).toHaveCount(kind === "admin" ? 0 : 1);
      }
      const back = page.locator(".p-auth-top a.p-link");
      await expect(back).toHaveAttribute("href", fr ? "/" : "/en");
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${kind} ${locale} ${width} overflow`,
        );
        if (fr && [1440, 390].includes(width))
          await page.screenshot({
            path: `${output}/${kind}-${locale}-${width}.png`,
            fullPage: true,
            animations: "disabled",
          });
      }
      ok(
        `${locale}: ${kind} has concise controls, localized navigation and no overflow at 320/390/768/1440px`,
      );
    }
    await page.goto(`${origin}/espace/connexion?lang=${locale}`);
    const password = page.getByLabel(fr ? "Mot de passe" : "Password", {
      exact: true,
    });
    await password.fill("Example-Only-Password");
    await page
      .getByRole("button", {
        name: fr ? "Afficher le mot de passe" : "Show password",
        exact: true,
      })
      .click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(password).toHaveValue("Example-Only-Password");
    await page
      .getByRole("button", {
        name: fr ? "Masquer le mot de passe" : "Hide password",
        exact: true,
      })
      .click();
    await expect(password).toHaveAttribute("type", "password");
    await page.route("**/auth/v1/token?**", (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: corsHeaders })
        : route.fulfill({
            status: 400,
            headers: corsHeaders,
            json: {
              code: "invalid_credentials",
              message: "Invalid login credentials",
            },
          }),
    );
    await page
      .getByLabel(fr ? "Adresse e-mail" : "E-mail address", { exact: true })
      .fill("ui-only@example.invalid");
    await page.locator("button[type=submit]").click();
    await expect(page.getByRole("alert")).toContainText(
      fr ? "incorrect" : "Incorrect",
    );
    await expect(page.locator("button[type=submit]")).toBeEnabled();
    ok(
      `${locale}: password reveal preserves value; failed sign-in restores usable controls`,
    );
    await page.goto(`${origin}/espace/inscription?lang=${locale}`);
    await page.locator("button[type=submit]").click();
    await expect(page.locator("input[aria-invalid=true]")).toHaveCount(6);
    await page
      .getByLabel(fr ? "Prénom" : "First name", { exact: true })
      .fill("Élodie");
    await page
      .getByLabel(fr ? "Nom" : "Last name", { exact: true })
      .fill("Contrôle");
    await page
      .getByLabel("Organisation", { exact: true })
      .fill("Laboratoire UI");
    await page
      .getByLabel(fr ? "Adresse e-mail" : "E-mail address", { exact: true })
      .fill("ui-only@example.invalid");
    await page
      .getByLabel(fr ? "Mot de passe" : "Password", { exact: true })
      .fill("Example-Only-Password");
    await page.getByRole("checkbox").check();
    await expect(page.locator(".p-auth-consent a")).toHaveAttribute(
      "href",
      fr ? "/politique-confidentialite" : "/en/privacy-policy",
    );
    let submitted, release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/auth/v1/signup**", async (route) => {
      if (route.request().method() === "OPTIONS")
        return route.fulfill({ status: 204, headers: corsHeaders });
      submitted = route.request().postDataJSON();
      await gate;
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        json: {
          id: "a0f9750a-cf71-49f9-a452-71c24d3fd7c8",
          aud: "authenticated",
          role: "authenticated",
          email: "ui-only@example.invalid",
          app_metadata: { provider: "email", providers: ["email"] },
          user_metadata: submitted.data,
          identities: [],
          created_at: new Date().toISOString(),
        },
      });
    });
    await page.locator("button[type=submit]").click();
    await expect.poll(() => !!submitted).toBe(true);
    await expect(page.locator(".p-auth-fields input").first()).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: fr ? "Continuer avec Google" : "Continue with Google",
        exact: true,
      }),
    ).toBeDisabled();
    assert.equal(submitted.email, "ui-only@example.invalid");
    assert.equal(submitted.data.organisation, "Laboratoire UI");
    assert.equal(submitted.data.locale, locale);
    assert.equal(submitted.data.phone, "");
    assert.equal(submitted.data.message, "");
    release();
    await expect(page.locator('.p-auth-access [role="status"]')).toContainText(
      fr ? "messagerie" : "inbox",
    );
    ok(
      `${locale}: required registration fields, consent, submission locking and confirmation work without sending mail`,
    );
    await context.close();
  }
  assert.deepEqual(exceptions, []);
  await writeFile(
    `${output}/results.json`,
    JSON.stringify(
      {
        date: new Date().toISOString(),
        origin,
        checks,
        browserExceptions: exceptions,
        boundaries:
          "Auth errors and signup responses intercepted; no account, email, session or appointment created.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${checks.length} authentication UX checks passed.`);
} finally {
  await browser.close();
}
