// What visitors get once content is published, without publishing anything: the built worker runs in
// the real Cloudflare runtime against a local stand-in for the public API, and a real browser
// loads the result. Covers edits, withdrawals, new sections and a backend that fails or hangs.
// Nothing leaves this machine. Needs a finished `npm run build`.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const apiPort = 4199,
  sitePort = 4188,
  site = `http://127.0.0.1:${sitePort}`;
const registry = await readFile(
  "supabase/functions/_shared/editorial-pages.ts",
  "utf8",
);
const templates = JSON.parse(
  registry.slice(registry.indexOf("["), registry.lastIndexOf("]") + 1),
);
const rendered =
  /^\/(?:ressources|etudes-de-cas|recherche)(?:\/|$)|^\/en\/(?:resources|case-studies|research)(?:\/|$)/;
const file = (path) => `dist/${path === "/" ? "index" : path.slice(1)}.html`;
const staticHtml = (path) => readFile(file(path), "utf8");
const heading = (html) =>
  html
    .match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const marker = "BlocQAprive20261030";
const cover = {
  staticSrc: "/images/riviere-1000.webp",
  alt: "Une rivière",
  caption: "",
  credit: "LDgenX",
  licenceUrl: "",
};
function row(kind, path, locale, status, changes = {}) {
  const document = {
    title: "Titre modifié de contrôle",
    summary:
      "Une introduction modifiée de contrôle, suffisamment développée pour la publication.",
    category: "",
    author: "LDgenX",
    seoTitle: "",
    seoDescription: "",
    cover: null,
    body: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Bloc ajouté de contrôle" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: `${marker} après l’introduction.` }],
        },
      ],
    },
    references: [],
    doi: "",
    journal: "",
    year: "",
    reviewed: true,
    ...changes,
  };
  return {
    id: randomUUID(),
    kind,
    path,
    locale,
    slug:
      kind === "page"
        ? path.replace(locale === "en" ? /^\/en(?:\/|$)/ : /^\//, "")
        : path.split("/").pop(),
    groupId: randomUUID(),
    legacyId: kind === "page" ? "page:" + path : null,
    status,
    title: document.title,
    summary: document.summary,
    category: "",
    author: "LDgenX",
    cover: document.cover,
    seoTitle: "",
    seoDescription: "",
    publishedAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    coverMedia: null,
    journal: "",
    year: "",
    doi: "",
    document,
    media: [],
  };
}
const article = row("article", "/ressources/controle", "fr", "published");
const scenarios = {
  untouched: [article],
  edited: [
    article,
    row("page", "/", "fr", "published", {
      title: "Accueil modifié de contrôle",
      cover,
    }),
    // A page of the other language must never break this one: its catalogue is not loaded.
    row("page", "/en", "en", "published", { title: "Edited home control" }),
    row("page", "/a-propos", "fr", "published", { cover }),
    row("page", "/contact", "fr", "withdrawn"),
    row("page", "/services/adn-environnemental-adne", "fr", "published", {
      title: "ADN environnemental modifié",
    }),
    row("page", "/applications/biodiversite-conservation", "fr", "withdrawn"),
    row("page", "/etudes-de-cas", "fr", "published", {
      title: "Études modifiées de contrôle",
    }),
    row("service", "/services/nouvelle-expertise", "fr", "published", {
      title: "Nouvelle expertise de contrôle",
    }),
    row("application", "/applications/nouvelle-application", "fr", "published", {
      title: "Nouvelle application de contrôle",
    }),
    row("service", "/en/services/new-expertise", "en", "published", {
      title: "New expertise control",
    }),
    row("service", "/services/expertise-retiree", "fr", "withdrawn"),
  ],
};

let scenario = "untouched";
const api = createServer((request, response) => {
  if (scenario === "hanging") return;
  if (scenario === "failing") {
    response.statusCode = 503;
    return response.end("{}");
  }
  const url = new URL(request.url, "http://local"),
    rows = scenarios[scenario];
  response.setHeader("Content-Type", "application/json");
  if (url.pathname.endsWith("/public/index"))
    return response.end(
      JSON.stringify(
        rows.map((entry) => {
          const summary = { ...entry };
          delete summary.document;
          delete summary.media;
          return summary;
        }),
      ),
    );
  if (url.pathname.endsWith("/public/document")) {
    const found = rows.find((r) => r.path === url.searchParams.get("path"));
    response.statusCode = !found ? 404 : found.status === "withdrawn" ? 410 : 200;
    return response.end(JSON.stringify(found?.status === "published" ? found : {}));
  }
  response.statusCode = 404;
  response.end("{}");
});

const use = async (name) => {
  scenario = name;
  console.log(`\n${name}`);
  // Each worker instance keeps the public index for 15 seconds.
  await new Promise((done) => setTimeout(done, 16000));
};
const passed = [];
const ok = (label) => {
  passed.push(label);
  console.log("  " + label);
};
const get = async (path, options) => {
  const started = performance.now(),
    response = await fetch(site + path, { redirect: "manual", ...options });
  return {
    response,
    body: await response.text(),
    time: performance.now() - started,
  };
};
const secure = (response) => {
  for (const header of [
    "content-security-policy",
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
  ])
    assert(response.headers.get(header), "Missing " + header);
};

async function workerChecks() {
  await use("untouched");
  let untouched = 0;
  for (const { path } of templates) {
    const { response, body } = await get(path);
    assert.equal(response.status, 200, path);
    secure(response);
    if (rendered.test(path))
      assert.equal(heading(body), heading(await staticHtml(path)), path);
    else {
      assert.equal(body, await staticHtml(path), "Changed bytes on " + path);
      untouched++;
    }
  }
  ok(`${untouched} untouched pages stay byte-identical to the CDN files`);
  for (const [path, status] of [
    ["/services/", 301],
    ["/a-propos/", 301],
    ["/services/inconnue", 404],
    ["/en/applications/unknown", 404],
    ["/services-inconnu", 404],
    ["/ressources/controle", 200],
    ["/sitemap.xml", 200],
    ["/llms-full.txt", 200],
    ["/admin/contenus", 200],
    ["/espace", 200],
  ])
    assert.equal((await get(path)).response.status, status, path);
  assert.equal((await get("/", { method: "POST" })).response.status, 405);
  assert.equal((await get("/", { method: "HEAD" })).response.status, 200);
  ok("Redirects, unknown addresses, private routes and methods answer as before");
  const before = {
    pages: (await get("/sitemaps/pages.xml")).body,
    full: (await get("/llms-full.txt")).body,
  };

  await use("edited");
  let page = await get("/");
  secure(page.response);
  assert.equal(heading(page.body), "Accueil modifié de contrôle");
  assert(page.body.includes(marker));
  assert(page.body.includes("<title>Accueil modifié de contrôle | LDgenX</title>"));
  assert(/og:image" content="[^"]*riviere-1000\.webp/.test(page.body));
  assert(/"dateModified":"2026-10-30/.test(page.body));
  assert(!/class="[^"]*cms-home-cover-credit/.test(page.body));
  JSON.parse(page.body.match(/id="ldgenx-schema"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(
    JSON.parse(page.body.match(/id="ldgenx-editorial"[^>]*>([\s\S]*?)<\/script>/)[1])
      .document.path,
    "/",
  );
  ok("An edited homepage has its title, block, cover, metadata and structured data");
  assert.equal(heading((await get("/en")).body), "Edited home control");
  assert((await get("/a-propos")).body.includes(marker));
  assert.equal(
    heading((await get("/etudes-de-cas")).body),
    "Études modifiées de contrôle",
  );
  for (const path of [
    "/contact",
    "/applications/biodiversite-conservation",
    "/services/bioinformatique",
    "/en/applications",
  ])
    assert.equal((await get(path)).body, await staticHtml(path), path);
  ok("Withdrawn edits restore the exact original; other pages stay static");
  assert((await get("/services")).body.includes("Nouvelle expertise de contrôle"));
  assert((await get("/en/services")).body.includes("New expertise control"));
  assert((await get("/applications")).body.includes("Nouvelle application de contrôle"));
  page = await get("/services/nouvelle-expertise");
  assert(page.body.includes("page-hero") && page.body.includes(marker));
  assert.equal(heading(page.body), "Nouvelle expertise de contrôle");
  assert.equal((await get("/services/expertise-retiree")).response.status, 410);
  ok("New expertises and applications appear in their section and language only");
  const pagesMap = (await get("/sitemaps/pages.xml")).body,
    expertises = (await get("/sitemaps/expertises.xml")).body,
    full = (await get("/llms-full.txt")).body,
    short = (await get("/llms.txt")).body;
  const urlEntry = (xml, path) =>
    xml
      .match(
        new RegExp(`<url><loc>https://www\\.ldgenx\\.fr${path}</loc>[\\s\\S]*?</url>`),
      )?.[0]
      .replace(/<lastmod>.*?<\/lastmod>/, "");
  const llmsEntry = (text, path) =>
    text
      .split(/(?=^#{1,3} )/m)
      .find((part) => part.includes(`\nhttps://www.ldgenx.fr${path}\n`));
  assert(expertises.includes("/services/nouvelle-expertise"));
  assert(!expertises.includes("expertise-retiree"));
  assert(pagesMap.includes("/applications/nouvelle-application"));
  assert.equal(urlEntry(pagesMap, "/contact"), urlEntry(before.pages, "/contact"));
  for (const path of [
    "/services/adn-environnemental-adne",
    "/applications/biodiversite-conservation",
  ]) {
    assert(llmsEntry(before.full, path), path);
    assert.equal(llmsEntry(full, path), llmsEntry(before.full, path), path);
  }
  assert(short.includes("[À propos](https://www.ldgenx.fr/a-propos)"));
  assert(short.includes("Nouvelle expertise de contrôle"));
  ok("Sitemaps and llms files gain new content and keep edited pages whole");

  await use("failing");
  for (const { path } of templates) {
    const { response, body } = await get(path);
    assert.equal(response.status, 200, path);
    assert.equal(body, await staticHtml(path), path);
  }
  page = await get("/ressources/controle");
  assert.equal(page.response.status, 503);
  assert(page.response.headers.get("x-robots-tag")?.includes("noindex"));
  ok(`Backend failing: all ${templates.length} pages stay online; CMS-only content is 503/noindex`);

  await use("hanging");
  for (const path of ["/", "/en", "/services", "/contact"]) {
    page = await get(path);
    assert.equal(page.body, await staticHtml(path), path);
    assert(page.time < 3500, `${path} took ${Math.round(page.time)} ms`);
  }
  ok("Backend hanging: pages fall back to their static version within 3.5 s");
}

async function browserChecks() {
  await use("edited");
  const browser = await chromium.launch({ channel: "chrome", headless: true }),
    problems = [];
  const open = async (context, path, label) => {
    const page = await context.newPage();
    page.on("pageerror", (e) => problems.push(`${label} ${path}: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`${label} ${path}: ${m.text()}`);
    });
    await page.goto(site + path, { waitUntil: "load" });
    await page.waitForTimeout(2000);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `${path} overflows at ${label}`,
    );
    return page;
  };
  try {
    for (const [label, viewport, mobile] of [
      ["desktop", { width: 1440, height: 900 }, false],
      ["mobile", { width: 390, height: 844 }, true],
    ]) {
      const context = await browser.newContext({
        viewport,
        isMobile: mobile,
        hasTouch: mobile,
        deviceScaleFactor: 2,
        locale: "fr-FR",
      });
      for (const [path, title] of [
        ["/", "Accueil modifié de contrôle"],
        ["/en", "Edited home control"],
        ["/a-propos", "Titre modifié de contrôle"],
        ["/services", null],
        ["/services/nouvelle-expertise", "Nouvelle expertise de contrôle"],
        ["/services/adn-environnemental-adne", "ADN environnemental modifié"],
        ["/etudes-de-cas", "Études modifiées de contrôle"],
        ["/contact", null],
      ]) {
        const page = await open(context, path, label);
        if (title)
          assert.equal(
            (await page.locator("h1").first().textContent()).trim(),
            title,
          );
        await page.close();
      }
      const home = await open(context, "/", label);
      assert(
        await home
          .locator(".cms-home-cover")
          .evaluate((image) => image.complete && image.naturalWidth > 0),
      );
      assert.equal(
        await home
          .locator(".cms-home-cover")
          .evaluate((image) => getComputedStyle(image).zIndex),
        "-2",
        "The cover must stay under the hero shade",
      );
      await home.close();
      // Moving inside the site, from a static page to an edited one.
      const page = await open(context, "/contact", label);
      await page.evaluate(() =>
        document.querySelector('footer a[href="/a-propos"]').click(),
      );
      await page.waitForFunction(
        () =>
          document
            .querySelector("h1")
            ?.textContent.includes("Titre modifié de contrôle"),
        null,
        { timeout: 8000 },
      );
      await page.close();
      await context.close();
    }
    assert.deepEqual([...new Set(problems)], []);
    ok("Real browser, desktop and mobile: no crash, hydration failure, CSP error or overflow");
  } finally {
    await browser.close();
  }
}

const folder = await mkdtemp(join(tmpdir(), "ldgenx-published-"));
let wrangler;
try {
  await new Promise((done) => api.listen(apiPort, "127.0.0.1", done));
  await cp("dist", join(folder, "dist"), { recursive: true });
  const worker = join(folder, "dist/_worker.js/index.js"),
    source = await readFile(worker, "utf8"),
    local = source.replace(
      /url:"https:\/\/[a-z0-9]+\.supabase\.co"/,
      `url:"http://127.0.0.1:${apiPort}"`,
    );
  assert.notEqual(local, source, "The built worker has no Supabase address");
  await writeFile(worker, local);
  wrangler = spawn(
    resolve("node_modules/.bin/wrangler"),
    [
      "pages",
      "dev",
      "dist",
      "--port",
      String(sitePort),
      "--ip",
      "127.0.0.1",
      "--compatibility-date",
      "2026-10-23",
      "--no-show-interactive-dev-session",
      "--persist-to",
      join(folder, "state"),
    ],
    { cwd: folder, stdio: "ignore", detached: true },
  );
  for (let i = 0; i < 60; i++) {
    if (await fetch(site + "/robots.txt").then((r) => r.ok, () => false)) break;
    assert(i < 59, "The local Cloudflare runtime did not start");
    await new Promise((done) => setTimeout(done, 1000));
  }
  await workerChecks();
  await browserChecks();
  console.log(`\n${passed.length} published-state checks passed.`);
} finally {
  if (wrangler) {
    try {
      process.kill(-wrangler.pid);
    } catch {
      /* Already stopped. */
    }
  }
  api.close();
  api.closeAllConnections();
  await rm(folder, { recursive: true, force: true });
}
