// Real role checks and private drafts; synthetic file/error views. Never sends mail or books time.
import assert from "node:assert/strict";
import { chromium, expect as baseExpect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { ref, serviceKey } from "./lib/supabase-management.mjs";
import { installQaJsonTransport } from "./lib/qa-http.mjs";
installQaJsonTransport();
const origin = process.argv[2] ?? "http://127.0.0.1:4174";
const output = process.env.LDGENX_QA_OUTPUT ?? "docs/workspace-qa";
const key = parseEnv(
  await readFile(".env.production", "utf8"),
).VITE_SUPABASE_PUBLISHABLE_KEY;
const project = `https://${ref}.supabase.co`;
const serverKey = await serviceKey();
const service = createClient(project, serverKey, {
  global: { headers: { Authorization: `Bearer ${serverKey}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});
const expect = baseExpect.configure({ timeout: 45000 });
const run = randomUUID().slice(0, 8),
  users = [],
  checks = [],
  errors = [],
  contexts = [];
let browser, admin;
const ok = (label) => {
  checks.push(label);
  console.log(label);
};
async function account(role, firstName) {
  const email = `workspace-ux-${run}-${users.length}@example.invalid`,
    password = randomBytes(24).toString("base64url");
  const input = {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName,
      lastName: `UX ${run}`,
      organisation: "Laboratoire QA",
      locale: "fr",
    },
  };
  let made = await service.auth.admin.createUser(input);
  if (made.error?.status === 0) {
    // Recover an ambiguous fixture creation by its unique email before retrying it.
    const existing = await service
      .from("portal_profiles")
      .select("id")
      .eq("data->>email", email);
    assert(!existing.error, "Disposable creation recovery read failed");
    if (existing.data.length === 1)
      made = { data: { user: { id: existing.data[0].id } }, error: null };
    else made = await service.auth.admin.createUser(input);
  }
  assert(
    !made.error,
    `Disposable user creation failed: ${made.error?.code ?? ""} ${made.error?.status ?? ""} ${made.error?.message ?? ""}`.slice(
      0,
      250,
    ),
  );
  const id = made.data.user.id;
  users.push(id);
  const profile = await service
    .from("portal_profiles")
    .select("data")
    .eq("id", id)
    .single();
  assert(!profile.error, "Disposable profile read failed");
  const assignedData = {
    ...profile.data.data,
    role,
    status: "active",
    notify: {
      messages: false,
      files: false,
      appointments: false,
      weeklyPurge: false,
    },
  };
  const assign = () =>
    service.from("portal_profiles").update({ data: assignedData }).eq("id", id);
  let assigned = await assign();
  if (assigned.error && (assigned.status === 0 || assigned.status >= 500))
    assigned = await assign();
  assert(
    !assigned.error,
    `Disposable profile assignment failed: HTTP ${assigned.status}, code ${assigned.error?.code ?? ""}`,
  );
  const client = createClient(project, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let signed = await client.auth.signInWithPassword({ email, password });
  if (signed.error?.status === 0)
    signed = await client.auth.signInWithPassword({ email, password });
  assert(!signed.error, "Disposable sign-in failed");
  return {
    id,
    email,
    session: signed.data.session,
    token: signed.data.session.access_token,
  };
}
async function api(
  actor,
  path,
  expected,
  namespace = "portal",
  method = "GET",
) {
  const r = await fetch(`${project}/functions/v1/${namespace}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${actor.token}`,
      Origin: new URL(origin).origin,
    },
    signal: AbortSignal.timeout(90000),
  });
  assert.equal(
    r.status,
    expected,
    `${namespace} ${method} ${path} access status`,
  );
  return r.json().catch(() => null);
}
async function pageFor(actor) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    locale: "fr-FR",
    reducedMotion: "reduce",
  });
  contexts.push(context);
  await context.addInitScript(
    ({ ref, session }) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
      localStorage.setItem("ldgenx-portal-locale", "fr");
    },
    { ref, session: actor.session },
  );
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  return page;
}
async function noOverflow(page) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Horizontal layout overflow",
  );
}
try {
  await mkdir(output, { recursive: true });
  admin = await account("admin", "Administration");
  const client = await account("client", "Élodie"),
    other = await account("client", "Autre");
  await Promise.all([
    api(client, "/clients", 403),
    api(client, `/users/${other.id}`, 403),
    api(client, `/threads/${other.id}/messages`, 403),
    api(client, "/entries", 403, "editorial"),
    api(client, `/files?clientId=${other.id}`, 403),
  ]);
  ok(
    "Real client sessions cannot read another client record, messages or files, or access editorial administration",
  );
  for (const path of [
    `portal_profiles?id=eq.${other.id}&select=id`,
    "cms_entries?select=id&limit=1",
  ]) {
    const response = await fetch(`${project}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${client.token}` },
      signal: AbortSignal.timeout(60000),
    });
    const value = await response.json();
    assert(
      response.status === 403 ||
        (response.status === 200 && Array.isArray(value) && value.length === 0),
      "Direct Data API must not expose another profile or private editorial drafts",
    );
  }
  ok(
    "Direct Supabase Data API also withholds other client profiles and private scientific drafts",
  );

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await pageFor(admin);
  await page.goto(origin + "/admin/clients?lang=fr");
  await expect(
    page.getByRole("heading", { name: "Clients", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".p-client-overview button")).toHaveCount(4);
  const listed = await api(admin, "/clients", 200);
  await expect(
    page.locator(".p-client-overview button").first().locator("strong"),
  ).toHaveText(String(listed.length));
  await page.getByRole("searchbox").fill(`elodie ux ${run}`);
  await expect(page.locator(".p-list-row")).toHaveCount(1);
  await expect(page.locator(".p-list-row")).toContainText("Élodie");
  await page.screenshot({
    path: output + "/admin-clients-fr.png",
    fullPage: true,
  });
  await page.locator(".p-list-row").click();
  await page.getByRole("button", { name: "Désactiver", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Les règles de conservation restent applicables.",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Annuler", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Désactiver", exact: true }),
  ).toBeVisible();
  ok(
    "Client overview uses actual counts, accent-insensitive search and a cancellable suspension confirmation",
  );
  await page.getByRole("button", { name: "Désactiver", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Désactiver", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Réactiver", exact: true }),
  ).toBeVisible();
  await api(client, "/files", 403);
  for (let attempt = 0; attempt < 2; attempt++) {
    const enable = page.getByRole("button", { name: "Réactiver", exact: true });
    await expect(enable).toBeEnabled({ timeout: 90000 });
    await enable.click();
    try {
      await expect(
        page.getByRole("button", { name: "Désactiver", exact: true }),
      ).toBeVisible({ timeout: 60000 });
      break;
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
  await api(client, "/files", 200);
  ok(
    "Disabling the fixture revokes server access; reactivation restores access without deleting the profile",
  );
  await page.goto(origin + "/admin/contenus?lang=fr");
  await page
    .getByRole("button", { name: "Nouveau contenu", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Type", { exact: true })
    .selectOption("study");
  await page
    .getByRole("button", { name: "Créer le brouillon", exact: true })
    .click();
  await page.waitForURL((u) => /^\/admin\/contenus\/[^/]+$/.test(u.pathname), {
    timeout: 90000,
  });
  const entryId = new URL(page.url()).pathname.split("/").at(-1);
  await page
    .getByRole("button", { name: "Utiliser cette trame", exact: true })
    .click();
  await expect(page.locator("[data-testid=cms-body] h2")).toHaveText([
    "Contexte et objectifs",
    "Méthodes",
    "Résultats",
    "Interprétation et limites",
  ]);
  await page
    .getByLabel("Titre", { exact: true })
    .fill(`Contrôle UX privé ${run}`);
  await page.keyboard.press("Control+s");
  await expect(
    page.getByRole("status").filter({ hasText: "Brouillon enregistré" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("[data-testid=cms-body] h2")).toHaveCount(4);
  await expect(page.getByLabel("Titre", { exact: true })).toHaveValue(
    `Contrôle UX privé ${run}`,
  );
  await expect(page.locator(".cms-preflight")).toContainText("compléter");
  const snapshot = await service
    .from("cms_publications")
    .select("entry_id")
    .eq("entry_id", entryId);
  assert(!snapshot.error, "Private snapshot check failed");
  assert.equal(snapshot.data.length, 0);
  await page
    .locator(".cms-editor-dock")
    .getByRole("link", { name: "Sources", exact: true })
    .click();
  const dock = await page.locator(".cms-editor-dock").boundingBox();
  assert(dock.y >= 0 && dock.y < 300, "Persistent editor actions unavailable");
  await page.screenshot({
    path: output + "/editor-desktop-fr.png",
    fullPage: false,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  ok(
    "Optional scientific structure, explicit incomplete checklist and keyboard draft saving survive reload without publication",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: output + "/editor-mobile-fr.png",
    fullPage: false,
  });
  await page.locator(".p-lang:visible").last().click();
  await expect(page.locator(".cms-editor-dock")).toContainText("Writing");
  await expect(page.locator(".cms-preflight")).toContainText("complete");
  await noOverflow(page);
  ok(
    "Scientific editor navigation, saving controls and checklist fit mobile and switch to English",
  );
  const cp = await pageFor(client);
  let filesFailed = false,
    appointmentsFailed = false;
  const file = (name, direction, createdAt) => ({
    id: randomUUID(),
    clientId: client.id,
    name,
    size: 1000,
    type: "application/pdf",
    direction,
    uploadedBy: direction === "to_client" ? admin.id : client.id,
    note: "Échantillons de contrôle UX",
    createdAt,
    expiresAt: null,
    kept: true,
    downloads: [],
  });
  const fixtures = [
    file(
      "Résultats qPCR.pdf",
      "to_client",
      new Date(Date.now() - 3600000).toISOString(),
    ),
    file(
      "Rapport initial.pdf",
      "to_client",
      new Date(Date.now() - 86400000).toISOString(),
    ),
    file(
      "Échantillons transmis.pdf",
      "from_client",
      new Date(Date.now() - 3600000).toISOString(),
    ),
  ];
  await cp.route(
    /\/functions\/v1\/portal\/(files|appointments)(?:\?.*)?$/,
    async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname;
      const headers = {
        "Access-Control-Allow-Origin": new URL(origin).origin,
        "Access-Control-Allow-Headers":
          "authorization,apikey,content-type,x-client-info",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      };
      if (request.method() === "OPTIONS")
        return route.fulfill({ status: 204, headers });
      if (request.method() !== "GET") return route.continue();
      if (path.endsWith("/files"))
        return route.fulfill({
          status: filesFailed ? 503 : 200,
          json: filesFailed ? { code: "network" } : fixtures,
          headers,
        });
      return appointmentsFailed
        ? route.fulfill({ status: 503, json: { code: "network" }, headers })
        : route.continue();
    },
  );
  await cp.goto(origin + "/espace/fichiers?lang=fr");
  await expect(cp.locator(".p-file-name")).toHaveText([
    "Résultats qPCR.pdf",
    "Rapport initial.pdf",
  ]);
  await cp.getByRole("searchbox").fill("resultats");
  await expect(cp.locator(".p-file-name")).toHaveText(["Résultats qPCR.pdf"]);
  await cp.getByRole("searchbox").fill("");
  await cp.getByRole("radio", { name: /Envoyés à LDgenX/ }).click();
  await expect(cp.locator(".p-file-name")).toHaveText([
    "Échantillons transmis.pdf",
  ]);
  await cp.getByRole("searchbox").fill("echantillons");
  await expect(cp.locator(".p-file-name")).toHaveCount(1);
  await cp.screenshot({
    path: output + "/client-files-fr.png",
    fullPage: true,
  });
  await cp.setViewportSize({ width: 390, height: 844 });
  await noOverflow(cp);
  await cp.screenshot({
    path: output + "/client-files-mobile-fr.png",
    fullPage: true,
  });
  await cp.locator(".p-lang:visible").last().click();
  await expect(cp.getByRole("radio", { name: /Sent to LDgenX/ })).toBeVisible();
  await expect(
    cp.getByRole("searchbox", { name: "Search files", exact: true }),
  ).toBeVisible();
  await noOverflow(cp);
  await cp.locator(".p-lang:visible").last().click();
  ok(
    "Client received/sent files, accent-insensitive search and newest-first ordering work on desktop and mobile",
  );
  filesFailed = true;
  await cp.reload();
  await expect(
    cp.getByRole("button", { name: "Réessayer", exact: true }),
  ).toBeVisible();
  await expect(
    cp.getByText("Le service ne répond pas. Réessayez dans un instant.", {
      exact: true,
    }),
  ).toBeVisible();
  filesFailed = false;
  await cp.getByRole("button", { name: "Réessayer", exact: true }).click();
  await expect(cp.locator(".p-file-name")).toHaveCount(2);
  appointmentsFailed = true;
  await cp.goto(origin + "/espace/rendez-vous?lang=fr");
  await expect(
    cp.getByRole("button", { name: "Réessayer", exact: true }),
  ).toBeVisible();
  ok(
    "Failed file and appointment reads display retry controls instead of endless loading or false empty states",
  );
  await cp.goto(origin + "/admin/contenus");
  await expect(
    cp.getByText("Cet espace est réservé à l’équipe LDgenX.", { exact: true }),
  ).toBeVisible();
  await expect(
    cp.getByRole("link", { name: "Espace client", exact: true }),
  ).toHaveAttribute("href", "/espace/messages");
  await expect(cp.locator(".cms-editor-page")).toHaveCount(0);
  ok("Client navigation cannot render the administrator publishing interface");
  assert.deepEqual(errors, [], "Unexpected browser exceptions");
  await writeFile(
    output + "/results.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        checks,
        browserExceptions: errors,
        fixtureBoundaries:
          "Real role/status/draft checks; synthetic file/error views; no mail, publications, uploaded files or bookings.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${checks.length} workspace UX checks passed.`);
} catch (error) {
  console.log("Workspace QA failure:", String(error.message).slice(0, 500));
  await writeFile(
    output + "/failure.json",
    JSON.stringify(
      {
        completedChecks: checks,
        browserExceptions: errors,
        failure: String(error.message).slice(0, 500),
      },
      null,
      2,
    ),
  );
  for (const [index, context] of contexts.entries())
    for (const page of context.pages())
      await page
        .screenshot({ path: output + `/failure-${index}.png` })
        .catch(() => {});
  throw error;
} finally {
  const cleanupErrors = [];
  for (const context of contexts)
    await context.unrouteAll({ behavior: "ignoreErrors" }).catch(() => {});
  await browser?.close().catch(() => {});
  if (admin) {
    try {
      const drafts = await service
        .from("cms_entries")
        .select("id")
        .eq("created_by", admin.id)
        .is("legacy_id", null)
        .is("published_version", null);
      assert(!drafts.error, "Disposable draft lookup failed");
      for (const draft of drafts.data)
        await api(admin, `/entries/${draft.id}`, 200, "editorial", "DELETE");
    } catch {
      cleanupErrors.push("private draft cleanup");
    }
  }
  const remaining = await service
    .from("portal_profiles")
    .select("id")
    .like("data->>email", `workspace-ux-${run}-%@example.invalid`);
  if (remaining.error) cleanupErrors.push("fixture recovery lookup");
  else
    for (const row of remaining.data)
      if (!users.includes(row.id)) users.push(row.id);
  for (const id of users) {
    try {
      let removed = await service.auth.admin.deleteUser(id);
      if (removed.error?.status === 0)
        removed = await service.auth.admin.deleteUser(id);
      if (removed.error && removed.error.status !== 404)
        cleanupErrors.push("account cleanup");
    } catch {
      cleanupErrors.push("account cleanup");
    }
  }
  assert.equal(
    cleanupErrors.length,
    0,
    "Disposable fixture cleanup incomplete",
  );
}
