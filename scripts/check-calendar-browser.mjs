import { chromium, expect as baseExpect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { ref, serviceKey, query, literal } from "./lib/supabase-management.mjs";
const expect = baseExpect.configure({ timeout: 20000 });
const origin = process.argv[2] ?? "http://127.0.0.1:4174",
  output = process.env.LDGENX_QA_OUTPUT ?? "docs/calendar-qa";
const service = createClient(`https://${ref}.supabase.co`, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const email = `calendar-browser-${randomUUID().slice(0, 8)}@example.invalid`,
  password = randomBytes(24).toString("base64url");
let browser, userId;
const errors = [],
  checks = [];
const check = (label) => {
  checks.push(label);
  console.log(label);
};
try {
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: "Calendar",
      lastName: "QA",
      organisation: "QA",
      locale: "fr",
    },
  });
  assertNoError(created.error);
  userId = created.data.user.id;
  await query(
    `update public.portal_profiles set data=data||'{"role":"admin","status":"active"}'::jsonb where id=${literal(userId)}`,
  );
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    locale: "fr-FR",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/admin/parametres?onglet=google&lang=fr");
  await page.getByLabel("Adresse e-mail", { exact: true }).fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await page.waitForURL(
    (url) =>
      url.pathname === "/admin/parametres" &&
      url.searchParams.get("onglet") === "google",
  );
  check("Logged-out admin link preserves the Calendar tab after sign-in");
  await page.goto(origin + "/admin/parametres?onglet=google");
  await expect(
    page.getByRole("button", { name: "Connecter Google Agenda", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Synchronisation non activée", { exact: true }),
  ).toBeVisible();
  check(
    "Actual admin status shows an unconnected Calendar without claiming synchronization",
  );
  await mkdir(output, { recursive: true });
  await page.screenshot({
    path: output + "/calendar-not-connected-fr.png",
    fullPage: true,
  });
  await expect
    .poll(() =>
      page
        .locator(".p-brand img:visible")
        .evaluateAll(
          (images) =>
            images.length > 0 &&
            images.every((img) => img.complete && img.naturalWidth > 0),
        ),
    )
    .toBe(true);
  // Connected-interface checks use synthetic Google busy intervals only. No real connection is enabled.
  let status = {
    configured: true,
    expectedOwner: "admin.ldgenx@gmail.com",
    enabled: true,
    connected: true,
    owner: "admin.ldgenx@gmail.com",
    managed: { maeva: "maeva@group.calendar.google.com" },
    busy: { maeva: ["primary"] },
    lastSync: new Date().toISOString(),
    lastBusyCheck: new Date().toISOString(),
    lastError: null,
    refreshExpires: null,
    pending: 0,
    hosts: [{ id: "maeva", name: "Dr Maeva Leitwein" }],
  };
  let configSaved = null,
    syncFailed = false,
    busyFailed = false;
  await page.route("**/functions/v1/calendar/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname.split("/calendar")[1];
    const reply = (data, code = 200) =>
      route.fulfill({
        status: code,
        headers: {
          "Access-Control-Allow-Origin": new URL(origin).origin,
          "Access-Control-Allow-Headers":
            "authorization,apikey,content-type,x-client-info",
          "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        },
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    if (request.method() === "OPTIONS")
      return route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": new URL(origin).origin,
          "Access-Control-Allow-Headers":
            "authorization,apikey,content-type,x-client-info",
          "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        },
      });
    if (path === "/status") return reply(status);
    if (path === "/config") {
      configSaved = request.postDataJSON();
      status = { ...status, busy: configSaved.busy };
      return reply({ ok: true });
    }
    if (path === "/sync")
      return syncFailed
        ? reply({ code: "google_unavailable" }, 503)
        : reply({ synced: 0, pending: 0 });
    if (path === "/busy") {
      if (busyFailed) return reply({ code: "google_unavailable" }, 503);
      const day = new Date(
        Date.parse(url.searchParams.get("from")) + 12 * 3600000,
      )
        .toISOString()
        .slice(0, 10);
      return reply([
        {
          id: "google:qa:maeva",
          hostId: "maeva",
          start: day + "T09:00:00Z",
          end: day + "T10:00:00Z",
          reason: "Google Calendar",
        },
      ]);
    }
    return route.continue();
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Reconnecter Google", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Dr Maeva Leitwein", { exact: true })
    .fill("primary\nshared@example.invalid");
  await page
    .getByRole("button", { name: "Vérifier et enregistrer", exact: true })
    .click();
  await expect(
    page.getByText("Agendas vérifiés et enregistrés.", { exact: true }),
  ).toBeVisible();
  if (configSaved.busy.maeva.join(",") !== "primary,shared@example.invalid")
    throw new Error("Mapping payload mismatch");
  check("Per-person calendar configuration and save feedback work");
  await page
    .getByRole("button", { name: "Synchroniser maintenant", exact: true })
    .click();
  await expect(
    page.getByText(
      "Synchronisation demandée. Consultez le statut des envois.",
      { exact: true },
    ),
  ).toBeVisible();
  syncFailed = true;
  await page
    .getByRole("button", { name: "Synchroniser maintenant", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Google Agenda ne peut pas être vérifié",
  );
  check("Sync action displays success and actionable failure states");
  await page.screenshot({
    path: output + "/calendar-connected-mock-fr.png",
    fullPage: true,
  });
  const language = page.locator(".p-lang").last();
  await language.click();
  await expect(
    page.getByRole("button", { name: "Reconnect Google", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Check and save", exact: true }),
  ).toBeVisible();
  check("English Calendar controls are fully translated");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("alert")).toContainText(
    "Google Calendar cannot be checked",
  );
  await page.screenshot({
    path: output + "/calendar-mobile-en.png",
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  if (overflow) throw new Error("Mobile horizontal overflow");
  check("Mobile settings fit without horizontal overflow");
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(origin + "/admin/agenda");
  await expect(
    page.locator(".p-week-block").filter({ hasText: "Google Calendar" }),
  ).toBeVisible();
  await expect(
    page.locator(".p-week-block").filter({ hasText: "Google Calendar" }),
  ).toBeDisabled();
  check("Google busy intervals are visible and read-only in agenda");
  await page.getByRole("radio", { name: "Month", exact: true }).click();
  await expect(
    page.locator(".p-month-more").filter({ hasText: "Google" }).first(),
  ).toBeVisible();
  await page.getByRole("radio", { name: "List", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Google Calendar", exact: true }),
  ).toBeVisible();
  check("Month and list views include Google busy periods");
  busyFailed = true;
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "Google availability cannot be checked",
  );
  check(
    "Agenda reports unavailable Google data rather than presenting it as current",
  );
  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(
    output + "/browser.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        checks,
        browserExceptions: errors,
        realConsentPerformed: false,
        connectedStates: "mocked",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${checks.length} Calendar browser flows passed.`);
} finally {
  await browser?.close();
  if (userId) await service.auth.admin.deleteUser(userId);
}
function assertNoError(error) {
  if (error) throw new Error(error.code ?? "create user failed");
}
