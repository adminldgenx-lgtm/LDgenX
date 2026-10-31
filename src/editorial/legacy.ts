import type { Catalog } from "../content/catalog";
import { imageUrl } from "../lib/images";
import {
  contentPath,
  emptyDocument,
  type ContentImage,
  type ContentKind,
  type ContentNode,
  type EditorialDocument,
} from "../../supabase/functions/_shared/editorial";

/* What a built-in item says, as an editable document. The catalogue stays the reference until an
   item has its own saved fields, so the form always opens on what the site shows today. */

const picture = (name: string, alt = ""): ContentImage | null =>
  name
    ? { staticSrc: imageUrl(name), alt, caption: "", credit: "", licenceUrl: "" }
    : null;
// The form holds the title alone: the site's name is added to every page title.
const searchTitle = (title?: string) => title?.replace(/\s*\|\s*LDgenX$/, "") ?? "";
const pick = <T extends object>(item: T, keys: (keyof T)[]) =>
  Object.fromEntries(keys.map((key) => [key, item[key] ?? ""]));
function paragraph(text: string): ContentNode {
  return { type: "paragraph", content: text ? [{ type: "text", text }] : [] };
}

/** The document of a built-in item, or null when the catalogue no longer has it. */
export function legacyDocument(
  kind: ContentKind,
  id: string,
  catalog: Catalog,
): EditorialDocument | null {
  const base = emptyDocument();
  if (kind === "article") {
    const r = catalog.resources.find((x) => x.id === id);
    if (!r) return null;
    return {
      ...base,
      title: r.title,
      summary: r.intro,
      category: r.category,
      cover: picture(r.image),
      fields: { service: r.service },
      body: {
        type: "doc",
        content: r.sections.flatMap((s) => [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: s.title }],
          },
          paragraph(s.text),
        ]),
      },
    };
  }
  if (kind === "study") {
    const s = catalog.studies.find((x) => x.id === id);
    if (!s) return null;
    return {
      ...base,
      title: s.title,
      summary: s.subtitle,
      category: s.category,
      seoTitle: s.seoTitle ?? "",
      cover: picture(s.image, s.imageAlt),
      fields: {
        facts: s.facts,
        context: s.context,
        question: s.question,
        approach: s.approach,
        result: s.result ?? "",
        service: s.service,
        source: s.source,
        ongoing: s.status === "ongoing",
      },
    };
  }
  if (kind === "publication") {
    const p = catalog.research.publications.find((x) => x.id === id);
    if (!p) return null;
    return {
      ...base,
      title: p.readingTitle,
      summary: p.summary,
      seoTitle: p.seoTitle,
      author: p.authors.join("; "),
      doi: p.doi,
      journal: p.journal,
      year: String(p.year),
      fields: {
        ...pick(p, [
          "authors",
          "members",
          "authorNote",
          "issue",
          "online",
          "type",
          "text",
          "licence",
          "question",
          "approach",
          "finding",
          "limit",
          "themes",
          "services",
          "preprint",
          "links",
          "figures",
        ]),
        applications: p.applications ?? [],
      },
    };
  }
  if (kind === "service") {
    const s = catalog.services.find((x) => x.id === id);
    if (!s) return null;
    return {
      ...base,
      title: s.title,
      summary: s.intro,
      seoTitle: searchTitle(s.seo?.title),
      seoDescription: s.seo?.description ?? "",
      cover: picture(s.image),
      fields: pick(s, [
        "headline",
        "short",
        "scope",
        "need",
        "approaches",
        "prestations",
        "uses",
        "sectors",
        "cases",
      ]),
    };
  }
  if (kind === "application") {
    const a = catalog.applications.find((x) => x.id === id);
    if (!a) return null;
    return {
      ...base,
      title: a.title,
      summary: a.intro,
      seoTitle: searchTitle(a.seo?.title),
      seoDescription: a.seo?.description ?? "",
      cover: picture(a.image),
      fields: {
        ...pick(a, ["headline", "scope", "needs", "uses", "examples", "services"]),
        approaches: a.approaches ?? [],
        deliverables: a.deliverables ?? [],
      },
    };
  }
  return null;
}

/** The items of a section as the catalogue lists them, with their public address. */
export function catalogItems(kind: ContentKind, catalog: Catalog) {
  const addressed = (
    items: { id: string; slug: string; title: string; summary: string; image: string }[],
    locale: "fr" | "en",
  ) =>
    items.map((item) => ({
      ...item,
      path: contentPath(kind, locale, item.slug),
    }));
  const locale = catalog.ui.lang as "fr" | "en";
  if (kind === "article")
    return addressed(
      catalog.resources.map((r) => ({ ...r, summary: r.intro })),
      locale,
    );
  if (kind === "study")
    return addressed(
      catalog.studies.map((s) => ({ ...s, summary: s.subtitle })),
      locale,
    );
  if (kind === "service")
    return addressed(
      catalog.services.map((s) => ({ ...s, summary: s.short })),
      locale,
    );
  if (kind === "application")
    return addressed(
      catalog.applications.map((a) => ({ ...a, summary: a.scope })),
      locale,
    );
  if (kind === "publication")
    return addressed(
      catalog.research.publications.map((p) => ({
        id: p.id,
        slug: catalog.publications.find((x) => x.id === p.id)?.slug ?? p.id,
        title: p.readingTitle,
        summary: `${p.journal}, ${p.year}`,
        image: p.figures[0]?.image ?? "",
      })),
      locale,
    );
  return [];
}
