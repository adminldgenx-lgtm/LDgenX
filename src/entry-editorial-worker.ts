// Selective Pages rendering: all unrelated routes/assets keep their unlimited static delivery.
import { render, pages, ready, redirects } from "./entry-server";
import { editorialImageUrl, mergeEditorialPages } from "./editorial/meta";
import { productionOrigin } from "../supabase/functions/_shared/site";
import { editorialPageTemplates } from "../supabase/functions/_shared/editorial-pages";
const editablePaths = new Set(editorialPageTemplates.map((p) => p.path));
import type {
  EditorialSummary,
  PublishedDocument,
} from "../supabase/functions/_shared/editorial";

// Addresses that can hold published content, and the files that describe them.
const managedPaths =
  /^\/(?:en\/)?(?:services|applications)(?:\/|$)|^\/(?:ressources|etudes-de-cas|recherche)(?:\/|$)|^\/en\/(?:resources|case-studies|research)(?:\/|$)|^\/(?:api\/editorial\/|sitemap\.xml$|sitemaps\/|plan-du-site$|en\/site-map$|llms(?:-full)?\.txt$)/;
// The pages that list a kind of content: their copy on the CDN stops being current when it changes.
const listings: Record<string, EditorialSummary["kind"] | "all"> = {
  "/services": "service",
  "/en/services": "service",
  "/applications": "application",
  "/en/applications": "application",
  "/etudes-de-cas": "study",
  "/en/case-studies": "study",
  "/recherche": "publication",
  "/en/research": "publication",
  "/ressources": "article",
  "/en/resources": "article",
  "/plan-du-site": "all",
  "/en/site-map": "all",
};
const mediaFile = /^\/media\/([\da-f-]{36}\/(?:\d+\.webp|social\.jpg))$/;

declare const __EDITORIAL_RUNTIME__: {
  build: string;
  templates: Record<"fr" | "en", string>;
  files: Record<string, string>;
  dates: Record<string, { date: string }>;
  security: Record<string, string>;
};
declare const __EDITORIAL_SUPABASE__: { url: string; key: string };
interface WorkerEnvironment {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}
interface WorkerContext {
  waitUntil: (task: Promise<unknown>) => void;
}
const API = `${__EDITORIAL_SUPABASE__.url}/functions/v1/editorial/public`;
const edgeCache = () => (caches as unknown as { default: Cache }).default;
const cache = new Map<string, { until: number; value: unknown }>();
// Each request does its own fetch: a promise owned by a visitor who disconnects never settles,
// which would hang every other request waiting on it.
async function remote<T>(path: string, timeout = 8000): Promise<T> {
  const old = cache.get(path);
  if (old && old.until > Date.now()) return old.value as T;
  const response = await fetch(API + path, {
    headers: { apikey: __EDITORIAL_SUPABASE__.key },
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) throw new Error(String(response.status));
  const value = await response.json();
  cache.set(path, { until: Date.now() + 15000, value });
  // Bounded per-isolate cache; publication data never includes drafts or signed preview URLs.
  if (cache.size > 100) cache.delete(cache.keys().next().value!);
  return value as T;
}
// Existing pages must not make a visitor wait for the backend. The last answer is kept at the edge
// and served at once while the next one is fetched, so an edit reaches the HTML within a request.
const refreshing = new Set<string>();
async function recent<T>(
  path: string,
  origin: string,
  context: WorkerContext,
): Promise<T> {
  const edge = edgeCache();
  const key = new Request(`${origin}/api/editorial/recent${path}`);
  const refresh = async () => {
    const value = await remote<T>(path, 2500);
    await edge
      .put(
        key,
        new Response(JSON.stringify(value), {
          headers: {
            "Cache-Control": "public, max-age=2592000",
            "X-Saved": String(Date.now()),
          },
        }),
      )
      .catch(() => {});
    return value;
  };
  const saved = await edge.match(key).catch(() => undefined);
  if (!saved) return refresh();
  if (
    Date.now() - Number(saved.headers.get("X-Saved")) > 15000 &&
    !refreshing.has(path)
  ) {
    refreshing.add(path);
    context.waitUntil(
      refresh()
        .catch(() => {})
        .finally(() => refreshing.delete(path)),
    );
  }
  return (await saved.json()) as T;
}
/** A version of a document never changes: fetched once, kept at the edge. */
async function versioned<T>(
  path: string,
  origin: string,
  context: WorkerContext,
): Promise<T> {
  const edge = edgeCache();
  const key = new Request(`${origin}/api/editorial/version${path}`);
  const saved = await edge.match(key).catch(() => undefined);
  if (saved) return (await saved.json()) as T;
  const value = await remote<T>(path);
  context.waitUntil(
    edge
      .put(
        key,
        new Response(JSON.stringify(value), {
          headers: { "Cache-Control": "public, max-age=2592000" },
        }),
      )
      .catch(() => {}),
  );
  return value;
}
function documentAt(
  path: string,
  index: EditorialSummary[],
  origin: string,
  context: WorkerContext,
) {
  const address = `/document?path=${encodeURIComponent(path)}`;
  const row = index.find((r) => r.path === path);
  return row
    ? versioned<PublishedDocument>(
        `${address}&v=${encodeURIComponent(row.updatedAt)}`,
        origin,
        context,
      )
    : remote<PublishedDocument>(address);
}
/** Published pictures reach visitors from this domain and its edge cache, not from storage. */
async function picture(
  request: Request,
  file: string,
  context: WorkerContext,
) {
  const edge = edgeCache();
  const key = new Request(`${new URL(request.url).origin}/media/${file}`);
  const saved = await edge.match(key).catch(() => undefined);
  if (saved) return saved;
  const upstream = await fetch(
    `${__EDITORIAL_SUPABASE__.url}/storage/v1/object/public/editorial-public/${file}`,
    { signal: AbortSignal.timeout(15000) },
  );
  if (!upstream.ok)
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  const result = new Response(upstream.body, {
    headers: {
      ...__EDITORIAL_RUNTIME__.security,
      "Content-Type": file.endsWith(".jpg") ? "image/jpeg" : "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
  context.waitUntil(edge.put(key, result.clone()).catch(() => {}));
  return result;
}
const xml = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
function discovery(path: string, rows: EditorialSummary[]) {
  // A withdrawn page edit leaves the original page, with its original entries.
  const index = rows.filter((r) => r.kind !== "page" || r.status === "published");
  const current = mergeEditorialPages(pages, index);
  const byPath = new Map(index.map((p) => [p.path, p]));
  if (path.endsWith(".xml")) {
    const groups: Record<string, string[]> = {
      "pages.xml": [],
      "expertises.xml": [],
      "etudes.xml": [],
      "recherche.xml": [],
      "ressources.xml": [],
    };
    const membership = new Map<string, string>();
    const originalImages = new Map<string, string>();
    for (const [name, text] of Object.entries(__EDITORIAL_RUNTIME__.files))
      if (name.startsWith("sitemaps/")) {
        const group = name.slice(9);
        for (const [, loc] of text.matchAll(/<url><loc>([^<]+)<\/loc>/g))
          membership.set(loc.replace(productionOrigin, ""), group);
        for (const [, loc, body] of text.matchAll(
          /<url><loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g,
        ))
          originalImages.set(
            loc.replace(productionOrigin, ""),
            [...body.matchAll(/<image:image>[\s\S]*?<\/image:image>/g)]
              .map((m) => m[0])
              .join(""),
          );
      }
    for (const p of current.filter((p) => !p.noindex)) {
      const row = byPath.get(p.path);
      const group =
        membership.get(p.path) ??
        (p.kind === "article"
          ? "ressources.xml"
          : p.kind === "service"
            ? "expertises.xml"
            : p.kind === "application"
              ? "expertises.xml"
              : p.kind === "study"
                ? "etudes.xml"
                : "recherche.xml");
      const date =
        row?.updatedAt.slice(0, 10) ??
        __EDITORIAL_RUNTIME__.dates[p.path]?.date ??
        new Date().toISOString().slice(0, 10);
      const image = row?.cover ? editorialImageUrl(row) : null;
      // A page edit keeps the pictures of its original sections unless it sets a cover.
      const imageTags =
        row && (row.kind !== "page" || image)
          ? image
            ? `<image:image><image:loc>${xml(image)}</image:loc></image:image>`
            : ""
          : (originalImages.get(p.path) ?? "");
      groups[group]?.push(
        `<url><loc>${xml(productionOrigin + p.path)}</loc><lastmod>${date}</lastmod>${Object.entries(
          p.alternates,
        )
          .map(
            ([lang, path]) =>
              `<xhtml:link rel="alternate" hreflang="${lang}" href="${xml(productionOrigin + path)}"/>`,
          )
          .join(
            "",
          )}${p.alternates.fr ? `<xhtml:link rel="alternate" hreflang="x-default" href="${xml(productionOrigin + p.alternates.fr)}"/>` : ""}${imageTags}</url>`,
      );
    }
    if (path === "/sitemap.xml")
      return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.entries(
        groups,
      )
        .filter(([, entries]) => entries.length)
        .map(
          ([file, entries]) =>
            `<sitemap><loc>${productionOrigin}/sitemaps/${file}</loc><lastmod>${entries
              .map((s) => s.match(/<lastmod>([^<]+)/)![1])
              .sort()
              .at(-1)}</lastmod></sitemap>`,
        )
        .join("")}</sitemapindex>`;
    const list = groups[path.split("/").at(-1)!];
    return list
      ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${list.join("\n")}</urlset>`
      : null;
  }
  if (path === "/llms.txt" || path === "/llms-full.txt") {
    let text = __EDITORIAL_RUNTIME__.files[path.slice(1)] ?? "";
    // Page edits add to a page, so its long-form entry stays; other content replaces its own.
    const managed = new Set(
      index
        .filter((r) => r.kind !== "page")
        .map((r) => productionOrigin + r.path),
    );
    if (path === "/llms-full.txt")
      text = text
        .split(/(?=^#{1,3} )/m)
        .filter((part) => {
          const url = part.match(/^#{1,3} [^\n]+\n\n(https:\/\/[^\s]+)\n/)?.[1];
          return !url || !managed.has(url);
        })
        .join("");
    else
      text = text
        .split("\n")
        .filter(
          (line) => ![...managed].some((url) => line.includes(`](${url})`)),
        )
        .join("\n");
    const published = index.filter((r) => r.status === "published");
    if (published.length)
      text +=
        "\n\n## Articles et études actualisés / Updated articles and studies\n\nLes contenus éditoriaux récents sont résumés ici ; le texte intégral et les références figurent aux adresses canoniques suivantes.\n\n" +
        published
          .map(
            (r) =>
              `- [${r.title.replace(/\*/g, "")}](${productionOrigin}${r.path}) (${r.locale}): ${r.summary}`,
          )
          .join("\n");
    return text;
  }
  return null;
}
function updateListSchema(
  head: string,
  path: string,
  index: EditorialSummary[],
) {
  const kind =
    path === "/recherche" || path === "/en/research"
      ? "publication"
      : path === "/etudes-de-cas" || path === "/en/case-studies"
        ? "study"
        : path === "/ressources" || path === "/en/resources"
          ? "article"
          : path === "/services" || path === "/en/services"
            ? "service"
            : path === "/applications" || path === "/en/applications"
              ? "application"
              : null;
  if (!kind) return head;
  const locale = path.startsWith("/en") ? "en" : "fr";
  const current = mergeEditorialPages(pages, index).filter(
    (p) => p.locale === locale && p.kind === kind,
  );
  return head.replace(
    /(<script id="ldgenx-schema" type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (_all, start, json, end) => {
      const graph = JSON.parse(json);
      for (const node of graph["@graph"] ?? [])
        if (node["@type"] === "WebPage" || node["@type"] === "CollectionPage")
          node.mainEntity = {
            "@type": "ItemList",
            numberOfItems: current.length,
            itemListElement: current.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.label,
              url: productionOrigin + p.path,
            })),
          };
      return start + JSON.stringify(graph).replaceAll("<", "\\u003c") + end;
    },
  );
}
function response(
  request: Request,
  body: string,
  status = 200,
  type = "text/html; charset=utf-8",
) {
  const headers = {
    ...__EDITORIAL_RUNTIME__.security,
    "Content-Type": type,
    "Cache-Control": "public, max-age=0, must-revalidate",
  } as Record<string, string>;
  if (
    new URL(request.url).hostname.endsWith(".pages.dev") ||
    status !== 200 ||
    type.startsWith("application/json") ||
    type.startsWith("text/plain")
  )
    headers["X-Robots-Tag"] = "noindex";
  return new Response(request.method === "HEAD" ? null : body, {
    status,
    headers,
  });
}
export default {
  async fetch(request: Request, env: WorkerEnvironment, context: WorkerContext) {
    const url = new URL(request.url);
    if (url.pathname === "/api/auth/google/callback") {
      if (request.method !== "GET")
        return new Response(null, {
          status: 405,
          headers: { Allow: "GET", "Cache-Control": "no-store" },
        });
      try {
        const target = new URL(
          `${__EDITORIAL_SUPABASE__.url}/functions/v1/calendar/callback`,
        );
        for (const key of ["state", "code", "error"]) {
          const value = url.searchParams.get(key);
          if (value) target.searchParams.set(key, value);
        }
        const upstream = await fetch(target, {
          redirect: "manual",
          signal: AbortSignal.timeout(90000),
        });
        const location = upstream.headers.get("Location");
        if (
          upstream.status !== 303 ||
          !location?.startsWith(`${productionOrigin}/admin/parametres?`)
        )
          throw new Error("callback_unavailable");
        return new Response(null, {
          status: 303,
          headers: {
            Location: location,
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          },
        });
      } catch {
        return new Response(null, {
          status: 303,
          headers: {
            Location: `${productionOrigin}/admin/parametres?onglet=google&calendar=connection_failed`,
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          },
        });
      }
    }
    const file = url.pathname.match(mediaFile)?.[1];
    const eligible =
      file || editablePaths.has(url.pathname) || managedPaths.test(url.pathname);
    if (!eligible) return env.ASSETS.fetch(request);
    if (!["GET", "HEAD"].includes(request.method))
      return response(
        request,
        "Method not allowed",
        405,
        "text/plain; charset=utf-8",
      );
    if (file) return picture(request, file, context);
    await ready;
    const normalized =
      url.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/";
    if (redirects[normalized] || normalized !== url.pathname) {
      const target = new URL(
        (redirects[normalized] ?? normalized) + url.search,
        url.origin,
      );
      return new Response(null, {
        status: 301,
        headers: { Location: target.href },
      });
    }
    try {
      // No visitor waits for the backend: the last answer is served while the next one is fetched.
      const index = [
        ...(await recent<EditorialSummary[]>("/index", url.origin, context)),
      ];
      if (url.pathname === "/api/editorial/index")
        return response(
          request,
          JSON.stringify(index),
          200,
          "application/json; charset=utf-8",
        );
      if (url.pathname === "/api/editorial/document") {
        const path = url.searchParams.get("path") ?? "";
        if (!path.startsWith("/") || path.length > 300)
          return response(request, "{}", 400, "application/json");
        return response(
          request,
          JSON.stringify(await documentAt(path, index, url.origin, context)),
          200,
          "application/json; charset=utf-8",
        );
      }
      const discovered = discovery(url.pathname, index);
      if (discovered !== null)
        return response(
          request,
          discovered,
          200,
          url.pathname.endsWith(".xml")
            ? "application/xml; charset=utf-8"
            : "text/plain; charset=utf-8",
        );
      let selected = index.find((r) => r.path === url.pathname);
      if (selected?.status === "withdrawn" && selected.kind !== "page")
        return response(
          request,
          '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Contenu retiré · LDgenX</title><h1>Ce contenu a été retiré.</h1><a href="/">LDgenX</a></html>',
          410,
        );
      if (selected?.kind === "page" && selected.status === "withdrawn")
        selected = undefined;
      // A page stays on the CDN until a publication changes it: identical bytes, no render cost.
      const staticPage = pages.find((p) => p.path === url.pathname);
      const listed = listings[url.pathname];
      if (
        staticPage &&
        !selected &&
        !index.some(
          (r) =>
            r.kind !== "page" &&
            (listed === "all" || r.kind === listed) &&
            r.locale === staticPage.locale &&
            (r.status === "published" || r.legacyId),
        )
      )
        return env.ASSETS.fetch(request);
      // A render is kept until the published content or the site changes.
      const version = `${__EDITORIAL_RUNTIME__.build}:${index.length}:${index.reduce((latest, r) => (r.updatedAt > latest ? r.updatedAt : latest), "")}`;
      const pageKey = new Request(
        `${url.origin}/api/editorial/page${url.pathname}?v=${encodeURIComponent(version)}`,
      );
      const edge = edgeCache();
      const saved = await edge.match(pageKey).catch(() => undefined);
      if (saved) return response(request, await saved.text());
      let doc: PublishedDocument | null = null;
      if (selected || !staticPage) {
        try {
          doc = await documentAt(url.pathname, index, url.origin, context);
        } catch (e) {
          if (e instanceof Error && e.message === "404" && !selected)
            return env.ASSETS.fetch(request);
          throw e;
        }
        if (!selected) {
          selected = doc;
          index.push(doc);
        }
      }
      if (!staticPage && !doc) return env.ASSETS.fetch(request);
      const snapshot = { index, document: doc };
      const output = render(url.pathname, snapshot);
      const locale = selected?.locale ?? staticPage?.locale ?? "fr";
      const head = updateListSchema(output.head, url.pathname, index);
      const bootstrap = `<script id="ldgenx-editorial" type="application/json">${JSON.stringify(snapshot).replaceAll("<", "\\u003c")}</script>`;
      const html = __EDITORIAL_RUNTIME__.templates[locale]
        .replace("<!--app-html-->", output.html)
        .replace("<!--seo-head-->", head)
        .replace("</body>", bootstrap + "</body>");
      context.waitUntil(
        edge
          .put(
            pageKey,
            new Response(html, {
              headers: { "Cache-Control": "public, max-age=2592000" },
            }),
          )
          .catch(() => {}),
      );
      return response(request, html);
    } catch (error) {
      // Whatever exists on the CDN still answers when the backend does not.
      const stored = await env.ASSETS.fetch(request);
      if (stored.ok) return stored;
      const status =
        error instanceof Error && error.message === "410"
          ? 410
          : error instanceof Error && error.message === "404"
            ? 404
            : 503;
      return response(
        request,
        `<!doctype html><html lang="${url.pathname.startsWith("/en") ? "en" : "fr"}"><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LDgenX</title><body style="font:18px system-ui;padding:8vw;color:#03254b"><h1>${status === 410 ? "Contenu retiré / Content withdrawn" : status === 404 ? "Page introuvable / Page not found" : "Contenu momentanément indisponible / Content temporarily unavailable"}</h1><p><a href="/">LDgenX</a></p></body></html>`,
        status,
      );
    }
  },
};
