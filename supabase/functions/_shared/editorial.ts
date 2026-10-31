// The editor, verified API and public renderer share this deliberately small document schema.
// No HTML, scripts, arbitrary embeds or CSS are accepted from an authoring request.
export type ContentKind =
  "article" | "study" | "publication" | "service" | "application" | "page";
export const contentKinds: ContentKind[] = [
  "article",
  "study",
  "publication",
  "service",
  "application",
  "page",
];
export interface EditorialPageTemplate {
  path: string;
  locale: ContentLocale;
  label: string;
  title: string;
  summary: string;
  kind: string;
  alternates: Partial<Record<ContentLocale, string>>;
}
export type ContentLocale = "fr" | "en";
export interface TextMark {
  type:
    | "bold"
    | "italic"
    | "underline"
    | "strike"
    | "subscript"
    | "superscript"
    | "link";
  attrs?: { href: string };
}
export interface ContentNode {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TextMark[];
  content?: ContentNode[];
}
export interface ContentImage {
  mediaId?: string;
  staticSrc?: string;
  alt: string;
  caption: string;
  credit: string;
  licenceUrl: string;
}
export interface Reference {
  label: string;
  url: string;
}
export interface EditorialDocument {
  title: string;
  summary: string;
  category: string;
  author: string;
  seoTitle: string;
  seoDescription: string;
  cover: ContentImage | null;
  body: ContentNode;
  references: Reference[];
  doi: string;
  journal: string;
  year: string;
  /** What the page's template shows beyond the above, under the catalogue's own names. */
  fields: Record<string, unknown>;
  reviewed: boolean;
}
export interface MediaVariant {
  path: string;
  width: number;
  height: number;
  bytes: number;
  mime: string;
}
export interface EditorialMedia {
  id: string;
  name: string;
  kind: "image" | "video";
  bytes: number;
  variants: MediaVariant[];
  isPublic: boolean;
  createdAt: string;
  /** Address of each WebP size, by width. */
  urls: Record<string, string>;
  /** The 1200 × 630 JPEG read by social networks. */
  social?: string;
  uses?: number;
}
export interface EditorialSummary {
  id: string;
  kind: ContentKind;
  locale: ContentLocale;
  path: string;
  slug: string;
  groupId: string;
  legacyId: string | null;
  status: "published" | "withdrawn";
  title: string;
  summary: string;
  category: string;
  author: string;
  cover: ContentImage | null;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  updatedAt: string;
  year?: string;
  journal?: string;
  doi?: string;
  /** The template fields other pages show: cards, lists and links. */
  card?: Record<string, unknown>;
  coverMedia?: EditorialMedia | null;
}
export interface PublishedDocument extends EditorialSummary {
  document: EditorialDocument;
  media: EditorialMedia[];
}
export interface EditorialEntry {
  id: string;
  kind: ContentKind;
  locale: ContentLocale;
  slug: string;
  groupId: string;
  legacyId: string | null;
  version: number;
  document: EditorialDocument;
  publication: EditorialSummary | null;
  publishedVersion: number | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  deletedAt?: string | null;
  coverMedia?: EditorialMedia | null;
}
export interface EditorialRevision {
  id: string;
  version: number;
  reason: string;
  createdAt: string;
  author: string;
  document?: EditorialDocument;
}

export const EDITORIAL_LIMITS = {
  imageSourceBytes: 20_000_000,
  imageSourcePixels: 40_000_000,
  imageUploadBytes: 5_000_000,
  imageVariantBytes: 1_800_000,
  imageWidth: 2400,
  imageFiles: 5,
  videoBytes: 20_000_000,
  videoSeconds: 180,
  mediaBudgetBytes: 250_000_000,
  projectStorageCeiling: 900_000_000,
  documentBytes: 200_000,
  textCharacters: 100_000,
  nodes: 2500,
  revisionsPerEntry: 10,
  revisionBudgetBytes: 20_000_000,
};
/** One editable part of a template. Keys are the catalogue's, so a published item and a built-in
 *  one reach the same page template in the same shape. */
export interface FieldSpec {
  key: string;
  type:
    | "text"
    | "long"
    | "url"
    | "date"
    | "flag"
    | "choice"
    | "pick"
    | "picks"
    | "list"
    | "rows"
    | "figures"
    | "cases";
  required?: boolean;
  options?: string[];
  columns?: [string, string];
}
export const templateFields: Record<ContentKind, FieldSpec[]> = {
  page: [],
  article: [{ key: "service", type: "pick" }],
  study: [
    { key: "facts", type: "rows", columns: ["label", "value"] },
    { key: "context", type: "long", required: true },
    { key: "question", type: "long", required: true },
    { key: "approach", type: "long", required: true },
    { key: "result", type: "long" },
    { key: "service", type: "pick" },
    { key: "source", type: "url" },
    { key: "ongoing", type: "flag" },
  ],
  publication: [
    { key: "authors", type: "list", required: true },
    { key: "members", type: "picks" },
    { key: "authorNote", type: "text" },
    { key: "issue", type: "text" },
    { key: "online", type: "date" },
    { key: "type", type: "choice", options: ["article", "review"] },
    {
      key: "text",
      type: "choice",
      options: ["published", "preprint", "abstract"],
    },
    { key: "licence", type: "text" },
    { key: "question", type: "long", required: true },
    { key: "approach", type: "long", required: true },
    { key: "finding", type: "long", required: true },
    { key: "limit", type: "long", required: true },
    { key: "themes", type: "picks" },
    { key: "services", type: "picks" },
    { key: "applications", type: "picks" },
    { key: "preprint", type: "url" },
    { key: "links", type: "rows", columns: ["label", "url"] },
    { key: "figures", type: "figures" },
  ],
  service: [
    { key: "headline", type: "text", required: true },
    { key: "short", type: "text", required: true },
    { key: "scope", type: "text", required: true },
    { key: "need", type: "long", required: true },
    { key: "approaches", type: "rows", columns: ["title", "text"], required: true },
    { key: "prestations", type: "list" },
    { key: "uses", type: "list" },
    { key: "sectors", type: "picks" },
    { key: "cases", type: "cases" },
  ],
  application: [
    { key: "headline", type: "text", required: true },
    { key: "scope", type: "text", required: true },
    { key: "needs", type: "rows", columns: ["title", "text"], required: true },
    { key: "uses", type: "list" },
    { key: "examples", type: "list" },
    { key: "approaches", type: "rows", columns: ["title", "text"] },
    { key: "deliverables", type: "list" },
    { key: "services", type: "picks" },
  ],
};
/** Fields other pages show: they travel in the public index, the rest with the page itself. */
export const cardFields: Record<ContentKind, string[]> = {
  page: [],
  article: ["service"],
  study: ["facts", "question", "service", "ongoing"],
  publication: [
    "authors",
    "members",
    "type",
    "issue",
    "themes",
    "services",
    "applications",
  ],
  service: ["headline", "short", "scope", "sectors"],
  application: ["headline", "scope", "needs", "services"],
};
export const contentBases = {
  fr: {
    article: "/ressources",
    study: "/etudes-de-cas",
    publication: "/recherche",
    service: "/services",
    application: "/applications",
    page: "",
  },
  en: {
    article: "/en/resources",
    study: "/en/case-studies",
    publication: "/en/research",
    service: "/en/services",
    application: "/en/applications",
    page: "/en",
  },
};
export const contentPath = (
  kind: ContentKind,
  locale: ContentLocale,
  slug: string,
) =>
  slug
    ? `${contentBases[locale][kind]}/${slug}`
    : contentBases[locale][kind] || "/";
export const emptyDocument = (): EditorialDocument => ({
  title: "",
  summary: "",
  category: "",
  author: "LDgenX",
  seoTitle: "",
  seoDescription: "",
  cover: null,
  body: { type: "doc", content: [{ type: "paragraph" }] },
  references: [],
  doi: "",
  journal: "",
  year: "",
  fields: {},
  reviewed: false,
});
export function contentSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
    .replace(/-$/, "");
}
export class EditorialError extends Error {
  code: string;
  status: number;
  details: string[];
  constructor(code: string, status = 400, details: string[] = []) {
    super(code);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
const fail = (message: string): never => {
  throw new EditorialError("invalid_input", 400, [message]);
};
function record(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return fail("object");
  return input as Record<string, unknown>;
}
function str(input: unknown, max = 1000): string {
  if (
    typeof input !== "string" ||
    input.length > max ||
    // eslint-disable-next-line no-control-regex -- Reject control characters in author text.
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input)
  )
    return fail("text");
  return input;
}
export function safeLink(input: unknown, optional = false): string {
  const value = str(input, 2000).trim();
  if (!value && optional) return "";
  if (/^\/(?!\/)[^\s\\]*$/.test(value) || /^#[a-zA-Z][\w-]*$/.test(value))
    return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.href;
  } catch {
    /* Invalid URL. */
  }
  return fail("url");
}
export function normalizeDoi(input: string) {
  return input.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
}
export function videoEmbed(input: unknown): {
  provider: "youtube" | "vimeo";
  id: string;
  url: string;
} {
  const value = safeLink(input);
  try {
    const u = new URL(value);
    if (
      [
        "www.youtube.com",
        "youtube.com",
        "youtu.be",
        "www.youtube-nocookie.com",
      ].includes(u.hostname)
    ) {
      const id =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
          : (u.searchParams.get("v") ??
            u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]);
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id))
        return {
          provider: "youtube",
          id,
          url: `https://www.youtube-nocookie.com/embed/${id}`,
        };
    }
    if (
      ["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(u.hostname)
    ) {
      const id = u.pathname.match(/^\/(?:video\/)?(\d{6,12})$/)?.[1];
      if (id)
        return {
          provider: "vimeo",
          id,
          url: `https://player.vimeo.com/video/${id}?dnt=1`,
        };
    }
  } catch {
    /* Invalid provider link. */
  }
  return fail("video_url");
}
function image(input: unknown): ContentImage {
  const i = record(input);
  const result: ContentImage = {
    alt: str(i.alt, 500),
    caption: str(i.caption, 2000),
    credit: str(i.credit, 500),
    licenceUrl: safeLink(i.licenceUrl ?? "", true),
  };
  if (i.mediaId) result.mediaId = validId(i.mediaId);
  else if (
    typeof i.staticSrc === "string" &&
    /^\/images\/[a-zA-Z0-9_-]+\.(webp|png|jpg)$/.test(i.staticSrc)
  )
    result.staticSrc = i.staticSrc;
  else return fail("image");
  return result;
}
/** A built-in picture by name, or an uploaded one. */
const mediaReference = /^cms-media:([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/i;
function pictureName(input: unknown): string {
  const value = str(input ?? "", 80);
  if (value && !/^[a-z0-9-]+$/.test(value) && !mediaReference.test(value))
    return fail("image");
  return value;
}
const identifier = (input: unknown) => {
  const value = str(input ?? "", 120);
  if (value && !/^(cms:)?[a-z0-9-]+$/.test(value)) return fail("id");
  return value;
};
function items(input: unknown, limit: number): unknown[] {
  if (!Array.isArray(input) || input.length > limit) return fail("list");
  return input;
}
function caseLink(input: unknown) {
  const link = record(input);
  if (link.kind === "external")
    return { kind: "external", href: safeLink(link.href) };
  if (
    ![
      "service",
      "application",
      "study",
      "work",
      "innovation",
      "person",
      "publication",
    ].includes(String(link.kind))
  )
    return fail("link");
  return { kind: String(link.kind), id: identifier(link.id) };
}
function fieldValue(spec: FieldSpec, input: unknown): unknown {
  switch (spec.type) {
    case "text":
      return str(input ?? "", 600);
    case "long":
      return str(input ?? "", 8000);
    case "url":
      return safeLink(input ?? "", true);
    case "date": {
      const value = str(input ?? "", 10);
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fail("date");
      return value;
    }
    case "flag":
      return input === true;
    case "choice": {
      const value = str(input ?? "", 40);
      if (value && !spec.options?.includes(value)) return fail("choice");
      return value;
    }
    case "pick":
      return identifier(input);
    case "picks":
      return items(input, 40).map(identifier);
    case "list":
      return items(input, 80).map((value) => str(value, 1500));
    case "rows":
      return items(input, 40).map((raw) => {
        const row = record(raw);
        return Object.fromEntries(
          spec.columns!.map((column) => [
            column,
            column === "url"
              ? safeLink(row[column] ?? "", true)
              : str(row[column] ?? "", 3000),
          ]),
        );
      });
    case "figures":
      return items(input, 12).map((raw) => {
        const f = record(raw);
        return {
          image: pictureName(f.image),
          label: str(f.label ?? "", 120),
          caption: str(f.caption ?? "", 3000),
          credit: str(f.credit ?? "", 500),
          licence: str(f.licence ?? "", 120),
          width: Number(f.width) || 0,
          height: Number(f.height) || 0,
        };
      });
    case "cases":
      return items(input, 30).map((raw) => {
        const c = record(raw);
        return {
          title: str(c.title ?? "", 400),
          ...(c.image ? { image: pictureName(c.image) } : {}),
          ...(c.link ? { link: caseLink(c.link) } : {}),
        };
      });
  }
}
export function validateFields(kind: ContentKind, input: unknown) {
  const values =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    templateFields[kind]
      .filter((spec) => values[spec.key] !== undefined)
      .map((spec) => [spec.key, fieldValue(spec, values[spec.key])]),
  );
}
export function validId(input: unknown): string {
  if (
    typeof input !== "string" ||
    !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(input)
  )
    return fail("id");
  return input;
}
const containers = new Set([
  "doc",
  "paragraph",
  "heading",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
]);
const marks = new Set([
  "bold",
  "italic",
  "underline",
  "strike",
  "subscript",
  "superscript",
  "link",
]);
export function validateDocument(
  input: unknown,
  kind: ContentKind,
): EditorialDocument {
  if (
    new TextEncoder().encode(JSON.stringify(input)).byteLength >
    EDITORIAL_LIMITS.documentBytes
  )
    return fail("document_size");
  const value = record(input);
  let count = 0,
    characters = 0;
  function walk(raw: unknown, depth = 0): ContentNode {
    if (++count > EDITORIAL_LIMITS.nodes || depth > 12)
      return fail("document_depth");
    const n = record(raw),
      type = str(n.type, 40);
    if (type === "text") {
      const text = str(n.text, EDITORIAL_LIMITS.textCharacters);
      characters += text.length;
      if (characters > EDITORIAL_LIMITS.textCharacters)
        return fail("document_text");
      const result: ContentNode = { type, text };
      if (n.marks !== undefined) {
        if (!Array.isArray(n.marks) || n.marks.length > 7) return fail("marks");
        result.marks = n.marks.map((raw) => {
          const mark = record(raw);
          if (!marks.has(String(mark.type))) return fail("mark");
          return mark.type === "link"
            ? {
                type: "link",
                attrs: { href: safeLink(record(mark.attrs).href) },
              }
            : { type: mark.type as TextMark["type"] };
        });
      }
      return result;
    }
    if (type === "hardBreak" || type === "horizontalRule") return { type };
    if (type === "figure") return { type, attrs: { ...image(n.attrs) } };
    if (type === "video") {
      const a = record(n.attrs),
        title = str(a.title, 300),
        caption = str(a.caption, 2000),
        transcript = str(a.transcript, 20000);
      if (a.mediaId)
        return {
          type,
          attrs: {
            mediaId: validId(a.mediaId),
            title,
            caption,
            transcript,
            posterId: a.posterId ? validId(a.posterId) : "",
          },
        };
      return {
        type,
        attrs: { url: videoEmbed(a.url).url, title, caption, transcript },
      };
    }
    if (!containers.has(type)) return fail("node");
    const result: ContentNode = { type, content: [] };
    if (n.content !== undefined) {
      if (!Array.isArray(n.content)) return fail("children");
      // Early working copies carried a marker for evidence the template now shows by itself.
      result.content = n.content
        .filter((x) => record(x).type !== "studyEvidence")
        .map((x) => walk(x, depth + 1));
    }
    const children = result.content ?? [];
    const blocks = [
      "paragraph",
      "heading",
      "blockquote",
      "bulletList",
      "orderedList",
      "table",
      "figure",
      "video",
      "horizontalRule",
    ];
    const allowed =
      type === "paragraph" || type === "heading"
        ? ["text", "hardBreak"]
        : type === "table"
          ? ["tableRow"]
          : type === "tableRow"
            ? ["tableCell", "tableHeader"]
            : type === "bulletList" || type === "orderedList"
              ? ["listItem"]
              : blocks;
    if (children.some((child) => !allowed.includes(child.type)))
      return fail("children");
    if (
      [
        "table",
        "tableRow",
        "tableCell",
        "tableHeader",
        "listItem",
        "bulletList",
        "orderedList",
        "blockquote",
      ].includes(type) &&
      !children.length
    )
      return fail("children");
    if (type === "listItem" && children[0]?.type !== "paragraph")
      return fail("children");
    if (type === "heading") {
      const level = Number(record(n.attrs).level);
      if (![2, 3, 4].includes(level)) return fail("heading");
      result.attrs = { level };
    }
    if (type === "orderedList") {
      const start = Number(n.attrs ? (record(n.attrs).start ?? 1) : 1);
      if (!Number.isSafeInteger(start) || start < 1 || start > 10000)
        return fail("list");
      result.attrs = { start };
    }
    if (type === "tableCell" || type === "tableHeader") {
      const attrs = n.attrs ? record(n.attrs) : {};
      const colspan = Number(attrs.colspan ?? 1),
        rowspan = Number(attrs.rowspan ?? 1);
      if (
        ![colspan, rowspan].every(
          (span) => Number.isSafeInteger(span) && span >= 1 && span <= 100,
        )
      )
        return fail("table_span");
      result.attrs = { colspan, rowspan, colwidth: null };
    }
    return result;
  }
  const body = walk(value.body);
  if (body.type !== "doc") return fail("document");
  if (!Array.isArray(value.references) || value.references.length > 50)
    return fail("references");
  const doi = normalizeDoi(str(value.doi, 300));
  if (doi && !/^10\.\d{4,9}\/\S+$/i.test(doi)) return fail("doi");
  const year = str(value.year, 4);
  if (year && !/^(19|20|21)\d{2}$/.test(year)) return fail("year");
  return {
    title: str(value.title, 260),
    summary: str(value.summary, 600),
    category: str(value.category, 100),
    author: str(value.author, 1000),
    seoTitle: str(value.seoTitle, 100),
    seoDescription: str(value.seoDescription, 220),
    cover: value.cover ? image(value.cover) : null,
    body,
    references: value.references.map((raw) => {
      const r = record(raw);
      return { label: str(r.label, 1000), url: safeLink(r.url, true) };
    }),
    doi,
    journal: str(value.journal, 240),
    year,
    fields: validateFields(kind, value.fields),
    reviewed: value.reviewed === true,
  };
}
export function documentText(node: ContentNode): string {
  return node.text ?? (node.content ?? []).map(documentText).join(" ");
}
export function documentMedia(document: EditorialDocument): string[] {
  const ids = new Set<string>();
  if (document.cover?.mediaId) ids.add(document.cover.mediaId);
  function walk(node: ContentNode) {
    for (const k of ["mediaId", "posterId"])
      if (node.attrs?.[k]) ids.add(String(node.attrs[k]));
    node.content?.forEach(walk);
  }
  walk(document.body);
  for (const key of ["figures", "cases"]) {
    const list = document.fields?.[key];
    if (Array.isArray(list))
      for (const item of list) {
        const id = String(item?.image ?? "").match(mediaReference)?.[1];
        if (id) ids.add(id);
      }
  }
  return [...ids];
}
const isBlank = (value: unknown) =>
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && !value.length);
export function publicationIssues(
  document: EditorialDocument,
  kind: ContentKind,
): string[] {
  const issues: string[] = [];
  if (document.title.trim().length < 3) issues.push("title");
  if (document.summary.trim().length < 20) issues.push("summary");
  if (kind === "article" && documentText(document.body).trim().length < 100)
    issues.push("body");
  // Every template but these shows a picture, and its cards need one.
  if (!["page", "publication"].includes(kind) && !document.cover)
    issues.push("cover");
  for (const spec of templateFields[kind])
    if (spec.required && isBlank(document.fields?.[spec.key]))
      issues.push(`field:${spec.key}`);
  if (!document.reviewed) issues.push("review");
  function walk(n: ContentNode) {
    if (n.type === "figure" && !String(n.attrs?.alt ?? "").trim())
      issues.push("alt");
    if (n.type === "video" && !String(n.attrs?.title ?? "").trim())
      issues.push("video_title");
    n.content?.forEach(walk);
  }
  walk(document.body);
  if (
    kind === "publication" &&
    (!document.doi || !document.journal || !document.year)
  )
    issues.push("publication_reference");
  if (document.references.some((r) => !r.label.trim()))
    issues.push("reference_label");
  return [...new Set(issues)];
}
export function summarize(
  entry: Omit<
    EditorialSummary,
    | "title"
    | "summary"
    | "category"
    | "author"
    | "cover"
    | "seoTitle"
    | "seoDescription"
    | "card"
  >,
  document: EditorialDocument,
): EditorialSummary {
  const {
    title,
    summary,
    category,
    author,
    cover,
    seoTitle,
    seoDescription,
    year,
    journal,
    doi,
  } = document;
  return {
    ...entry,
    title,
    summary,
    category,
    author,
    cover,
    seoTitle,
    seoDescription,
    year,
    journal,
    doi,
    card: Object.fromEntries(
      cardFields[entry.kind]
        .filter((key) => document.fields?.[key] !== undefined)
        .map((key) => [key, document.fields[key]]),
    ),
  };
}
