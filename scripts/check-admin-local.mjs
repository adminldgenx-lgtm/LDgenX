// The content administration, end to end, with nothing leaving this machine: the built site, real
// browsers (Chrome and Safari's engine), the real validation code, and an in-memory stand-in for
// the content API. Needs a finished `npm run build`; run it with Node 22.18 or later. Set
// LDGENX_WEBKIT_MODULE to a Playwright package with WebKit installed to add the Safari upload.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { parseEnv } from "node:util";
import { chromium, expect as baseExpect } from "@playwright/test";
import {
  contentPath,
  emptyDocument,
  publicationIssues,
  summarize,
  validateDocument,
} from "../supabase/functions/_shared/editorial.ts";
import { jpegSize, webpSize } from "../supabase/functions/_shared/editorial-media.ts";

const expect = baseExpect.configure({ timeout: 20000 });
const port = 4187,
  origin = `http://127.0.0.1:${port}`,
  output = process.env.LDGENX_QA_OUTPUT ?? "docs/content-management-qa/local";
const project = parseEnv(await readFile(".env.production", "utf8")).VITE_SUPABASE_URL;
const ref = new URL(project).hostname.split(".")[0];
const adminId = randomUUID();
const passed = [];
const ok = (label) => {
  passed.push(label);
  console.log(label);
};

// ---- The stand-in: the routes the administration uses, on the same validation code as the API.
const entries = new Map(),
  media = new Map(),
  publications = new Map();
const now = () => new Date().toISOString();
const bytesOf = (name) =>
  ({ jpg: "image/jpeg", webp: "image/webp" })[name.split(".").at(-1)];
function publicationOf(entry) {
  const row = publications.get(entry.id);
  if (!row) return null;
  return summarize(
    {
      id: entry.id,
      kind: entry.kind,
      locale: entry.locale,
      slug: entry.slug,
      path: contentPath(entry.kind, entry.locale, entry.slug),
      groupId: entry.groupId,
      legacyId: entry.legacyId,
      status: row.status,
      publishedAt: now(),
      updatedAt: now(),
    },
    row.snapshot ?? emptyDocument(),
  );
}
const view = (entry) => ({
  ...entry,
  publication: publicationOf(entry),
  coverMedia: media.get(entry.document.cover?.mediaId) ?? null,
  authorName: "QA",
});
function make(kind, locale, legacyId = null, slug = null) {
  const id = randomUUID();
  const entry = {
    id,
    kind,
    locale,
    slug: slug ?? `document-${id.slice(0, 8)}`,
    groupId: randomUUID(),
    legacyId,
    version: 1,
    publishedVersion: null,
    document: emptyDocument(),
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };
  entries.set(id, entry);
  return entry;
}
function api(method, path, body) {
  if (path === "/stats")
    return {
      mediaBytes: 0,
      mediaLimit: 250_000_000,
      projectBytes: 0,
      projectLimit: 900_000_000,
    };
  if (path === "/page-templates") return JSON.parse(pageTemplates);
  if (path === "/media" && method === "GET") return [...media.values()];
  if (path === "/entries" && method === "GET")
    return [...entries.values()].map(view);
  if (path === "/entries" && method === "POST") {
    if (body.kind === "page") {
      const slug = body.pagePath.replace(/^\/(?:en\/?)?/, "");
      const found = [...entries.values()].find(
        (e) => e.kind === "page" && e.slug === slug && e.locale === body.locale,
      );
      return view(found ?? make("page", body.locale, `page:${body.pagePath}`, slug));
    }
    const found =
      body.legacyId &&
      [...entries.values()].find(
        (e) =>
          e.kind === body.kind &&
          e.locale === body.locale &&
          e.legacyId === body.legacyId,
      );
    return view(found || make(body.kind, body.locale, body.legacyId, body.slug));
  }
  const match = path.match(/^\/entries\/([^/]+)(?:\/(\w+))?$/);
  if (!match) return { status: 404, body: { code: "not_found" } };
  const entry = entries.get(match[1]);
  if (!entry) return { status: 404, body: { code: "not_found" } };
  const action = match[2];
  if (method === "GET" && !action) return view(entry);
  if (method === "DELETE") {
    entries.delete(entry.id);
    return { ok: true };
  }
  if (body?.version !== undefined && body.version !== entry.version)
    return { status: 409, body: { code: "conflict" } };
  entry.version++;
  entry.updatedAt = now();
  if (method === "PATCH") {
    entry.document = validateDocument(body.document, entry.kind);
    if (!entry.legacyId && !entry.publishedVersion) {
      const slug =
        body.slug ??
        entry.document.title
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      if (slug) entry.slug = slug;
    }
  }
  if (action === "publish") {
    const document = validateDocument(entry.document, entry.kind);
    if (body.reviewed) document.reviewed = true;
    const issues = publicationIssues(document, entry.kind);
    if (issues.length) {
      entry.version--;
      return {
        status: 400,
        body: { code: "publication_incomplete", details: issues },
      };
    }
    entry.document = document;
    publications.set(entry.id, { status: "published", snapshot: document });
    entry.publishedVersion = entry.version;
  }
  if (action === "withdraw")
    publications.set(entry.id, { status: "withdrawn", snapshot: null });
  if (action === "reinstate") {
    publications.delete(entry.id);
    entry.publishedVersion = null;
  }
  if (action === "trash") {
    entry.deletedAt = now();
    if (entry.legacyId || entry.publishedVersion)
      publications.set(entry.id, { status: "withdrawn", snapshot: null });
  }
  if (action === "untrash") entry.deletedAt = null;
  return view(entry);
}
async function upload(request) {
  // Multipart bodies are read the way the Edge Function reads them.
  const form = await new Response(request.postDataBuffer(), {
    headers: { "Content-Type": request.headers()["content-type"] },
  }).formData();
  const id = randomUUID(),
    variants = [],
    urls = {};
  let social;
  for (const file of form.getAll("files")) {
    const data = new Uint8Array(await file.arrayBuffer());
    // WebKit's interception drops binary bodies: its files are checked in the page instead.
    if (!data.length) continue;
    const jpeg = data[0] === 0xff && data[1] === 0xd8;
    const { width, height } = jpeg ? jpegSize(data) : webpSize(data);
    const name = jpeg ? "social.jpg" : `${width}.webp`;
    variants.push({
      path: `${id}/${name}`,
      width,
      height,
      bytes: data.length,
      mime: bytesOf(name),
    });
    const url = `data:${bytesOf(name)};base64,${Buffer.from(data).toString("base64")}`;
    if (jpeg) social = url;
    else urls[width] = url;
  }
  const item = {
    id,
    name: String(form.get("name")),
    kind: "image",
    bytes: variants.reduce((total, v) => total + v.bytes, 0),
    variants,
    isPublic: false,
    createdAt: now(),
    urls,
    social,
    uses: 0,
  };
  media.set(id, item);
  return item;
}
const registry = await readFile("supabase/functions/_shared/editorial-pages.ts", "utf8");
const pageTemplates = registry.slice(registry.indexOf("["), registry.lastIndexOf("]") + 1);

// The policy of the live admin, less the upgrade to HTTPS this local address cannot follow.
const csp = (await readFile("dist/_headers", "utf8"))
  .match(/Content-Security-Policy: (.*wasm-unsafe-eval.*)/)[1]
  .replace("; upgrade-insecure-requests", "");
const session = {
  access_token: "local",
  refresh_token: "local",
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  expires_in: 86400,
  token_type: "bearer",
  user: { id: adminId, email: "qa@example.invalid", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: now() },
};
const adminUser = {
  id: adminId,
  role: "admin",
  status: "active",
  email: "qa@example.invalid",
  firstName: "Local",
  lastName: "QA",
  locale: "fr",
  notify: {},
};
async function connect(context, problems) {
  await context.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value);
      localStorage.setItem("ldgenx-portal-locale", "fr");
    },
    [`sb-${ref}-auth-token`, JSON.stringify(session)],
  );
  await context.route("**/*", async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (url.origin === origin) {
      if (request.resourceType() !== "document") return route.continue();
      const response = await route.fetch();
      return route.fulfill({
        response,
        headers: { ...response.headers(), "Content-Security-Policy": csp },
      });
    }
    const json = (body, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
        body: JSON.stringify(body),
      });
    if (request.method() === "OPTIONS")
      return route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
      });
    if (url.pathname.startsWith("/functions/v1/editorial")) {
      const path = url.pathname.replace("/functions/v1/editorial", "");
      if (path === "/media" && request.method() === "POST")
        return json(await upload(request));
      const body = request.postData() ? JSON.parse(request.postData()) : undefined;
      const result = api(request.method(), path, body);
      return result?.status ? json(result.body, result.status) : json(result);
    }
    if (url.pathname.startsWith("/auth/v1/user")) return json(session.user);
    if (url.pathname.endsWith("/functions/v1/portal/session")) return json(adminUser);
    if (url.hostname.endsWith("supabase.co")) return json([]);
    problems.push(`Left the machine: ${url.href}`);
    return route.abort();
  });
}

await mkdir(output, { recursive: true });
const server = spawn(process.execPath, ["scripts/serve-editorial-preview.mjs", String(port)], {
  stdio: "ignore",
});
let browser;
try {
  for (let i = 0; i < 40; i++) {
    if (await fetch(origin + "/robots.txt").then((r) => r.ok, () => false)) break;
    assert(i < 39, "The local site did not start");
    await new Promise((done) => setTimeout(done, 500));
  }
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "fr-FR",
    reducedMotion: "reduce",
  });
  const problems = [];
  await connect(context, problems);
  const page = await context.newPage();
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !/WebSocket|realtime|Failed to load resource/.test(message.text()))
      problems.push(message.text());
  });
  await page.goto(origin + "/admin/contenus");
  for (const name of ["Expertises", "Applications", "Études de cas", "Publications", "Ressources", "Autres pages"])
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.locator(".cms-hub-card").first()).toContainText("en ligne");
  await page.screenshot({ path: output + "/hub-fr.png" });
  ok("The overview shows every section of the site, with its counts");

  await page.getByRole("link", { name: /^Études de cas/ }).click();
  await expect(page.getByRole("heading", { name: "Études de cas", exact: true })).toBeVisible();
  await expect(page.locator(".cms-entry")).toHaveCount(6);
  await expect(page.locator(".cms-entry .cms-status").first()).toHaveText("En ligne");
  await expect
    .poll(() =>
      page.locator(".cms-entry-image img").evaluateAll((images) =>
        images.length === 6 && images.every((i) => i.complete && i.naturalWidth > 0),
      ),
    )
    .toBe(true);
  await page.screenshot({ path: output + "/section-fr.png" });
  const tabs = page.locator(".cms-tabs");
  await tabs.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".cms-entry").first()).toContainText("/en/case-studies/");
  await tabs.getByRole("button", { name: "Français", exact: true }).click();
  ok("A section page lists its items, in each language, with the site's own pictures");

  // A built-in study opens on what the site shows, and stays unchanged in its template.
  await page
    .locator(".cms-entry")
    .filter({ hasText: "Lire l’ADN des poissons" })
    .getByRole("button", { name: "Modifier", exact: true })
    .click();
  await page.waitForURL(/\/admin\/contenus\/[\da-f-]{36}$/);
  const context_ = page.getByRole("textbox", { name: "Contexte", exact: true });
  await expect(context_).toHaveValue(/estuaires/);
  await expect(page.locator("#cms-cover img")).toBeVisible();
  await page.screenshot({ path: output + "/editor-study-fr.png", fullPage: true });
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Aperçu de la page", exact: true })
    .click();
  const preview = page.frameLocator(".cms-page-preview-frame");
  await expect(preview.locator(".study-facts")).toBeVisible();
  await expect(preview.locator(".step-rows")).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: output + "/preview-study-fr.png" });
  await page.keyboard.press("Escape");
  await context_.fill("Un contexte modifié pour le contrôle.");
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Enregistrer", exact: true })
    .click();
  await expect(page.getByRole("status").filter({ hasText: "Brouillon enregistré" })).toBeVisible();
  await page.getByRole("link", { name: "Études de cas", exact: true }).click();
  const edited = page.locator(".cms-entry").filter({ hasText: "Lire l’ADN des poissons" });
  await expect(edited.locator(".cms-status")).toHaveText("En ligne · modifications à publier");
  await edited.getByRole("button", { name: "Publier", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Publier", exact: true })).toBeDisabled();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Publier", exact: true }).click();
  await expect(edited.locator(".cms-status")).toHaveText("En ligne");
  await expect(page.getByRole("status").filter({ hasText: "moteurs de recherche" })).toBeVisible();
  ok("A built-in study opens with the site's text, in its real template; edit, save and publish work");

  await edited.getByRole("button", { name: "Retirer du site", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Retirer du site", exact: true }).click();
  await expect(edited.locator(".cms-status")).toHaveText("Hors ligne");
  await edited.getByRole("button", { name: "Remettre en ligne", exact: true }).click();
  await expect(edited.locator(".cms-status")).toHaveText("En ligne");
  ok("Taking an item offline and putting it back are one click each");

  // A new article, from the empty form to the section list.
  await page.goto(origin + "/admin/contenus/rubrique/ressources");
  await page.getByRole("button", { name: "Écrire un article", exact: true }).click();
  await page.waitForURL(/\/admin\/contenus\/[\da-f-]{36}$/);
  await expect(page.locator("h1")).toHaveText("Nouveau contenu");
  await expect(page.getByText(/éléments à compléter/)).toBeVisible();
  await page.getByRole("textbox", { name: "Titre", exact: true }).fill("Un article de contrôle");
  await page
    .getByRole("textbox", { name: "Introduction", exact: true })
    .fill("Une introduction pour vérifier la publication d’un article.");
  await page.locator("#cms-cover .cms-cover-add").click();
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles("images/official/equipe-maxime.jpg");
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 30000 });
  await expect(page.locator("#cms-cover img")).toBeVisible();
  await page.getByRole("button", { name: "Utiliser cette trame", exact: true }).click();
  await page.locator(".tiptap p").first().click();
  await page.keyboard.type("Un premier paragraphe de contrôle assez long. ".repeat(4));
  await page.getByRole("checkbox", { name: /J’ai relu ce contenu/ }).check();
  await page.screenshot({ path: output + "/editor-article-fr.png", fullPage: true });
  await page
    .locator(".cms-page-head")
    .getByRole("button", { name: "Aperçu de la page", exact: true })
    .click();
  await expect(preview.locator(".article-layout")).toBeVisible();
  await expect(preview.locator(".article-aside a").first()).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: output + "/preview-article-fr.png" });
  await page.keyboard.press("Escape");
  await page.locator(".cms-publish").click();
  await expect(page.getByRole("status").filter({ hasText: "moteurs de recherche" })).toBeVisible();
  const article = [...entries.values()].find((e) => e.document.title === "Un article de contrôle");
  assert.equal(article.slug, "un-article-de-controle");
  assert.equal(publications.get(article.id).status, "published");
  ok("A new article gets its address from its title, previews in the real template and publishes");

  const uploaded = [...media.values()].at(-1);
  assert.deepEqual(
    [...new Set(uploaded.variants.map((v) => v.mime))].sort(),
    ["image/jpeg", "image/webp"],
  );
  const social = uploaded.variants.find((v) => v.mime === "image/jpeg");
  assert.deepEqual([social.width, social.height], [1200, 630]);
  const source = (await readFile("images/official/equipe-maxime.jpg")).length;
  const largest = uploaded.variants.filter((v) => v.mime === "image/webp").at(-1);
  assert(largest.bytes < source, "The picture did not get lighter");
  console.log(`  ${source} → ${largest.bytes} bytes at ${largest.width} px`);
  ok("An upload becomes WebP sizes and a 1200 × 630 social JPEG, lighter than its source");

  await page.goto(origin + "/admin/contenus/rubrique/ressources");
  const row = page.locator(".cms-entry").filter({ hasText: "Un article de contrôle" });
  await row.getByRole("button", { name: /^Supprimer/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Déplacer dans la corbeille", exact: true }).click();
  await expect(row).toHaveCount(0);
  await page.goto(origin + "/admin/contenus/corbeille");
  const trashed = page.locator(".cms-page-row").filter({ hasText: "Un article de contrôle" });
  await trashed.getByRole("button", { name: "Restaurer", exact: true }).click();
  await expect(trashed).toHaveCount(0);
  ok("Deleting asks first, and the trash restores");

  // The other sections have their own forms.
  for (const [section, add, field] of [
    ["expertises", "Ajouter une expertise", "Grand titre de la page"],
    ["applications", "Ajouter une application", "Grand titre de la page"],
    ["publications", "Ajouter une publication", "La question"],
  ]) {
    await page.goto(`${origin}/admin/contenus/rubrique/${section}`);
    await page.getByRole("button", { name: add, exact: true }).click();
    await page.waitForURL(/\/admin\/contenus\/[\da-f-]{36}$/);
    await expect(page.getByRole("textbox", { name: new RegExp(`^${field}`) })).toBeVisible();
    await page.screenshot({ path: `${output}/editor-${section}-fr.png`, fullPage: true });
  }
  await page.goto(origin + "/admin/contenus/pages");
  await expect(page.locator(".cms-page-row").first()).toBeVisible();
  assert.equal(
    await page.locator(".cms-page-row", { hasText: "/services/bioinformatique" }).count(),
    0,
    "Expertises have their own section",
  );
  ok("Each section has its own form; other pages are listed apart");

  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/admin/contenus", "/admin/contenus/rubrique/publications", "/admin/medias"]) {
    await page.goto(origin + path);
    await page.waitForTimeout(600);
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `${path} overflows on a phone`,
    );
  }
  await page.goto(origin + "/admin/contenus/rubrique/publications");
  await page.waitForTimeout(600);
  await page.screenshot({ path: output + "/section-fr-mobile.png" });
  assert.deepEqual(problems, []);
  ok("Every screen fits a phone, with no browser error and no outside request");
  await context.close();

  if (process.env.LDGENX_WEBKIT_MODULE) {
    const { webkit } = createRequire(import.meta.url)(process.env.LDGENX_WEBKIT_MODULE);
    const safari = await webkit.launch();
    const safariContext = await safari.newContext({
      viewport: { width: 1280, height: 900 },
      locale: "fr-FR",
    });
    const issues = [];
    await connect(safariContext, issues);
    await safariContext.addInitScript(() => {
      const send = window.fetch;
      window.sentFiles = [];
      window.fetch = async (input, init) => {
        if (init?.body instanceof FormData)
          for (const file of init.body.getAll("files"))
            window.sentFiles.push({
              name: file.name,
              type: file.type,
              bytes: [...new Uint8Array(await file.arrayBuffer())],
            });
        return send(input, init);
      };
    });
    const safariPage = await safariContext.newPage();
    safariPage.on("pageerror", (error) => issues.push(error.message));
    await safariPage.goto(origin + "/admin/medias");
    await expect(safariPage.locator("input[type=file]")).toBeAttached();
    const before = media.size;
    await safariPage
      .locator("input[type=file]")
      .setInputFiles(["images/official/equipe-maxime.jpg", "public/brand/full.png"]);
    await expect.poll(() => media.size, { timeout: 120000 }).toBe(before + 2);
    await expect(
      safariPage.getByRole("status").filter({ hasText: "Image optimisée" }),
    ).toBeVisible({ timeout: 120000 });
    const sent = await safariPage.evaluate(() => window.sentFiles);
    await safari.close();
    assert(sent.length >= 4, "Too few files were sent");
    for (const file of sent) {
      const bytes = Uint8Array.from(file.bytes);
      if (file.type === "image/jpeg") {
        assert.deepEqual(jpegSize(bytes), { width: 1200, height: 630 });
      } else {
        assert.equal(file.type, "image/webp");
        assert.equal(String(webpSize(bytes).width) + ".webp", file.name);
      }
    }
    assert.deepEqual(issues, []);
    ok("Safari's engine converts photographs and transparent PNGs to WebP, under the real security policy");
  }
  console.log(`\n${passed.length} administration checks passed.`);
} finally {
  if (browser) await browser.close();
  server.kill();
}
