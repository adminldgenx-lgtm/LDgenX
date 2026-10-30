import type { PageMeta } from "../lib/pages";
import { productionOrigin } from "../../supabase/functions/_shared/site";
import {
  contentBases,
  type EditorialSummary,
} from "../../supabase/functions/_shared/editorial";
import { routeSources } from "../content/site";

export function editorialMeta(
  row: EditorialSummary,
  index: EditorialSummary[],
): PageMeta {
  const alternates: PageMeta["alternates"] = {};
  alternates[row.locale] = row.path;
  if (row.legacyId)
    for (const locale of ["fr", "en"] as const) {
      const source = routeSources[locale];
      const list =
        row.kind === "article"
          ? source.resources
          : row.kind === "study"
            ? source.studies
            : source.publications;
      const original = list.find((x) => x.id === row.legacyId);
      if (original) {
        const path = `${contentBases[locale][row.kind]}/${original.slug}`;
        if (!index.some((r) => r.path === path && r.status === "withdrawn"))
          alternates[locale] = path;
      }
    }
  for (const other of index)
    if (other.groupId === row.groupId && other.status === "published")
      alternates[other.locale] = other.path;
  const title = (row.seoTitle.trim() || row.title).replace(/\*/g, "");
  return {
    path: row.path,
    title: `${title} | LDgenX`,
    description: row.seoDescription.trim() || row.summary,
    label: (row.seoTitle || row.title).replace(/\*/g, ""),
    kind: row.kind,
    locale: row.locale,
    id: row.legacyId ?? `cms:${row.id}`,
    alternates,
    editorial: row,
  };
}
export function mergeEditorialPages(
  pages: PageMeta[],
  index: EditorialSummary[],
) {
  const byPath = new Map(index.map((row) => [row.path, row]));
  const result = pages
    .filter((p) => byPath.get(p.path)?.status !== "withdrawn")
    .map((p) => {
      const row = byPath.get(p.path);
      return row?.status === "published"
        ? editorialMeta(row, index)
        : filterEditorialAlternates(p, index);
    });
  const known = new Set(result.map((p) => p.path));
  for (const row of index)
    if (row.status === "published" && !known.has(row.path))
      result.push(editorialMeta(row, index));
  return result;
}
export function filterEditorialAlternates(
  meta: PageMeta,
  index: EditorialSummary[],
): PageMeta {
  return {
    ...meta,
    alternates: Object.fromEntries(
      Object.entries(meta.alternates).filter(
        ([, path]) =>
          !index.some((r) => r.path === path && r.status === "withdrawn"),
      ),
    ),
  };
}
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export function editorialCoverUrl(row: EditorialSummary) {
  if (row.cover?.staticSrc) return productionOrigin + row.cover.staticSrc;
  const urls = row.coverMedia?.urls;
  if (urls) return Object.values(urls).at(-1) ?? "";
  return `${productionOrigin}/images/social-equipe-maxime.jpg`;
}
export function editorialHead(meta: PageMeta) {
  const row = meta.editorial!;
  const canonical = productionOrigin + row.path,
    image = editorialCoverUrl(row);
  const title = escape(meta.title),
    description = escape(meta.description);
  const authors = row.author
    .split(";")
    .map((name) => ({
      "@type": name.trim() === "LDgenX" ? "Organization" : "Person",
      name: name.trim(),
    }));
  const article = {
    "@type": "Article",
    "@id": `${canonical}#article`,
    headline: row.title.replace(/\*/g, ""),
    description: row.summary,
    mainEntityOfPage: canonical,
    datePublished: row.publishedAt,
    dateModified: row.updatedAt,
    author:
      row.kind === "publication"
        ? [{ "@type": "Organization", name: "LDgenX" }]
        : authors,
    ...(row.kind === "publication"
      ? {
          about: {
            "@type": "ScholarlyArticle",
            headline: row.title.replace(/\*/g, ""),
            author: authors,
            isPartOf: { "@type": "Periodical", name: row.journal },
            ...(row.doi
              ? {
                  sameAs: `https://doi.org/${row.doi}`,
                  identifier: {
                    "@type": "PropertyValue",
                    propertyID: "DOI",
                    value: row.doi,
                  },
                }
              : {}),
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "LDgenX",
      url: productionOrigin,
    },
    image,
    inLanguage: row.locale,
  };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: meta.title,
        description: meta.description,
        inLanguage: row.locale,
        isPartOf: { "@id": `${productionOrigin}/#website` },
      },
      article,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: row.locale === "fr" ? "Accueil" : "Home",
            item: productionOrigin + (row.locale === "fr" ? "/" : "/en"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name:
              row.kind === "study"
                ? row.locale === "fr"
                  ? "Études de cas"
                  : "Case studies"
                : row.kind === "publication"
                  ? row.locale === "fr"
                    ? "Recherche"
                    : "Research"
                  : row.locale === "fr"
                    ? "Ressources"
                    : "Resources",
            item: productionOrigin + contentBases[row.locale][row.kind],
          },
          {
            "@type": "ListItem",
            position: 3,
            name: row.title.replace(/\*/g, ""),
            item: canonical,
          },
        ],
      },
    ],
  };
  return `<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${escape(canonical)}">
${Object.entries(meta.alternates)
  .map(
    ([lang, path]) =>
      `<link rel="alternate" hreflang="${lang}" href="${productionOrigin}${escape(path)}">`,
  )
  .join("\n")}
${meta.alternates.fr ? `<link rel="alternate" hreflang="x-default" href="${productionOrigin}${escape(meta.alternates.fr)}">` : ""}
<meta property="og:locale" content="${row.locale === "fr" ? "fr_FR" : "en_GB"}">
<meta property="og:site_name" content="LDgenX"><meta property="og:type" content="article">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${escape(image)}">
<meta property="og:image:alt" content="${escape(row.cover?.alt ?? row.title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${escape(image)}">
<script id="ldgenx-schema" type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`;
}
