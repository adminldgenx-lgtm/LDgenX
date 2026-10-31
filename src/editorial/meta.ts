import type { PageMeta } from "../lib/pages";
import { getPage } from "../lib/pages";
import { productionOrigin } from "../../supabase/functions/_shared/site";
import {
  contentBases,
  type EditorialMedia,
  type EditorialSummary,
} from "../../supabase/functions/_shared/editorial";
import { routeSources } from "../content/site";
import { pictureOf } from "./overlay";

export function editorialMeta(
  row: EditorialSummary,
  index: EditorialSummary[],
): PageMeta {
  if (row.kind === "page")
    return {
      ...getPage(row.path),
      title: `${row.seoTitle.trim() || row.title} | LDgenX`,
      description: row.seoDescription.trim() || row.summary,
      coverUrl: row.cover ? editorialShareUrl(row) : undefined,
      editorial: undefined,
    };
  const alternates: PageMeta["alternates"] = {};
  alternates[row.locale] = row.path;
  if (row.legacyId)
    for (const locale of ["fr", "en"] as const) {
      const source = routeSources[locale];
      const list = {
        article: source.resources,
        study: source.studies,
        publication: source.publications,
        service: source.services,
        application: source.applications,
      }[row.kind];
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
  const picture = pictureOf(row);
  const uploaded = picture.startsWith("cms-media:");
  return {
    path: row.path,
    title: `${title} | LDgenX`,
    description: row.seoDescription.trim() || row.summary,
    // Breadcrumbs and links name the item; only papers have a shorter name of their own.
    label: (row.kind === "publication" && row.seoTitle
      ? row.seoTitle
      : row.title
    ).replace(/\*/g, ""),
    kind: row.kind,
    locale: row.locale,
    id: row.legacyId ?? `cms:${row.slug}`,
    image: uploaded ? undefined : picture || undefined,
    coverUrl: uploaded ? editorialShareUrl(row) : undefined,
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
    .filter(
      (p) =>
        byPath.get(p.path)?.kind === "page" ||
        byPath.get(p.path)?.status !== "withdrawn",
    )
    .map((p) => {
      const row = byPath.get(p.path);
      return row?.status === "published"
        ? editorialMeta(row, index)
        : filterEditorialAlternates(p, index);
    });
  // A page edit never adds an address, and its language's catalogue may not be loaded here.
  const known = new Set(result.map((p) => p.path));
  for (const row of index)
    if (
      row.kind !== "page" &&
      row.status === "published" &&
      !known.has(row.path)
    )
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
          !index.some(
            (r) =>
              r.kind !== "page" && r.path === path && r.status === "withdrawn",
          ),
      ),
    ),
  };
}
/** The largest WebP of a picture. */
export const largestUrl = (media?: EditorialMedia | null) =>
  media ? Object.values(media.urls).at(-1) : undefined;
/** The picture of a row, for image search. */
export function editorialImageUrl(row: EditorialSummary) {
  if (row.cover?.staticSrc) return productionOrigin + row.cover.staticSrc;
  return largestUrl(row.coverMedia) ?? "";
}
/** The picture of a row, for social networks. */
export function editorialShareUrl(row: EditorialSummary) {
  return (
    row.coverMedia?.social ||
    editorialImageUrl(row) ||
    `${productionOrigin}/images/social-equipe-maxime.jpg`
  );
}
