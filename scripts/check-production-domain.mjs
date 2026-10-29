import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { pages, redirects, ready } from "../.prerender/entry-server.js";
import {
  productionOrigin,
  productionAliases,
  previewOrigin,
} from "../supabase/functions/_shared/site.ts";
import { publicRequest } from "./lib/public-http.mjs";

await ready;
const output =
  process.env.LDGENX_QA_OUTPUT ?? "docs/production-domain-2026-10-28";
await mkdir(output, { recursive: true });
const errors = [],
  warnings = [],
  cache = new Map();
const decode = (s) =>
  s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
const check = (condition, message) => {
  if (!condition) errors.push(message);
};
const get = (url) => {
  if (!cache.has(url)) cache.set(url, publicRequest(url));
  return cache.get(url);
};
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b([^>]+)>`, "gi"))].map((m) =>
    Object.fromEntries(
      [...m[1].matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map(([, k, v]) => [
        k.toLowerCase(),
        decode(v),
      ]),
    ),
  );
async function pool(items, run) {
  let index = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (index < items.length) {
        const item = items[index++];
        try {
          await run(item);
        } catch (e) {
          errors.push(`${item}: ${e.message}`);
        }
      }
    }),
  );
}
async function chain(url) {
  const steps = [];
  for (let hop = 0; hop < 6; hop++) {
    const r = await get(url);
    steps.push({ url, status: r.status, location: r.headers.location ?? null });
    if (![301, 302, 303, 307, 308].includes(r.status)) return steps;
    url = new URL(r.headers.location, url).href;
    if (steps.some((s) => s.url === url))
      throw new Error(`Redirect loop: ${url}`);
  }
  throw new Error(`Redirect chain exceeds five hops: ${url}`);
}

const domains = [];
for (const origin of [productionOrigin, ...productionAliases]) {
  for (const scheme of ["https:", "http:"]) {
    for (const path of [
      "/",
      "/en/services/environmental-dna-edna?qa=domain%20check&lang=en",
      "/espace/connexion?lang=fr",
    ]) {
      const start = origin.replace("https:", scheme) + path;
      const steps = await chain(start);
      domains.push({ start, steps });
      const final = steps.at(-1);
      check(
        final.url === productionOrigin + path && final.status === 200,
        `${start}: wrong final URL/status`,
      );
      check(
        steps.length ===
          (origin === productionOrigin && scheme === "https:" ? 1 : 2),
        `${start}: unnecessary redirect chain`,
      );
      if (steps.length > 1)
        check(
          [301, 308].includes(steps[0].status),
          `${start}: redirect is temporary`,
        );
    }
  }
}

const xmlFiles = {};
const sitemap = await get(`${productionOrigin}/sitemap.xml`);
check(sitemap.status === 200, "sitemap.xml: HTTP status");
xmlFiles["sitemap.xml"] = sitemap.body;
const sections = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  decode(m[1]),
);
for (const url of sections) {
  check(
    url.startsWith(`${productionOrigin}/sitemaps/`),
    `${url}: invalid sitemap host`,
  );
  const response = await get(url);
  check(response.status === 200, `${url}: HTTP status`);
  xmlFiles[new URL(url).pathname.slice(1)] = response.body;
}
const xmlResult = JSON.parse(
  execFileSync(
    "python3",
    [
      "-c",
      `
import json,sys,xml.etree.ElementTree as ET
files=json.load(sys.stdin); out={}
for name,body in files.items():
 root=ET.fromstring(body)
 out[name]={'root':root.tag,'urls':[node.text for node in root.findall('{*}url/{*}loc')]}
print(json.dumps(out))
`,
    ],
    { input: JSON.stringify(xmlFiles), encoding: "utf8" },
  ),
);
const listed = Object.values(xmlResult).flatMap((x) => x.urls);
check(listed.length === new Set(listed).size, "Duplicate sitemap URL");
const expected = pages
  .filter((p) => !p.noindex)
  .map((p) => productionOrigin + p.path)
  .sort();
check(
  JSON.stringify([...listed].sort()) === JSON.stringify(expected),
  "Sitemaps differ from the complete indexable page catalogue",
);
check(
  listed.every(
    (url) =>
      url.startsWith(productionOrigin + "/") &&
      !/\/(espace|admin)(\/|$)/.test(new URL(url).pathname),
  ),
  "Private or noncanonical sitemap entry",
);

const assets = new Set(),
  links = new Set(),
  documents = [];
await pool(pages, async (p) => {
  const url = productionOrigin + p.path,
    r = await get(url),
    html = r.body;
  check(r.status === 200, `${url}: direct HTTP ${r.status}`);
  const head = html.slice(0, html.indexOf("</head>"));
  const linkTags = tags(head, "link"),
    metaTags = tags(head, "meta");
  const canonicals = linkTags.filter((x) => x.rel === "canonical");
  check(
    canonicals.length === 1 && canonicals[0].href === url,
    `${url}: canonical mismatch`,
  );
  const alternates = linkTags.filter(
    (x) => x.rel === "alternate" && x.hreflang,
  );
  for (const [lang, path] of Object.entries(p.alternates))
    check(
      alternates.some(
        (a) => a.hreflang === lang && a.href === productionOrigin + path,
      ),
      `${url}: ${lang} hreflang mismatch`,
    );
  check(
    metaTags.find((x) => x.property === "og:url")?.content === url,
    `${url}: Open Graph URL`,
  );
  const noindex = /noindex/i.test(
    metaTags.find((x) => x.name === "robots")?.content ?? "",
  );
  check(noindex === !!p.noindex, `${url}: robots meta mismatch`);
  check(
    !r.headers["x-robots-tag"]?.includes("noindex") || !!p.noindex,
    `${url}: public page blocked by header`,
  );
  check((html.match(/<h1\b/g) ?? []).length === 1, `${url}: H1 count`);
  for (const [, json] of html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    JSON.parse(json);
    check(
      !/https?:\/\/(?:localhost|127\.0\.0\.1|[^/"\s]*\.pages\.dev)/.test(json),
      `${url}: nonproduction structured-data URL`,
    );
    check(
      !/https?:\/\/(?:www\.)?ldgenx\.com/.test(json),
      `${url}: legacy-domain structured-data URL`,
    );
  }
  for (const tag of metaTags.filter(
    (x) => x.property === "og:image" || x.name === "twitter:image",
  )) {
    check(
      tag.content?.startsWith(productionOrigin + "/"),
      `${url}: sharing image host`,
    );
    if (tag.content) assets.add(tag.content);
  }
  for (const a of tags(html, "a")) {
    if (!a.href || /^(mailto:|tel:|#)/.test(a.href)) continue;
    const target = new URL(a.href, url);
    // Cloudflare's encoded email fallback is decoded to mailto: by its client script.
    // Verify the resulting mailto links in the browser, not as an ordinary HTML page.
    if (target.origin === productionOrigin && target.pathname === '/cdn-cgi/l/email-protection')
      continue;
    if (
      productionAliases.includes(target.origin) ||
      target.origin === previewOrigin
    )
      errors.push(`${url}: internal link uses alias ${a.href}`);
    if (target.origin === productionOrigin) {
      target.hash = "";
      links.add(target.href);
    }
  }
  for (const tag of [
    ...tags(html, "img"),
    ...tags(html, "source"),
    ...tags(html, "video"),
  ]) {
    for (const source of [
      tag.src,
      tag.poster,
      ...(tag.srcset?.split(",").map((v) => v.trim().split(/\s+/)[0]) ?? []),
    ]) {
      if (!source || /^(data:|blob:)/.test(source)) continue;
      const target = new URL(source, url);
      if (target.origin === productionOrigin) assets.add(target.href);
    }
  }
  documents.push({
    path: p.path,
    status: r.status,
    canonical: canonicals[0]?.href,
    alternates,
    noindex,
  });
});
const pagePaths = new Set(pages.map((p) => p.path));
await pool(
  [...links].filter(
    (u) =>
      !pagePaths.has(new URL(u).pathname) &&
      !/^\/(espace|admin)(\/|$)/.test(new URL(u).pathname),
  ),
  async (url) => {
    const r = await get(url);
    check(r.status === 200, `${url}: internal link HTTP ${r.status}`);
  },
);
await pool([...assets], async (url) => {
  const r = await publicRequest(url, "HEAD");
  check(
    r.status === 200 &&
      !String(r.headers["content-type"]).includes("text/html"),
    `${url}: asset HTTP ${r.status}/${r.headers["content-type"]}`,
  );
});
for (const [from, to] of Object.entries(redirects)) {
  const r = await get(`${productionOrigin}${from}?qa=preserve%20query&lang=en`);
  check(
    [301, 308].includes(r.status),
    `${from}: legacy redirect HTTP ${r.status}`,
  );
  check(
    new URL(r.headers.location ?? "/", productionOrigin).href ===
      `${productionOrigin}${to}?qa=preserve%20query&lang=en`,
    `${from}: redirect target/query mismatch`,
  );
}
const robots = await get(`${productionOrigin}/robots.txt`);
check(
  robots.status === 200 &&
    robots.body.includes(`Sitemap: ${productionOrigin}/sitemap.xml`),
  "robots.txt: sitemap declaration",
);
check(
  !/^Disallow:\s*\/\s*$/m.test(robots.body),
  "robots.txt: public site excluded",
);
for (const path of ["/espace", "/admin", "/portal"])
  check(
    robots.body.includes(`Disallow: ${path}`),
    `robots.txt: private exclusion ${path}`,
  );
for (const path of [
  "/plan-du-site",
  "/en/site-map",
  "/llms.txt",
  "/llms-full.txt",
]) {
  const r = await get(productionOrigin + path);
  check(r.status === 200, `${path}: HTTP ${r.status}`);
  check(
    !/https?:\/\/(?:localhost|127\.0\.0\.1|[^/\s"<]+\.pages\.dev)/.test(r.body),
    `${path}: nonproduction URL`,
  );
}
for (const path of [
  "/does-not-exist-ldgenx-qa",
  "/en/does-not-exist-ldgenx-qa",
  "/does-not-exist-ldgenx-qa.html",
]) {
  const r = await get(productionOrigin + path);
  check(
    r.status === 404 && /noindex/.test(r.body),
    `${path}: real noindex 404 required`,
  );
}
for (const path of [
  "/espace",
  "/admin",
  "/espace/connexion",
  "/admin/connexion",
  "/espace/nouveau-mot-de-passe",
]) {
  const r = await get(productionOrigin + path);
  check(
    r.status === 200 && /noindex, nofollow/.test(r.body),
    `${path}: portal response/indexing`,
  );
}
const preview = await get(previewOrigin + "/");
if (
  !preview.headers["x-robots-tag"]?.includes("noindex") &&
  ![301, 308].includes(preview.status)
)
  warnings.push(
    "Main pages.dev alias still serves indexable content; deploy the new host-specific noindex headers or configure its Bulk Redirect.",
  );
const result = {
  checkedAt: new Date().toISOString(),
  dnsServer: process.env.LDGENX_DNS_SERVER ?? "system",
  productionOrigin,
  passed: !errors.length,
  counts: {
    pages: documents.length,
    indexable: listed.length,
    subSitemaps: sections.length,
    internalLinks: links.size,
    assets: assets.size,
    legacyRedirects: Object.keys(redirects).length,
  },
  domains,
  xml: xmlResult,
  documents,
  preview: {
    status: preview.status,
    robots: preview.headers["x-robots-tag"] ?? null,
  },
  errors,
  warnings,
};
await writeFile(
  `${output}/public-domain-results.json`,
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    { passed: result.passed, ...result.counts, errors, warnings },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
