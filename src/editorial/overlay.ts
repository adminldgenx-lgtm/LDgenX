import type { Catalog } from "../content/catalog";
import type { Expertise, Sector, Study } from "../content/fr";
import type { ResearchPublication, Resource } from "../content/types";
import type { Locale } from "../lib/routes";
import {
  documentText,
  type ContentKind,
  type ContentNode,
  type EditorialSummary,
  type PublishedDocument,
} from "../../supabase/functions/_shared/editorial";

/* Published content reaches the site through its catalogue: the page templates, lists, menus and
   structured data read one source, so an edited or new item gets the same design and animations
   as a built-in one. An edit replaces the item in place; a new item joins its list. Only the
   language being shown is touched: the other catalogue may not be loaded. */

type Documents = Record<string, PublishedDocument>;
type Row = EditorialSummary;

const plain = (text: string) => text.replace(/\*/g, "");

/** The picture of a row, as `Photo` names it: an upload, or the built-in picture it started from. */
export function pictureOf(row: Row, fallback = "") {
  if (row.cover?.mediaId) return `cms-media:${row.cover.mediaId}`;
  return row.cover?.staticSrc?.match(/^\/images\/(.+)-\d+\.\w+$/)?.[1] ?? fallback;
}

/** An article's text as its template lays it out: one part for each level-2 heading. */
export function articleSections(body: ContentNode): Resource["sections"] {
  const sections: Resource["sections"] = [];
  for (const node of body.content ?? []) {
    if (node.type === "heading" && node.attrs?.level === 2)
      sections.push({ title: documentText(node).trim(), text: "", nodes: [] });
    else if (
      node.type !== "paragraph" ||
      (node.content?.length ?? 0) > 0
    ) {
      if (!sections.length) sections.push({ title: "", text: "", nodes: [] });
      sections.at(-1)!.nodes!.push(node);
    }
  }
  return sections;
}

export function overlayCatalog(
  base: Catalog,
  locale: Locale,
  index: Row[],
  documents: Documents,
): Catalog {
  const rows = index.filter((r) => r.locale === locale && r.kind !== "page");
  if (!rows.length) return base;
  const fields = (row: Row) => ({
    ...row.card,
    ...documents[row.path]?.document.fields,
  });
  const identity = (row: Row, item?: { id: string }) => ({
    id: item?.id ?? `cms:${row.slug}`,
    slug: row.slug,
  });
  function merge<T extends { id: string }>(
    kind: ContentKind,
    list: T[],
    build: (row: Row, item?: T) => T,
    first = true,
  ) {
    const own = rows.filter((r) => r.kind === kind);
    const edited = list.flatMap((item) => {
      const row = own.find((r) => r.legacyId === item.id);
      if (!row) return [item];
      return row.status === "published" ? [build(row, item)] : [];
    });
    const added = own
      .filter((r) => !r.legacyId && r.status === "published")
      .map((r) => build(r));
    return first ? [...added, ...edited] : [...edited, ...added];
  }
  const resource = (row: Row, item?: Resource): Resource => {
    const f = fields(row) as Partial<Resource>;
    const content = documents[row.path];
    return {
      ...item,
      ...identity(row, item),
      title: row.title,
      intro: row.summary,
      category: row.category || item?.category || "",
      image: pictureOf(row, item?.image),
      service: f.service ?? item?.service ?? "",
      sections: content
        ? articleSections(content.document.body)
        : (item?.sections ?? []),
    };
  };
  const study = (row: Row, item?: Study): Study => {
    const { ongoing, ...f } = fields(row) as Partial<Study> & {
      ongoing?: boolean;
    };
    return {
      facts: [],
      context: "",
      question: "",
      approach: "",
      result: "",
      service: "",
      source: "",
      ...item,
      ...f,
      ...identity(row, item),
      title: row.title,
      subtitle: row.summary,
      category: row.category || item?.category || "",
      image: pictureOf(row, item?.image),
      imageAlt: row.cover?.alt || item?.imageAlt,
      seoTitle: plain(row.seoTitle) || item?.seoTitle,
      status: (ongoing ?? item?.status === "ongoing") ? "ongoing" : undefined,
    };
  };
  const publication = (
    row: Row,
    item?: ResearchPublication,
  ): ResearchPublication => {
    const f = fields(row) as Partial<ResearchPublication>;
    return {
      authors: [],
      members: [],
      issue: "",
      type: "article",
      links: [],
      text: "published",
      licence: "",
      themes: [],
      services: [],
      question: "",
      approach: "",
      finding: "",
      limit: "",
      figures: [],
      ...item,
      ...f,
      id: item?.id ?? `cms:${row.slug}`,
      readingTitle: row.title,
      title: plain(row.title),
      seoTitle: plain(row.seoTitle) || plain(row.title),
      summary: row.summary,
      journal: row.journal || item?.journal || "",
      year: Number(row.year) || item?.year || 0,
      doi: row.doi || item?.doi || "",
    };
  };
  const service = (row: Row, item?: Expertise): Expertise => {
    const f = fields(row) as Partial<Expertise>;
    return {
      short: "",
      scope: "",
      need: "",
      approaches: [],
      uses: [],
      sectors: [],
      delivery: "",
      prestations: [],
      cases: [],
      source: "",
      ...item,
      ...f,
      ...identity(row, item),
      title: plain(row.title),
      headline: f.headline || item?.headline || plain(row.title),
      intro: row.summary,
      image: pictureOf(row, item?.image),
    };
  };
  const application = (row: Row, item?: Sector): Sector => {
    const f = fields(row) as Partial<Sector>;
    return {
      scope: "",
      needs: [],
      services: [],
      uses: [],
      examples: [],
      source: "",
      ...item,
      ...f,
      ...identity(row, item),
      title: plain(row.title),
      headline: f.headline || item?.headline || plain(row.title),
      intro: row.summary,
      image: pictureOf(row, item?.image),
    };
  };
  const publications = merge(
    "publication",
    base.research.publications,
    publication,
  );
  const added = publications.some((p) => p.id.startsWith("cms:"));
  return {
    ...base,
    resources: merge("article", base.resources, resource),
    studies: merge("study", base.studies, study),
    // The offer keeps its order; a new expertise or field comes after it.
    services: merge("service", base.services, service, false),
    applications: merge("application", base.applications, application, false),
    research: {
      ...base.research,
      publications: added
        ? [...publications].sort((a, b) => b.year - a.year)
        : publications,
      featured: base.research.featured.filter((f) =>
        publications.some((p) => p.id === f.publication),
      ),
    },
  };
}
