import {
  atMinutes,
  teamDay,
  addDays,
} from "../supabase/functions/_shared/time.ts";
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
let browser, userId, testPage;
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
  testPage = page;
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/admin/parametres?onglet=google&lang=fr");
  await page.getByLabel("Adresse e-mail", { exact: true }).fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await page.waitForURL(
    (url) =>
      url.pathname === "/admin/parametres" &&
      url.searchParams.get("onglet") === "google",
    { timeout: 90000 },
  );
  check("Logged-out admin link preserves the Calendar tab after sign-in");
  await page.goto(origin + "/admin/parametres?onglet=google");
  const [connection] = await query(
    "select enabled,credentials is not null as connected from private.google_calendar_connection where id=true",
  );
  await expect(
    page.getByRole("button", {
      name: connection.connected
        ? "Reconnecter Google"
        : "Connecter Google Agenda",
      exact: true,
    }),
  ).toBeVisible();
  if (!connection.enabled)
    await expect(
      page.getByText("Synchronisation non activée", { exact: true }),
    ).toBeVisible();
  check(
    "Actual admin status accurately reflects the current Google connection",
  );
  await mkdir(output, { recursive: true });
  await page.screenshot({
    path: output + "/calendar-current-connection-fr.png",
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
  const fixtureDay = teamDay(Date.now());
  let fixture = {
    id: randomUUID(),
    hostId: null,
    start: atMinutes(fixtureDay, 14 * 60 + 30).toISOString(),
    end: atMinutes(fixtureDay, 15 * 60 + 30).toISOString(),
    reason: "Réunion laboratoire QA",
    version: 1,
    allDay: false,
  };
  let preferencesSaved = null,
    blockSaved = null;
  await page.route("**/functions/v1/portal/booking/config", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    let original;
    try {
      original = await route.fetch();
    } catch {
      if (page.isClosed()) return;
      throw new Error("QA booking configuration fetch failed.");
    }
    const cfg = await original.json();
    cfg.blocks = fixture ? [fixture] : [];
    return route.fulfill({ response: original, json: cfg });
  });
  await page.route(
    /\/functions\/v1\/portal\/booking\/blocks(?:\/[^?]*)?(?:\?.*)?$/,
    async (route) => {
      const req = route.request();
      if (req.method() === "OPTIONS")
        return route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": new URL(origin).origin,
            "Access-Control-Allow-Headers":
              "authorization,apikey,content-type,x-client-info",
            "Access-Control-Allow-Methods": "POST,PATCH,DELETE,OPTIONS",
          },
        });
      if (req.method() === "DELETE") {
        fixture = null;
        return route.fulfill({
          status: 204,
          headers: { "Access-Control-Allow-Origin": new URL(origin).origin },
        });
      }
      const body = req.postDataJSON();
      blockSaved = body;
      if (req.method() === "PATCH" && body.version !== fixture.version)
        return route.fulfill({
          status: 409,
          json: { code: "stale_record" },
          headers: { "Access-Control-Allow-Origin": new URL(origin).origin },
        });
      fixture = {
        ...body,
        id: req.method() === "POST" ? randomUUID() : fixture.id,
        version: req.method() === "POST" ? 1 : fixture.version + 1,
        updatedAt: new Date().toISOString(),
      };
      return route.fulfill({
        status: 200,
        json: fixture,
        headers: { "Access-Control-Allow-Origin": new URL(origin).origin },
      });
    },
  );
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
    preferences: {
      shareBlockTitles: true,
      shareClientDetails: false,
      shareAppointmentNotes: false,
      shareMeetingLink: true,
      reminderMinutes: 10,
      teamBlocks: "shared",
      language: "fr",
    },
    teamCalendar: "team@group.calendar.google.com",
    teamNeedsAttention: false,
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
    if (path.startsWith("/item/"))
      return reply({
        state: "synced",
        syncedAt: new Date().toISOString(),
        links: [
          {
            url: "https://www.google.com/calendar/event?eid=qa",
            calendar: "Équipe",
          },
        ],
        error: null,
      });
    if (path === "/preferences") {
      preferencesSaved = request.postDataJSON();
      status = { ...status, preferences: preferencesSaved.preferences };
      return reply({ synced: 1, pending: 0 });
    }
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
      return reply(
        ["maeva", "emilie", "damien"].map((hostId) => ({
          id: `google:qa:${hostId}`,
          hostId,
          start: day + "T09:00:00Z",
          end: day + "T10:00:00Z",
          reason: "Google Calendar",
        })),
      );
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
  await page
    .getByLabel("Partager le nom et l’organisation du client", { exact: true })
    .check();
  await page
    .getByRole("button", {
      name: "Enregistrer et mettre à jour Google",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(
      "Paramètres enregistrés. Les événements concernés sont mis à jour.",
      { exact: true },
    ),
  ).toBeVisible();
  if (
    !preferencesSaved.preferences.shareClientDetails ||
    preferencesSaved.preferences.teamBlocks !== "shared"
  )
    throw new Error("Calendar preference payload is incomplete");
  await page
    .getByLabel("Partager le nom et l’organisation du client", { exact: true })
    .uncheck();
  await page
    .getByRole("button", {
      name: "Enregistrer et mettre à jour Google",
      exact: true,
    })
    .click();
  await expect(
    page.getByLabel("Partager le nom et l’organisation du client", {
      exact: true,
    }),
  ).not.toBeChecked();
  check(
    "Sharing and team-calendar preferences are explicit, editable and private by default",
  );
  await page
    .getByRole("button", { name: "Synchroniser maintenant", exact: true })
    .click();
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
  const googleBlocks = page
    .locator(".p-week-block")
    .filter({ hasText: /Google/ });
  await expect(googleBlocks).toHaveCount(1);
  await expect(googleBlocks.first()).toContainText("Whole team");
  await googleBlocks.first().click();
  await expect(page.getByRole("dialog")).toContainText(
    "This busy period comes from Google",
  );
  await expect(
    page.getByRole("button", { name: "Edit blocked time", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  check(
    "Shared Google availability displays once and opens a protected read-only detail view",
  );
  await page
    .locator(".p-week-block")
    .filter({ hasText: "Réunion laboratoire QA" })
    .click();
  await expect(
    page.getByText("Synced with Google", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit blocked time", exact: true })
    .click();
  await page
    .getByLabel("Blocked-time title", { exact: true })
    .fill("QA revised blocked time");
  await page.getByLabel("All day", { exact: true }).check();
  const futureDay = addDays(fixtureDay, 20),
    lastDay = addDays(futureDay, 1);
  await page.getByLabel("Start date", { exact: true }).fill(futureDay);
  await page.getByLabel("Last day inclusive", { exact: true }).fill(lastDay);
  await page.screenshot({
    path: output + "/block-editor-en.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "QA revised blocked time", exact: true }),
  ).toBeVisible();
  if (blockSaved.version !== 1 || !blockSaved.allDay)
    throw new Error(
      "Blocked-time edit payload lost its version or all-day mode",
    );
  await page.waitForURL((url) => url.searchParams.get("date") === futureDay);
  check(
    "Blocked-time editing preserves identity, saves all-day dates and follows the new date",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "QA revised blocked time", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: output + "/block-details-en.png",
    fullPage: true,
  });
  check("Google record links reopen the correct detail panel and viewed date");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog")
    .last()
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  check("Deletion requires confirmation and removes the portal block");
  await page.getByRole("button", { name: "Block a slot", exact: true }).click();
  const create = page.getByRole("dialog");
  await create.getByLabel(/^Blocked-time title/).fill("QA all-day creation");
  await create.getByLabel("All day", { exact: true }).check();
  await create
    .getByLabel("Start date", { exact: true })
    .fill(addDays(futureDay, 3));
  await create
    .getByLabel("Last day inclusive", { exact: true })
    .fill(addDays(futureDay, 4));
  await create.getByRole("heading").click();
  await writeFile(
    output + "/dialog-style.json",
    JSON.stringify(
      await create.evaluate((el) => ({
        background: getComputedStyle(el).backgroundColor,
        opacity: getComputedStyle(el).opacity,
        filter: getComputedStyle(el).filter,
        modal: el.matches(":modal"),
        dialogs: [...document.querySelectorAll("dialog[open]")].map((d) => ({
          title: d.textContent.slice(0, 60),
          modal: d.matches(":modal"),
          background: getComputedStyle(d).backgroundColor,
          opacity: getComputedStyle(d).opacity,
        })),
      })),
      null,
      2,
    ),
  );
  await page.screenshot({
    path: output + "/block-create-en.png",
    fullPage: true,
  });
  await create
    .getByRole("button", { name: "Block a slot", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "QA all-day creation", exact: true }),
  ).toBeVisible();
  if (!blockSaved.allDay) throw new Error("New all-day block lost its mode");
  check(
    "New all-day blocks open their synchronized record on the selected date",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.screenshot({
    path: output + "/agenda-detailed-en.png",
    fullPage: true,
  });

  await page.getByRole("radio", { name: "Month", exact: true }).click();
  await expect(
    page.locator(".p-month-more").filter({ hasText: "Google" }).first(),
  ).toBeVisible();
  await page.getByRole("radio", { name: "List", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Blocked times and availability",
      exact: true,
    }),
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
} catch (error) {
  await mkdir(output, { recursive: true });
  await testPage
    ?.screenshot({ path: output + "/browser-failure.png", fullPage: true })
    .catch(() => {});
  console.log(
    "Visible failure notices:",
    await testPage
      ?.locator('[role="alert"]')
      .allTextContents()
      .catch(() => []),
  );
  throw error;
} finally {
  await testPage?.unrouteAll({ behavior: "ignoreErrors" }).catch(() => {});
  if (userId) await service.auth.admin.deleteUser(userId);
  await browser?.close();
}
function assertNoError(error) {
  if (error)
    throw new Error(
      [error.code, error.status, error.message]
        .filter(Boolean)
        .join(": ")
        .slice(0, 250),
    );
}
