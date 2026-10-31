// Disposable accounts and private drafts only: no messages, mail or appointments are created, and
// everything is removed at the end. LDGENX_QA_PUBLISH=1 adds a real, short publication on the origin
// tested; LDGENX_WEBKIT_MODULE (a Playwright package with WebKit) adds an upload in Safari's engine.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { createRequire } from "node:module";
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
  // A built-in item gets one working copy, at its own address, created when it is first opened.
  const openedBefore = before.find(
    (e) => e.kind === "service" && e.locale === "fr" && e.legacyId === "bioinformatique",
  );
  if (!openedBefore) {
    const first = await api("/entries", "POST", {
      kind: "service",
      locale: "fr",
      legacyId: "bioinformatique",
      slug: "bioinformatique",
    }, administrator, 201);
    entries.push(first.id);
    const twice = await api("/entries", "POST", {
      kind: "service",
      locale: "fr",
      legacyId: "bioinformatique",
      slug: "bioinformatique",
    });
    assert.equal(twice.id, first.id);
    assert.equal(first.publication, null);
  }
  await api(
    "/entries",
    "POST",
    { kind: "service", locale: "fr", legacyId: "bioinformatique", slug: "invented-page" },
    administrator,
    400,
  );
  await api(
    "/entries",
    "POST",
    { kind: "service", locale: "fr", legacyId: "../../x", slug: "bioinformatique" },
    administrator,
    400,
  );
  ok("A built-in item opens one working copy at its real address; other addresses are refused");

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
    locale: "fr-FR",
  });
  const csp = (await readFile("dist/_headers", "utf8")).match(
    /Content-Security-Policy: (.*wasm-unsafe-eval.*)/,
  )[1];
  await context.route(origin + "/**", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "Content-Security-Policy": csp },
    });
  });
  const signIn = ({ ref, session }) => {
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
    localStorage.setItem("ldgenx-portal-locale", "fr");
  };
  await context.addInitScript(signIn, { ref, session: administrator.session });
  const page = await context.newPage();
  page.on("pageerror", (error) => exceptions.push(error.message));
  await page.goto(origin + "/admin/contenus");
  for (const name of [
    "Expertises",
    "Applications",
    "Études de cas",
    "Publications",
    "Ressources",
    "Autres pages",
  ])
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.locator(".cms-hub-count").first()).toContainText("en ligne");
  await page.screenshot({ path: output + "/hub-fr.png", animations: "disabled" });
  ok("The overview shows every section of the site");
  await page.getByRole("link", { name: /^Ressources/ }).click();
  await expect(page.getByRole("heading", { name: "Ressources", exact: true })).toBeVisible();
  await expect(page.locator(".cms-entry").first()).toBeVisible();
  await expect(page.locator(".cms-status[data-state=live]").first()).toHaveText("En ligne");
  await page.getByRole("button", { name: "Écrire un article", exact: true }).click();
  await page.waitForURL(/\/admin\/contenus\/[\da-f-]{36}$/);
  const articleId = page.url().split("/").at(-1);
  entries.push(articleId);
  const title = `Gestion des images QA ${run}`;
  await page.getByRole("textbox", { name: "Titre", exact: true }).fill(title);
  await page
    .getByRole("textbox", { name: "Introduction", exact: true })
    .fill("Un contenu de contrôle privé pour vérifier les rubriques et les images.");
  await page.locator(".tiptap").click();
  await page.keyboard.type(
    "Ce contenu de contrôle technique est privé et ne décrit aucune étude scientifique réelle. ".repeat(2),
  );
  const mediaBefore = new Set((await api("/media")).map((m) => m.id));
  await page.locator("#cms-cover .cms-cover-add").click();
  const picker = page.getByRole("dialog");
  await picker
    .locator("input[type=file]")
    .setInputFiles("images/official/equipe-maxime.jpg");
  await expect(picker).not.toBeVisible();
  const cover = page.locator("#cms-cover");
  await expect(cover.locator("img")).toBeVisible();
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Enregistrer", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Brouillon enregistré" }),
  ).toBeVisible();
  let article = await api(`/entries/${articleId}`);
  assert(article.document.cover?.mediaId);
  assert(/^gestion-des-images-qa-/.test(article.slug), "The address did not come from the title");
  newMedia.push(article.document.cover.mediaId);
  assert(!mediaBefore.has(article.document.cover.mediaId));
  const uploaded = (await api("/media")).find((m) => m.id === article.document.cover.mediaId);
  assert.deepEqual(
    [...new Set(uploaded.variants.map((v) => v.mime))].sort(),
    ["image/jpeg", "image/webp"],
  );
  assert(uploaded.social, "No social picture");
  const social = uploaded.variants.find((v) => v.mime === "image/jpeg");
  assert.deepEqual([social.width, social.height], [1200, 630]);
  await api(`/media/${uploaded.id}`, "DELETE", undefined, administrator, 409);
  ok("A new article gets its address from its title; its image is converted to WebP sizes and a social JPEG");
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Aperçu de la page", exact: true })
    .click();
  const previewFrame = page.frameLocator(".cms-page-preview-frame");
  await expect(previewFrame.locator(".article-layout")).toBeVisible();
  await expect(previewFrame.locator(".page-hero")).toBeVisible();
  await expect(
    previewFrame.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      previewFrame
        .locator(".article-wide-image img")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await page.screenshot({ path: output + "/article-preview-fr.png", animations: "disabled" });
  await page.keyboard.press("Escape");
  ok("The preview shows the real article template with its picture");
  await page.getByRole("link", { name: "Ressources", exact: true }).click();
  const card = page.locator(".cms-entry").filter({ hasText: title });
  await expect(card).toHaveCount(1);
  await expect(card.locator(".cms-status")).toHaveText("Brouillon");
  await expect(card.locator(".cms-entry-image img")).toBeVisible();
  assert(
    await card
      .locator(".cms-entry-image img")
      .evaluate((i) => i.complete && i.naturalWidth > 0),
  );
  await page.screenshot({ path: output + "/section-fr.png", animations: "disabled" });
  await card.getByRole("button", { name: "Supprimer " + title, exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(title);
  await page.getByRole("dialog").getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(card).toHaveCount(1);
  await card.getByRole("button", { name: "Supprimer " + title, exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Déplacer dans la corbeille", exact: true })
    .click();
  await expect(card).toHaveCount(0);
  await page.goto(origin + "/admin/contenus/corbeille");
  const trashed = page.locator(".cms-page-row").filter({ hasText: title });
  await expect(trashed).toHaveCount(1);
  await page.screenshot({ path: output + "/trash-fr.png", animations: "disabled" });
  await trashed.getByRole("button", { name: "Restaurer", exact: true }).click();
  await expect(trashed).toHaveCount(0);
  await page.goto(origin + "/admin/contenus/rubrique/ressources");
  await expect(page.locator(".cms-entry").filter({ hasText: title })).toHaveCount(1);
  ok("A section page deletes with confirmation; the trash restores a draft with its picture");
  await page.goto(origin + "/admin/contenus/rubrique/etudes-de-cas");
  await page.getByRole("button", { name: "Ajouter une étude de cas", exact: true }).click();
  await page.waitForURL(/\/admin\/contenus\/[\da-f-]{36}$/);
  entries.push(page.url().split("/").at(-1));
  for (const label of ["Contexte", "Question", "Approche", "Enseignements"])
    await expect(page.getByRole("textbox", { name: label, exact: true })).toBeVisible();
  await expect(page.locator("h1")).toHaveText("Nouveau contenu");
  await page.goto(origin + "/admin/contenus/rubrique/etudes-de-cas");
  const estuary = page
    .locator(".cms-entry")
    .filter({ hasText: "Lire l’ADN des poissons" });
  await estuary.getByRole("button", { name: "Modifier", exact: true }).click();
  await page.waitForURL(/\/admin\/contenus\/[\da-f-]{36}$/);
  await expect(page.getByRole("textbox", { name: "Contexte", exact: true })).toHaveValue(/estuaires/);
  await expect(page.locator("#cms-cover img")).toBeVisible();
  await expect(page.locator(".cms-status").first()).toHaveText("En ligne");
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Aperçu de la page", exact: true })
    .click();
  await expect(previewFrame.locator(".study-facts")).toBeVisible();
  await page.screenshot({ path: output + "/study-preview-fr.png", animations: "disabled" });
  ok("Case studies have their own form; a built-in one opens with the site's text, in its template");
  await page.goto(origin + "/admin/contenus/rubrique/expertises");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".cms-entry").first()).toBeVisible();
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  );
  await page.screenshot({ path: output + "/section-fr-mobile.png", animations: "disabled" });
  await page.getByRole("button", { name: "English", exact: true }).first().click();
  await expect(page.locator(".cms-entry").first()).toBeVisible();
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  );
  await page.setViewportSize({ width: 1440, height: 1050 });
  ok("Section pages fit a phone in French and English");
  await page.goto(origin + "/admin/contenus/pages");
  await page
    .getByRole("searchbox", { name: "Rechercher une page", exact: true })
    .fill(template.path);
  await expect(page.locator(".cms-page-row").first()).toBeVisible();
  const houseCover = {
    mediaId: article.document.cover.mediaId,
    alt: "Une photographie du laboratoire LDgenX",
    caption: "",
    credit: "",
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
    .getByRole("button", { name: "Aperçu de la page", exact: true })
    .click();
  await expect(previewFrame.locator(".page-hero")).toBeVisible();
  await expect(
    previewFrame.getByRole("heading", { name: `Page QA ${run}`, exact: true }),
  ).toBeVisible();
  await expect(previewFrame.locator(".cms-page-writing")).toBeVisible();
  await expect
    .poll(() =>
      previewFrame
        .locator(".page-hero-image img")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  ok("Other pages keep their template, sections and added blocks in the preview");
  const after = await api("/public/index", "GET", undefined, null);
  assert.deepEqual(
    after.map((r) => r.id).sort(),
    publicBefore.map((r) => r.id).sort(),
  );
  assert(!after.some((r) => entries.includes(r.id)));
  await api("/media", "GET", undefined, client, 403);
  assert.deepEqual(exceptions, []);
  ok("No QA draft or image was published; client isolation and public content remain unchanged");
  if (process.env.LDGENX_WEBKIT_MODULE) {
    // Safari cannot write WebP from a canvas: its uploads go through the WebAssembly encoder.
    const { webkit } = createRequire(import.meta.url)(process.env.LDGENX_WEBKIT_MODULE);
    const safari = await webkit.launch();
    const safariContext = await safari.newContext({
      viewport: { width: 1280, height: 900 },
      locale: "fr-FR",
    });
    await safariContext.route(origin + "/**", async (route) => {
      if (route.request().resourceType() !== "document") return route.continue();
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), "Content-Security-Policy": csp },
      });
    });
    await safariContext.addInitScript(signIn, { ref, session: administrator.session });
    const safariPage = await safariContext.newPage();
    safariPage.on("pageerror", (error) => exceptions.push(`Safari: ${error.message}`));
    await safariPage.goto(origin + "/admin/medias");
    await safariPage
      .locator("input[type=file]")
      .setInputFiles("images/official/equipe-maxime.jpg");
    const report = safariPage.getByRole("status").filter({ hasText: "Image optimisée" });
    await expect(report).toBeVisible({ timeout: 90000 });
    const converted = (await api("/media")).find(
      (m) => !mediaBefore.has(m.id) && m.id !== uploaded.id,
    );
    await safari.close();
    if (converted) {
      newMedia.push(converted.id);
      assert(converted.variants.some((v) => v.mime === "image/webp"));
    } else assert.equal(uploaded.bytes > 0, true);
    assert.deepEqual(exceptions, []);
    ok("Safari's engine converts images to WebP and uploads them");
  }
  if (process.env.LDGENX_QA_PUBLISH === "1") {
    // A real publication, for a live release check. A disposable article goes online for under a
    // minute, is checked as a visitor and a search engine see it, then is removed. Nothing
    // reaches IndexNow: the API skips disposable accounts.
    const visitor = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const reader = await visitor.newPage();
    reader.on("pageerror", (error) => exceptions.push(error.message));
    article = await api(`/entries/${articleId}`);
    article = await api(`/entries/${articleId}/publish`, "POST", {
      version: article.version,
      reviewed: true,
    });
    assert.equal(article.publication.status, "published");
    const address = `/ressources/${article.slug}`,
      absolute = `https://www.ldgenx.fr${address}`;
    const page200 = () => fetch(origin + address).then((r) => r.status);
    await expect.poll(page200, { timeout: 60000, intervals: [2000] }).toBe(200);
    const html = await fetch(origin + address).then((r) => r.text());
    assert(html.includes(`rel="canonical" href="${absolute}"`), "canonical");
    assert(/name="robots" content="index, follow/.test(html), "robots");
    assert(html.includes("article-layout"), "article template");
    assert(html.includes('property="article:published_time"'), "published time");
    const graph = JSON.parse(
      html.match(/id="ldgenx-schema"[^>]*>([\s\S]*?)<\/script>/)[1],
    )["@graph"];
    const node = graph.find((n) => n["@type"] === "Article");
    assert.equal(node.headline, title);
    assert(node.datePublished && node.dateModified, "article dates");
    const share = html.match(/property="og:image" content="([^"]+)"/)[1];
    assert(share.endsWith("/social.jpg"), share);
    const shared = await fetch(share.replace("https://www.ldgenx.fr", origin));
    assert.equal(shared.status, 200);
    assert.equal(shared.headers.get("content-type"), "image/jpeg");
    assert.match(shared.headers.get("cache-control"), /max-age=31536000/);
    ok("A published article has its address, canonical, robots, structured data and share picture");
    await expect
      .poll(
        async () =>
          (await fetch(`${origin}/ressources?qa=${Date.now()}`).then((r) => r.text()))
            .split('id="ldgenx-editorial"')[0]
            .includes(address),
        { timeout: 60000, intervals: [2000] },
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await fetch(`${origin}/sitemaps/ressources.xml?qa=${Date.now()}`).then((r) => r.text())).includes(absolute),
        { timeout: 60000, intervals: [2000] },
      )
      .toBe(true);
    assert((await fetch(`${origin}/llms.txt`).then((r) => r.text())).includes(absolute));
    await reader.goto(origin + "/ressources");
    const tile = reader.locator(".resource-grid .editorial-item").filter({ hasText: title });
    await expect(tile).toBeVisible();
    await expect
      .poll(() =>
        tile.locator("img").evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    assert(
      (await tile.locator("img").getAttribute("src")).includes("/media/"),
      "The picture is not served from the site",
    );
    await reader.goto(origin + address);
    await expect(reader.locator(".article-layout")).toBeVisible();
    await expect(reader.locator("h1")).toHaveText(title);
    ok("It joins its section with the site's own card, the sitemap and the AI summary files");
    article = await api(`/entries/${articleId}/withdraw`, "POST", { version: article.version });
    await expect.poll(page200, { timeout: 60000, intervals: [2000] }).toBe(410);
    await expect
      .poll(
        async () =>
          (await fetch(`${origin}/sitemaps/ressources.xml?qa=${Date.now()}`).then((r) => r.text())).includes(absolute),
        { timeout: 60000, intervals: [2000] },
      )
      .toBe(false);
    ok("Taking it offline answers 410 and leaves the sitemap");
    const livePath = "/en/about-us/partners",
      publicHtml = () =>
        fetch(`${origin}${livePath}?qa=${Date.now()}`)
          .then((r) => r.text())
          .then((text) =>
            text
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
    live = await api(`/entries/${live.id}/publish`, "POST", { version: live.version });
    assert.equal(live.publication.status, "published");
    await expect
      .poll(async () => (await publicHtml()).includes('"document":{'), {
        timeout: 60000,
        intervals: [2000],
      })
      .toBe(true);
    await reader.goto(origin + livePath);
    const heroImage = reader.locator(".page-hero-image img");
    await expect(heroImage).toBeVisible();
    await expect
      .poll(() =>
        heroImage.evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    await visitor.close();
    live = await api(`/entries/${live.id}/withdraw`, "POST", { version: live.version });
    await expect.poll(publicHtml, { timeout: 60000, intervals: [2000] }).toBe(original);
    assert.deepEqual(exceptions, []);
    ok("Publishing a page with an uploaded image reaches visitors; withdrawing restores the exact original");
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
          "Disposable accounts, private drafts and a public-source test image; no mail, client messages or appointments created.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Disposable accounts, drafts and newly uploaded QA media removed.",
  );
}
