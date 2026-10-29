import { chromium, expect as baseExpect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { ref, serviceKey, query, literal } from "./lib/supabase-management.mjs";
const expect = baseExpect.configure({ timeout: 20000 });
const adminOrigin = process.argv[2] || "http://127.0.0.1:4174",
  publicOrigin = process.argv[3] || "http://127.0.0.1:4187";
const service = createClient(`https://${ref}.supabase.co`, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const run = randomUUID().slice(0, 8),
  email = `cms-browser-${run}@example.invalid`,
  password = randomBytes(24).toString("base64url"),
  errors = [],
  checks = [];
checks.push = (...items) => {
  console.log(items.join(" · "));
  return Array.prototype.push.apply(checks, items);
};
let userId, browser, testPage;
const output = "docs/editorial-qa";
await mkdir(output, { recursive: true });
try {
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: "Editorial",
      lastName: "QA",
      organisation: "QA",
      locale: "fr",
    },
  });
  if (created.error) throw created.error;
  userId = created.data.user.id;
  await query(
    `update public.portal_profiles set data=data||'{"role":"admin","status":"active"}'::jsonb where id=${literal(userId)}`,
  );
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      locale: "fr-FR",
    }),
    page = await context.newPage();
  testPage = page;
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("CONSOLE", m.text());
  });
  page.on("request", (r) => {
    if (r.url().includes("/functions/v1/editorial"))
      console.log("CMS_SEND", r.method(), new URL(r.url()).pathname);
  });
  page.on("requestfailed", (r) =>
    console.log("NETWORK", new URL(r.url()).pathname, r.failure()?.errorText),
  );
  page.on("response", async (r) => {
    if (r.url().includes("/functions/v1/editorial"))
      console.log(
        "CMS_HTTP",
        r.request().method(),
        new URL(r.url()).pathname,
        r.status(),
      );
  });
  page.on("dialog", (d) => d.accept());
  await page.goto(adminOrigin + "/admin/connexion?lang=fr");
  await page.getByLabel("Adresse e-mail", { exact: true }).fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await page.waitForURL("**/admin/messages");
  await page.getByRole("link", { name: "Contenus", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Contenus", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cms-entry")).toHaveCount(74, { timeout: 60000 });
  checks.push("Admin lists all 74 existing scientific working copies");
  await page
    .getByRole("button", { name: "Nouveau contenu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Créer le brouillon", exact: true })
    .click();
  await page.waitForURL("**/admin/contenus/*");
  await expect(page.getByLabel("Titre", { exact: true })).toBeVisible();
  const id = new URL(page.url()).pathname.split("/").at(-1);
  const title = `Validation scientifique ${run}`;
  await page.getByLabel("Titre", { exact: true }).fill(title);
  await page
    .getByLabel("Résumé / introduction", { exact: true })
    .fill(
      "Ce document de validation vérifie le fonctionnement du système éditorial sans décrire une étude scientifique réelle.",
    );
  await page
    .getByLabel("Catégorie / thème", { exact: true })
    .fill("Validation technique");
  await page
    .getByLabel("Adresse courte", { exact: true })
    .fill(`qa-editorial-${run}`);
  const body = page.locator("[data-testid=cms-body]");
  await body.fill(
    "Ce document vérifie les paragraphes, les figures et la diffusion des contenus. Il ne présente aucun résultat scientifique réel. Les informations de validation sont supprimées après le contrôle.",
  );
  await page
    .getByRole("button", { name: "Insérer un tableau", exact: true })
    .click();
  await expect(body.locator("table")).toBeVisible();
  await body.locator("th").first().click();
  await page.keyboard.type("Échantillon");
  await page.getByRole("button", { name: "Choisir", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 3200;
    c.height = 1800;
    const x = c.getContext("2d"),
      g = x.createLinearGradient(0, 0, 3200, 1800);
    g.addColorStop(0, "#03254b");
    g.addColorStop(1, "#84b82d");
    x.fillStyle = g;
    x.fillRect(0, 0, 3200, 1800);
    x.fillStyle = "white";
    x.font = "100px sans-serif";
    x.fillText("LDgenX — validation technique", 160, 400);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page.locator("input[type=file]").setInputFiles({
    name: `qa-${run}.png`,
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  });
  await expect(page.getByText("Import terminé", { exact: false })).toBeVisible({
    timeout: 90000,
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Choisir", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Texte alternatif · ce que montre l’image", { exact: true })
    .fill("Visuel de validation technique LDgenX");
  await page
    .getByLabel("Légende scientifique", { exact: true })
    .fill("Visuel utilisé pour un contrôle technique temporaire.");
  await page
    .getByLabel("Crédit / titulaire des droits", { exact: true })
    .fill("LDgenX · visuel de contrôle");
  await page
    .getByRole("button", { name: "Insérer une figure", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Choisir", exact: true })
    .first()
    .click();
  const figure = body.locator(".cms-editor-figure");
  await figure.locator("summary").click();
  await expect(figure.locator("img")).toBeVisible({timeout:5000});
  await figure
    .getByLabel("Texte alternatif · ce que montre l’image", { exact: true })
    .fill("Image de contrôle technique");
  await figure
    .getByLabel("Légende scientifique", { exact: true })
    .fill("Figure de contrôle temporaire, sans données de recherche.");
  await figure
    .getByLabel("Crédit / titulaire des droits", { exact: true })
    .fill("LDgenX");
  await page
    .getByRole("button", { name: "Insérer une vidéo", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Titre de la vidéo", { exact: true })
    .fill("Lecteur de validation technique");
  await dialog
    .getByLabel("Lien YouTube ou Vimeo", { exact: true })
    .fill("https://youtu.be/dQw4w9WgXcQ");
  await dialog.getByRole("button", { name: "Insérer", exact: true }).click();
  await expect(body.locator(".cms-editor-video")).toBeVisible();
  await expect(page.locator(".cms-editor-aside .cms-panel img")).toBeVisible();
  expect(
    await page
      .locator(".cms-editor-aside .cms-panel img")
      .evaluate((img) => img.clientWidth / img.clientHeight),
  ).toBeGreaterThan(1.5);
  await page
    .getByRole("button", { name: "Insérer une vidéo", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Titre de la vidéo", { exact: true })
    .fill("Vidéo locale de validation");
  await page
    .getByRole("dialog")
    .getByRole("button", {
      name: "Choisir / importer une courte vidéo",
      exact: true,
    })
    .click();
  await page.locator("input[type=file]").setInputFiles({
    name: `qa-${run}.mp4`,
    mimeType: "video/mp4",
    buffer: await readFile("public/videos/hero-sample-mobile.mp4"),
  });
  await expect(page.getByText("Import terminé", { exact: false })).toBeVisible({
    timeout: 90000,
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Choisir", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Insérer", exact: true })
    .click();
  await expect(body.locator(".cms-editor-video")).toHaveCount(2);
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(
    page.getByText("Brouillon enregistré.", { exact: false }),
  ).toBeVisible({ timeout: 60000 });
  checks.push(
    "Rich editor saves text, table, figure metadata and trusted video",
  );
  const db = await query(
    `select draft from public.cms_entries where id=${literal(id)}`,
  );
  assertDocument(db[0].draft);
  const mediaRows = await query(
    `select * from public.cms_media where created_by=${literal(userId)}`,
  );
  expect(mediaRows).toHaveLength(2);
  const images = mediaRows.filter((m) => m.kind === "image");
  expect(images).toHaveLength(1);
  expect(images[0].variants).toHaveLength(3);
  expect(Math.max(...images[0].variants.map((v) => v.width))).toBe(2400);
  expect(images[0].variants.every((v) => v.mime === "image/webp")).toBe(true);
  checks.push(
    "PNG converted to 3 responsive WebP variants, max 2400px; reused without duplication",
  );
  await page.getByRole("button", { name: "Aperçu", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: output + "/draft-preview-desktop.png" });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Fermer", exact: true })
    .click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Publier", exact: true }).click();
  await expect(page.getByText("Contenu publié.", { exact: false })).toBeVisible(
    { timeout: 90000 },
  );
  checks.push("Explicit scientific review and publication");
  const route = "/ressources/qa-editorial-" + run;
  await expect
    .poll(
      async () => {
        const r = await fetch(publicOrigin + route);
        return r.status;
      },
      { timeout: 45000, intervals: [1000, 3000, 5000] },
    )
    .toBe(200);
  const response = await fetch(publicOrigin + route),
    html = await response.text();
  expect(html).toContain(title);
  expect(html).toContain(
    'rel="canonical" href="https://www.ldgenx.fr' + route + '"',
  );
  expect(response.headers.get("x-robots-tag")).not.toBe("noindex");
  expect(html).not.toContain('"reviewed":false');
  checks.push(
    "Cloudflare workerd serves new slug with real HTML and canonical metadata",
  );
  const publicContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      locale: "fr-FR",
    }),
    pub = await publicContext.newPage();
  pub.on("pageerror", (e) => errors.push(e.message));
  await pub.goto(publicOrigin + route);
  await expect(
    pub.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await expect(pub.locator(".cms-prose table")).toBeVisible();
  await expect(pub.locator("iframe")).toHaveCount(0);
  await expect(pub.locator('video[controls][preload="none"]')).toHaveCount(1);
  await pub.locator("video").evaluate(async (video) => {
    await video.play();
    video.pause();
  });
  expect(
    await pub.locator("video").evaluate((v) => v.duration),
  ).toBeGreaterThan(0);
  checks.push(
    "Short MP4 validates, uploads privately and plays through the published native player",
  );
  await expect(
    pub.getByRole("button", {
      name: "Lire : Lecteur de validation technique",
      exact: true,
    }),
  ).toBeVisible();
  await pub.screenshot({
    path: output + "/article-desktop.png",
    fullPage: true,
  });
  await pub.setViewportSize({ width: 390, height: 844 });
  await pub.reload();
  await expect(
    pub.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  expect(
    await pub.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await pub.screenshot({
    path: output + "/article-mobile.png",
    fullPage: true,
  });
  checks.push(
    "Public desktop/mobile render; external video stays unloaded until clicked",
  );
  const sitemap = await (
    await fetch(publicOrigin + "/sitemaps/ressources.xml")
  ).text();
  expect(sitemap).toContain(route);
  await pub.goto(publicOrigin + "/ressources");
  await expect(
    pub.locator(".cms-card").getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await pub
    .getByPlaceholder("Rechercher un guide…")
    .count()
    .catch(() => 0);
  const search = pub.locator(".resource-search input");
  await search.fill(run);
  await expect(pub.locator(".cms-card")).toHaveCount(1);
  checks.push("New document appears in resources search and dynamic sitemap");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: output + "/editor-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page
    .getByLabel("Titre", { exact: true })
    .fill("Modifications privées de validation");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(
    page.getByText("Brouillon enregistré.", { exact: false }),
  ).toBeVisible({ timeout: 60000 });
  expect(await (await fetch(publicOrigin + route)).text()).toContain(title);
  checks.push(
    "Later saved draft stays private while public snapshot remains unchanged",
  );
  await page
    .getByRole("button", { name: "Retirer du site", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Retirer du site", exact: true })
    .click();
  await expect(
    page.getByText("Contenu retiré du site.", { exact: false }),
  ).toBeVisible({ timeout: 60000 });
  await expect
    .poll(
      async () => {
        return (await fetch(publicOrigin + route)).status;
      },
      { timeout: 45000, intervals: [1000, 3000, 5000] },
    )
    .toBe(410);
  checks.push("Withdrawal returns HTTP 410 without revealing private draft");
  expect(errors).toEqual([]);
  await writeFile(
    output + "/browser.json",
    JSON.stringify(
      { date: new Date().toISOString(), checks, errors },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Editorial browser: ${checks.length} flows passed; no browser errors.`,
  );
} catch (error) {
  console.error("BROWSER_ERRORS", errors);
  if (testPage)
    console.log(
      "AUTH_STATE",
      await testPage
        .evaluate(async () => {
          const url = performance
            .getEntriesByType("resource")
            .find((e) => e.name.includes("/assets/supabase-"))?.name;
          if (!url) return { error: "SDK not observed" };
          const { supabase } = await import(url);
          const a = supabase.auth;
          return {
            lock: a.lockAcquired,
            pending: a.pendingInLock?.length,
            initialized: !!a.initializePromise,
            locks: await navigator.locks.query(),
            session: await Promise.race([
              a
                .getSession()
                .then((v) => ({ present: !!v.data.session, error: !!v.error })),
              new Promise((r) => setTimeout(() => r("pending"), 2000)),
            ]),
          };
        })
        .catch((e) => ({ error: e.message })),
    );
  if (testPage) {
    console.error(
      "SCREEN",
      await testPage
        .locator("#p-main")
        .innerText()
        .catch(() => ""),
    );
    await testPage
      .screenshot({ path: output + "/failure.png" })
      .catch(() => {});
  }
  throw error;
} finally {
  if (browser) await browser.close();
  if (userId) {
    const rows = await query(
      `select id,variants from public.cms_media where created_by=${literal(userId)}`,
    );
    await query(
      `delete from public.cms_entries where created_by=${literal(userId)}`,
    );
    for (const m of rows) {
      for (const bucket of ["editorial-drafts", "editorial-public"])
        await service.storage
          .from(bucket)
          .remove(m.variants.map((v) => v.path));
      await query(`delete from public.cms_media where id=${literal(m.id)}`);
    }
    await service.auth.admin.deleteUser(userId);
  }
  console.log("Browser QA fixtures removed.");
}
function assertDocument(d) {
  expect(d.title).toContain(run);
  expect(d.body.content.some((n) => n.type === "table")).toBe(true);
  expect(d.body.content.some((n) => n.type === "video")).toBe(true);
  expect(d.body.content.some((n) => n.type === "figure")).toBe(true);
}
