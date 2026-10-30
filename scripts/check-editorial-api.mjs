import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parseEnv } from "node:util";
import { ref, serviceKey, query, literal } from "./lib/supabase-management.mjs";
const env = parseEnv(await readFile(".env.production", "utf8")),
  base = `https://${ref}.supabase.co`,
  key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const service = createClient(base, await serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  }),
  users = [],
  entries = [],
  mediaIds = [],
  checks = [],
  run = randomUUID().slice(0, 8);
async function account(admin = false) {
  const password = randomBytes(24).toString("base64url"),
    email = `cms-qa-${run}-${admin ? "admin" : "client"}@example.invalid`;
  const { data, error } = await service.auth.admin.createUser({
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
  if (error) throw error;
  users.push(data.user.id);
  if (admin)
    await query(
      `update public.portal_profiles set data=data||'{"role":"admin","status":"active"}'::jsonb where id=${literal(data.user.id)}`,
    );
  const client = createClient(base, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const auth = await client.auth.signInWithPassword({ email, password });
  if (auth.error) throw auth.error;
  return auth.data.session.access_token;
}
async function req(
  path,
  method = "GET",
  body,
  token,
  expected = 200,
  origin = "https://www.ldgenx.fr",
) {
  const headers = { apikey: key, Origin: origin };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const r = await fetch(base + "/functions/v1/editorial" + path, {
    method,
    headers,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  const json = await r.json().catch(() => null);
  assert.equal(
    r.status,
    expected,
    `${method} ${path}: ${r.status} ${JSON.stringify(json)}`,
  );
  checks.push(
    `${method} ${path.replace(/[0-9a-f]{8}-[0-9a-f-]+/g, "[id]")}: ${r.status}`,
  );
  return json;
}
try {
  const admin = await account(true),
    client = await account(false);
  await req("/entries", "GET", null, null, 401);
  await req("/entries", "GET", null, client, 403);
  await req("/entries", "POST", { kind: "article", locale: "fr" }, client, 403);
  await req("/public/index", "GET", null, null, 403, "https://evil.example");
  const concurrencyStarted = Date.now();
  await Promise.all(
    ["/stats", "/entries", "/media", "/stats", "/entries", "/public/index"].map(
      (path) => req(path, "GET", null, admin),
    ),
  );
  assert(
    Date.now() - concurrencyStarted < 15000,
    "Concurrent editorial reads must complete promptly",
  );
  checks.push(
    "Six simultaneous reads complete without sharing a request connection",
  );
  const list = await req("/entries", "GET", null, admin);
  assert.equal(list.filter((e) => e.legacyId).length, 74);
  assert.equal((await req("/public/index")).length, 0);
  let e = await req(
    "/entries",
    "POST",
    { kind: "article", locale: "fr" },
    admin,
    201,
  );
  entries.push(e.id);
  const doc = {
    ...e.document,
    title: `Validation éditoriale ${run}`,
    summary:
      "Un document de validation isolé pour vérifier le système de publication scientifique.",
    body: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Méthode" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Dicentrarchus labrax",
              marks: [{ type: "italic" }],
            },
            {
              type: "text",
              text: " : validation technique du circuit éditorial. Ce document de test ne constitue pas une publication scientifique et ne décrit aucune étude réelle.",
            },
          ],
        },
      ],
    },
    reviewed: true,
  };
  e = await req(
    `/entries/${e.id}`,
    "PATCH",
    {
      version: e.version,
      slug: `validation-cms-${run}`,
      document: doc,
      checkpoint: true,
    },
    admin,
  );
  const route = `/ressources/${e.slug}`;
  await req(
    `/entries/${e.id}`,
    "PATCH",
    { version: 1, document: doc },
    admin,
    409,
  );
  await req(
    "/public/document?path=" + encodeURIComponent(route),
    "GET",
    null,
    null,
    404,
  );
  const db = await fetch(base + "/rest/v1/cms_entries?select=id", {
    headers: { apikey: key },
  });
  assert([401, 403].includes(db.status));
  assert.equal((await db.json()).code, "42501");
  checks.push("Anonymous REST cannot read drafts");
  const clientDb = await fetch(base + "/rest/v1/cms_entries?select=id", {
    headers: { apikey: key, Authorization: `Bearer ${client}` },
  });
  assert.deepEqual(await clientDb.json(), []);
  checks.push("Client RLS cannot read drafts");
  const form = new FormData();
  form.set("kind", "image");
  form.set("name", `qa-${run}.webp`);
  const image = await readFile("public/images/estuaire-slack-640.webp");
  form.append("files", new File([image], "640.webp", { type: "image/webp" }));
  const m = await req("/media", "POST", form, admin);
  mediaIds.push(m.id);
  assert.equal(m.isPublic, false);
  assert.equal((await fetch(m.urls["640"])).status, 200);
  const directPublic =
    base + "/storage/v1/object/public/editorial-public/" + m.variants[0].path;
  assert.notEqual((await fetch(directPublic)).status, 200);
  const library = await req("/media", "GET", null, admin);
  assert.equal(
    (await fetch(library.find((asset) => asset.id === m.id).urls["640"]))
      .status,
    200,
  );
  checks.push(
    "Uploaded draft media is private; library previews use batched signed URLs",
  );
  const cover = {
    mediaId: m.id,
    alt: "Estuaire de la Slack, image de validation",
    caption: "Image de validation technique.",
    credit: "Crédit original conservé pour ce test interne",
    licenceUrl: "https://www.ldgenx.fr/mentions-legales",
  };
  e = await req(
    `/entries/${e.id}`,
    "PATCH",
    { version: e.version, document: { ...doc, cover }, checkpoint: true },
    admin,
  );
  await req(`/media/${m.id}`, "DELETE", null, admin, 409);
  const badForm = new FormData();
  badForm.set("kind", "image");
  badForm.append(
    "files",
    new File(["This is not a WebP image."], "evil.webp", {
      type: "image/webp",
    }),
  );
  await req("/media", "POST", badForm, admin, 400);
  e = await req(
    `/entries/${e.id}/publish`,
    "POST",
    { version: e.version },
    admin,
  );
  assert.equal(e.version, e.publishedVersion);
  const published = await req(
    "/public/document?path=" + encodeURIComponent(route),
  );
  assert.equal(published.document.title, doc.title);
  assert.equal((await fetch(directPublic)).status, 200);
  assert(published.media[0].urls["640"].includes("/public/"));
  checks.push("Publication copies immutable media to public bucket");
  e = await req(
    `/entries/${e.id}`,
    "PATCH",
    {
      version: e.version,
      document: {
        ...e.document,
        title: "Version privée en cours de rédaction",
        reviewed: false,
      },
      checkpoint: true,
    },
    admin,
  );
  assert.equal(
    (await req("/public/document?path=" + encodeURIComponent(route))).document
      .title,
    doc.title,
  );
  checks.push("Editing a published document does not leak draft changes");
  await req(
    `/entries/${e.id}/publish`,
    "POST",
    { version: e.version },
    admin,
    400,
  );
  const revisions = await req(`/entries/${e.id}/revisions`, "GET", null, admin);
  assert(revisions.length > 0 && revisions.length <= 10);
  e = await req(
    `/entries/${e.id}/restore`,
    "POST",
    {
      version: e.version,
      revision:
        revisions.find((r) => r.document.reviewed)?.id ?? revisions[0].id,
    },
    admin,
  );
  assert.equal(e.document.reviewed, false);
  e = await req(
    `/entries/${e.id}/withdraw`,
    "POST",
    { version: e.version },
    admin,
  );
  await req(
    "/public/document?path=" + encodeURIComponent(route),
    "GET",
    null,
    null,
    410,
  );
  const index = await req("/public/index");
  assert.equal(index.find((r) => r.id === e.id).status, "withdrawn");
  assert.equal(index.find((r) => r.id === e.id).title, "");
  checks.push("Withdrawal exposes no draft text");
  await req(`/entries/${e.id}`, "DELETE", null, admin, 409);
  const stats = await req("/stats", "GET", null, admin);
  assert(stats.mediaBytes >= m.bytes * 2);
  checks.push("Budget counts both private and public media copies");
  const fresh = await req(
    "/entries",
    "POST",
    { kind: "study", locale: "en" },
    admin,
    201,
  );
  entries.push(fresh.id);
  await req(
    `/entries/${fresh.id}/withdraw`,
    "POST",
    { version: 1 },
    admin,
    409,
  );
  await req(`/entries/${fresh.id}`, "DELETE", null, admin);
  await mkdir("docs/editorial-qa", { recursive: true });
  await writeFile(
    "docs/editorial-qa/api.json",
    JSON.stringify({ date: new Date().toISOString(), checks }, null, 2) + "\n",
  );
  console.log(`Editorial API: ${checks.length} checks passed.`);
} finally {
  if (entries.length)
    await query(
      `delete from public.cms_entries where id in (${entries.map(literal).join(",")})`,
    );
  for (const id of mediaIds) {
    const rows = await query(
      `select variants from public.cms_media where id=${literal(id)}`,
    );
    if (rows[0])
      for (const bucket of ["editorial-public", "editorial-drafts"])
        await service.storage
          .from(bucket)
          .remove(rows[0].variants.map((v) => v.path));
    await query(`delete from public.cms_media where id=${literal(id)}`);
  }
  for (const id of users) await service.auth.admin.deleteUser(id);
  console.log("Isolated QA documents, media and accounts removed.");
}
