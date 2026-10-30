// Disposable private drafts only. No public content, messages, mail or appointments are created.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { chromium, expect as baseExpect } from "@playwright/test";
import { ref, serviceKey, query, literal } from "./lib/supabase-management.mjs";
import { installQaJsonTransport } from "./lib/qa-http.mjs";
installQaJsonTransport();
const origin = process.argv[2] ?? "http://127.0.0.1:4174";
const output =
  process.env.LDGENX_QA_OUTPUT ?? "docs/content-management-qa/local";
const project = `https://${ref}.supabase.co`,
  key = parseEnv(
    await readFile(".env.production", "utf8"),
  ).VITE_SUPABASE_PUBLISHABLE_KEY;
const serverKey = await serviceKey(),
  service = createClient(project, serverKey, {
    global: { headers: { Authorization: `Bearer ${serverKey}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
const run = randomUUID().slice(0, 8),
  users = [],
  entries = [],
  newMedia = [],
  checks = [],
  exceptions = [];
const expect = baseExpect.configure({ timeout: 45000 });
let browser, administrator;
const ok = (label) => {
  checks.push(label);
  console.log(label);
};
async function account(role) {
  const email = `content-management-${run}-${role}@example.invalid`,
    password = randomBytes(24).toString("base64url");
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: "Editorial",
      lastName: `QA ${run}`,
      organisation: "Laboratoire QA",
      locale: "fr",
    },
  });
  assert(!created.error, "Disposable account creation failed");
  const id = created.data.user.id;
  users.push(id);
  await query(
    `update public.portal_profiles set data=data||${literal(JSON.stringify({ role, status: "active", notify: { messages: false, files: false, appointments: false, weeklyPurge: false } }))}::jsonb where id=${literal(id)}`,
  );
  const client = createClient(project, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let signed = await client.auth.signInWithPassword({ email, password });
  if (signed.error && (signed.error.status === 0 || signed.error.status >= 500))
    signed = await client.auth.signInWithPassword({ email, password });
  assert(!signed.error, "Disposable sign-in failed");
  return {
    id,
    session: signed.data.session,
    token: signed.data.session.access_token,
  };
}
async function api(
  path,
  method = "GET",
  body,
  actor = administrator,
  expected = 200,
) {
  const response = await fetch(project + "/functions/v1/editorial" + path, {
    method,
    headers: {
      apikey: key,
      Origin: new URL(origin).origin,
      ...(actor ? { Authorization: `Bearer ${actor.token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(90000),
  });
  const value = await response.json();
  assert.equal(
    response.status,
    expected,
    `${method} ${path}: ${response.status} ${value?.code ?? ""}`,
  );
  return value;
}
async function create(kind, extra = {}) {
  const entry = await api(
    "/entries",
    "POST",
    { kind, locale: "fr", ...extra },
    administrator,
    201,
  );
  entries.push(entry.id);
  return entry;
}
const document = (entry, title) => ({
  ...entry.document,
  title,
  summary:
    "Un contenu de contrôle privé pour vérifier la gestion des images, des pages et de la corbeille.",
  body: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Texte complémentaire de contrôle" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Ce contenu de contrôle technique est privé et ne décrit aucune étude scientifique réelle. ".repeat(
              3,
            ),
          },
        ],
      },
    ],
  },
  reviewed: true,
});
async function patch(entry, doc) {
  return api(`/entries/${entry.id}`, "PATCH", {
    version: entry.version,
    document: doc,
    checkpoint: true,
  });
}
try {
  await mkdir(output, { recursive: true });
  administrator = await account("admin");
  const client = await account("client");
  await api("/page-templates", "GET", undefined, null, 401);
  await api("/page-templates", "GET", undefined, client, 403);
  const templates = await api("/page-templates"),
    before = await api("/entries"),
    publicBefore = await api("/public/index", "GET", undefined, null);
  assert(templates.length > 20);
  const repository = await readFile(
    "supabase/functions/_shared/editorial-pages.ts",
    "utf8",
  );
  assert.deepEqual(
    templates,
    JSON.parse(
      repository.slice(repository.indexOf("["), repository.lastIndexOf("]") + 1),
    ),
    "The deployed function has an older page registry: run supabase:editorial-deploy",
  );
  await api(
    "/entries",
    "POST",
    { kind: "page", locale: "fr", pagePath: "/admin/messages" },
    administrator,
    400,
  );
  ok(
    "Only active administrators can access page templates; non-public target paths are rejected",
  );
  let expertise = await create("service"),
    application = await create("application");
  expertise = await patch(
    expertise,
    document(expertise, `Expertise QA ${run}`),
  );
  await patch(
    application,
    document(application, `Application QA ${run}`),
  );
  await api(
    `/entries/${expertise.id}/trash`,
    "POST",
    { version: expertise.version },
    client,
    403,
  );
  await api(
    `/entries/${expertise.id}/trash`,
    "POST",
    { version: expertise.version - 1 },
    administrator,
    409,
  );
  expertise = await api(`/entries/${expertise.id}/trash`, "POST", {
    version: expertise.version,
  });
  assert(expertise.deletedAt);
  await api(
    `/entries/${expertise.id}`,
    "PATCH",
    {
      version: expertise.version,
      document: document(expertise, "Modification interdite"),
    },
    administrator,
    409,
  );
  await api(
    `/entries/${expertise.id}/publish`,
    "POST",
    { version: expertise.version },
    administrator,
    409,
  );
  await api(
    `/entries/${expertise.id}/untrash`,
    "POST",
    { version: expertise.version },
    client,
    403,
  );
  expertise = await api(`/entries/${expertise.id}/untrash`, "POST", {
    version: expertise.version,
  });
  assert.equal(expertise.deletedAt, null);
  assert.equal(expertise.document.reviewed, false);
  assert.equal(expertise.publication, null);
  ok(
    "Trash checks versions and roles, blocks editing/publication, and restores a private draft requiring review",
  );
  const template =
    templates.find(
      (t) =>
        t.locale === "fr" &&
        t.kind === "partners" &&
        !before.some(
          (e) =>
            e.kind === "page" && e.locale === "fr" && "/" + e.slug === t.path,
        ),
    ) ??
    templates.find(
      (t) =>
        t.locale === "fr" &&
        !before.some(
          (e) =>
            e.kind === "page" && e.locale === "fr" && "/" + e.slug === t.path,
        ),
    );
  assert(template, "No unused public page is available for a disposable draft");
  let pageDraft = await create("page", { pagePath: template.path });
  assert.equal(pageDraft.document.title, template.title);
  const same = await api("/entries", "POST", {
    kind: "page",
    locale: "fr",
    pagePath: template.path,
  });
  assert.equal(same.id, pageDraft.id);
  pageDraft = await patch(pageDraft, document(pageDraft, `Page QA ${run}`));
  const stableSlug = pageDraft.slug;
  pageDraft = await api(`/entries/${pageDraft.id}`, "PATCH", {
    version: pageDraft.version,
    slug: "attempted-path-change",
    document: pageDraft.document,
  });
  assert.equal(pageDraft.slug, stableSlug);
  await api(
    "/public/document?path=" + encodeURIComponent(template.path),
    "GET",
    undefined,
    null,
    404,
  );
  ok(
    "Existing-page drafting preserves its template, reopens one working copy, locks its path and remains private",
  );
  let article = await create("article");
  const title = `Gestion des images QA ${run}`;
  article = await patch(article, document(article, title));
  const mediaBefore = new Set((await api("/media")).map((m) => m.id));
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
    locale: "fr-FR",
  });
  const csp=(await readFile('dist/_headers','utf8')).match(/Content-Security-Policy: (.+)/)[1];
  await context.route(origin+'/**',async route=>{
    if(route.request().resourceType()!=='document')return route.continue();
    const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),'Content-Security-Policy':csp}});
  });
  await context.addInitScript(
    ({ ref, session }) => {
      localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
      localStorage.setItem("ldgenx-portal-locale", "fr");
    },
    { ref, session: administrator.session },
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => exceptions.push(error.message));
  await page.goto(origin + "/admin/contenus");
  await page
    .getByRole("searchbox", { name: "Rechercher les contenus" })
    .fill(title);
  const card = page.locator(".cms-entry").filter({ hasText: title });
  await expect(card).toHaveCount(1);
  await card
    .getByRole("link", { name: "Ajouter une image", exact: true })
    .click();
  const picker = page.getByRole("dialog");
  await expect(picker).toBeVisible();
  await picker
    .locator("input[type=file]")
    .setInputFiles("public/images/equipe-maxime-473.webp");
  const mediaCard = picker
    .locator(".cms-media-card")
    .filter({ hasText: "equipe-maxime-473.webp" });
  await expect(mediaCard).toHaveCount(1);
  await mediaCard.getByRole("button", { name: "Choisir", exact: true }).click();
  await expect(picker).not.toBeVisible();
  const cover = page.locator("#cms-cover");
  await expect(cover).toBeVisible();
  await expect(cover.locator("img")).toBeVisible();
  await cover
    .getByLabel("Texte alternatif · ce que montre l’image", { exact: true })
    .fill("Une photographie du laboratoire LDgenX");
  await cover
    .getByLabel("Légende scientifique", { exact: true })
    .fill("Photographie de démonstration du laboratoire");
  await cover
    .getByLabel("Crédit / titulaire des droits", { exact: true })
    .fill("LDgenX");
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Enregistrer", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Brouillon enregistré" }),
  ).toBeVisible();
  article = await api(`/entries/${article.id}`);
  assert(article.document.cover?.mediaId);
  assert.equal(
    article.document.cover.alt,
    "Une photographie du laboratoire LDgenX",
  );
  if (!mediaBefore.has(article.document.cover.mediaId))
    newMedia.push(article.document.cover.mediaId);
  await api(
    `/media/${article.document.cover.mediaId}`,
    "DELETE",
    undefined,
    administrator,
    409,
  );
  await page
    .getByRole("link", { name: "Tous les contenus", exact: true })
    .click();
  await page
    .getByRole("searchbox", { name: "Rechercher les contenus" })
    .fill(title);
  await expect(card.locator(".cms-entry-image img")).toBeVisible();
  assert(
    await card
      .locator(".cms-entry-image img")
      .evaluate((i) => i.complete && i.naturalWidth > 0),
  );
  await page.screenshot({
    path: output + "/content-list-fr.png",
    animations: "disabled",
  });
  ok(
    "Cover upload, attribution, saving and real list thumbnail work; referenced media cannot be deleted",
  );
  await card
    .getByRole("button", { name: "Supprimer " + title, exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(title);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Annuler", exact: true })
    .click();
  await expect(card).toHaveCount(1);
  await card
    .getByRole("button", { name: "Supprimer " + title, exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Déplacer dans la corbeille", exact: true })
    .click();
  await expect(card).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "État", exact: true })
    .selectOption("trash");
  await expect(card).toHaveCount(1);
  await page.screenshot({
    path: output + "/trash-fr.png",
    animations: "disabled",
  });
  await card.getByRole("button", { name: "Restaurer", exact: true }).click();
  await expect(card).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "État", exact: true })
    .selectOption("all");
  await expect(card).toHaveCount(1);
  ok(
    "List deletion confirms the title, supports cancellation, moves to trash and restores with its cover",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.screenshot({
    path: output + "/content-list-fr-mobile.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(
    card.getByRole("link", { name: "Change image", exact: true }),
  ).toBeVisible();
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.screenshot({
    path: output + "/content-list-en-mobile.png",
    animations: "disabled",
  });
  ok("Content actions and image controls fit mobile in French and English");
  const houseCover = {
    mediaId: article.document.cover.mediaId,
    alt: "Une photographie du laboratoire LDgenX",
    caption: "",
    credit: "LDgenX",
    licenceUrl: "",
  };
  await api(`/entries/${pageDraft.id}`, "PATCH", {
    version: pageDraft.version,
    document: { ...pageDraft.document, cover: houseCover },
    checkpoint: true,
  });
  await page.goto(origin + `/admin/contenus/${pageDraft.id}`);
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Aperçu", exact: true })
    .click();
  await expect(
    page.frameLocator(".cms-page-preview-frame").locator(".page-hero"),
  ).toBeVisible();
  await expect(
    page
      .frameLocator(".cms-page-preview-frame")
      .getByRole("heading", { name: `Page QA ${run}`, exact: true }),
  ).toBeVisible();
  await expect(
    page.frameLocator(".cms-page-preview-frame").locator(".cms-page-writing"),
  ).toBeVisible();
  const previewFrame = page.frameLocator(".cms-page-preview-frame");
  assert(
    await previewFrame
      .locator(".page-hero .container")
      .first()
      .evaluate((node) => getComputedStyle(node).maxWidth !== "none"),
    "The public stylesheet does not apply inside the preview",
  );
  await expect(previewFrame.locator(".page-hero-image img")).toBeVisible();
  await expect
    .poll(() =>
      previewFrame
        .locator(".page-hero-image img")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  ok(
    "Existing-page preview uses its actual page template, the public stylesheet and additional authored sections",
  );
  await page.goto(origin + `/admin/contenus/${expertise.id}`);
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Aperçu", exact: true })
    .click();
  await expect(previewFrame.locator(".page-hero")).toBeVisible();
  await expect(
    previewFrame.getByRole("heading", {
      name: `Expertise QA ${run}`,
      exact: true,
    }),
  ).toBeVisible();
  assert(
    await previewFrame
      .locator(".page-hero .container")
      .first()
      .evaluate((node) => getComputedStyle(node).maxWidth !== "none"),
    "The public stylesheet does not apply inside the expertise preview",
  );
  await page.screenshot({
    path: output + "/expertise-preview-fr.png",
    animations: "disabled",
  });
  ok("A new expertise previews in the public page model and stylesheet");
  const after = await api("/public/index", "GET", undefined, null);
  assert.deepEqual(
    after.map((r) => r.id).sort(),
    publicBefore.map((r) => r.id).sort(),
  );
  assert(!after.some((r) => entries.includes(r.id)));
  await api("/media", "GET", undefined, client, 403);
  assert.deepEqual(exceptions, []);
  ok(
    "No QA draft or image was published; client isolation and public content remain unchanged",
  );
  if (process.env.LDGENX_QA_PUBLISH === "1") {
    // Explicit, disposable publication for a live release check. The page keeps its text, gains a
    // cover for a few seconds, then returns to its original version and the fixture is removed.
    // Cloudflare's email protection changes the markup of each response on the real domain.
    const livePath = "/en/about-us/partners",
      publicHtml = () =>
        fetch(`${origin}${livePath}?qa=${Date.now()}`)
          .then((r) => r.text())
          .then((html) =>
            html
              .replace(/<script data-cfasync[^>]*><\/script>/g, "")
              .replace(/\/cdn-cgi\/[^"]*/g, "")
              .replace(/data-cfemail="[^"]*"/g, ""),
          ),
      original = await publicHtml();
    assert(
      !before.some((e) => e.kind === "page" && "/en/" + e.slug === livePath),
      "That page already has a working copy: never publish it for a test",
    );
    let live = await create("page", { locale: "en", pagePath: livePath });
    live = await api(`/entries/${live.id}`, "PATCH", {
      version: live.version,
      document: { ...live.document, cover: houseCover, reviewed: true },
      checkpoint: true,
    });
    live = await api(`/entries/${live.id}/publish`, "POST", {
      version: live.version,
    });
    assert.equal(live.publication.status, "published");
    await expect
      .poll(async () => (await publicHtml()).includes('"document":{'), {
        timeout: 60000,
        intervals: [2000],
      })
      .toBe(true);
    const visitor = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const publicPage = await visitor.newPage();
    publicPage.on("pageerror", (error) => exceptions.push(error.message));
    await publicPage.goto(origin + livePath);
    const heroImage = publicPage.locator(".page-hero-image img");
    await expect(heroImage).toBeVisible();
    await expect
      .poll(() =>
        heroImage.evaluate(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true);
    assert(
      (await heroImage.getAttribute("src")).includes("/storage/v1/object/public/"),
    );
    await visitor.close();
    live = await api(`/entries/${live.id}/withdraw`, "POST", {
      version: live.version,
    });
    await expect
      .poll(publicHtml, { timeout: 60000, intervals: [2000] })
      .toBe(original);
    assert.deepEqual(exceptions, []);
    ok(
      "Publishing an existing page with an uploaded cover reaches visitors; withdrawing restores the exact original",
    );
  }
  await context.close();
} finally {
  if (browser) await browser.close();
  if (users.length) {
    await query(
      `delete from public.cms_entries where created_by in (${users.map(literal).join(",")})`,
    );
    const remaining = await query(
      `select id from public.cms_entries where created_by in (${users.map(literal).join(",")})`,
    );
    assert.equal(remaining.length, 0, "QA draft cleanup incomplete");
  }
  const ownedMedia = users.length
    ? await query(
        `select id from public.cms_media where created_by in (${users.map(literal).join(",")})`,
      )
    : [];
  for (const m of ownedMedia) await api("/media/" + m.id, "DELETE");
  for (const id of users) {
    const removed = await service.auth.admin.deleteUser(id);
    assert(!removed.error, "QA account cleanup incomplete");
  }
  await mkdir(output, { recursive: true });
  await writeFile(
    output + "/results.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        origin,
        checks,
        browserExceptions: exceptions,
        fixturesCleaned: true,
        boundaries:
          "Private disposable drafts and a public-source test image only; no public content, mail, client messages or appointments created.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Disposable accounts, drafts and newly uploaded QA media removed.",
  );
}
