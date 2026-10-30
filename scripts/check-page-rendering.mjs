// Real server rendering with synthetic published snapshots; no remote writes.
import assert from "node:assert/strict";
import { editorialPageTemplates } from "../supabase/functions/_shared/editorial-pages.ts";
const site = await import("../.prerender/entry-server.js");
await site.ready;
const marker = "BlocQAprive20261030";
const document = {
  title: "Une page de controle scientifique",
  summary: "Une introduction de contrôle scientifique suffisamment développée.",
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
        content: [{ type: "text", text: "Informations complémentaires" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text:
              marker +
              " : les modules et la présentation existants sont conservés.",
          },
        ],
      },
    ],
  },
  references: [],
  doi: "",
  journal: "",
  year: "",
  reviewed: true,
};
function snapshot(kind, path, locale = "fr") {
  return {
    id: "a25d8998-53f0-4c5d-8e2c-bd8a60f14fba",
    kind,
    path,
    locale,
    slug: path.replace(locale === "en" ? /^\/en(?:\/|$)/ : /^\//, ""),
    groupId: "a25d8998-53f0-4c5d-8e2c-bd8a60f14fbb",
    legacyId: kind === "page" ? "page:" + path : null,
    status: "published",
    title: document.title,
    summary: document.summary,
    category: "",
    author: "LDgenX",
    cover: null,
    seoTitle: "",
    seoDescription: "",
    publishedAt: "2026-10-30T10:00:00Z",
    updatedAt: "2026-10-30T10:00:00Z",
    document,
    media: [],
  };
}
const plainText = (html) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, "");
for (const p of editorialPageTemplates) {
  const row = snapshot("page", p.path, p.locale),
    base = site.render(p.path),
    updated = site.render(p.path, { index: [row], document: row });
  assert(
    updated.html.includes(marker),
    "Missing authored writing on " + p.path,
  );
  assert(
    plainText(updated.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "").includes(
      plainText(document.title),
    ),
    "Edited title not shown on " + p.path,
  );
  assert(
    updated.html.includes(document.summary),
    "Edited introduction not shown on " + p.path,
  );
  const cover = {
    staticSrc: "/images/riviere-1000.webp",
    alt: "Rivière",
    caption: "",
    credit: "LDgenX",
    licenceUrl: "",
  };
  const withCover = {
      ...row,
      cover,
      document: { ...document, cover },
    },
    covered = site.render(p.path, {
      index: [withCover],
      document: withCover,
    });
  assert(
    covered.html.includes(cover.staticSrc),
    "Cover image not shown on " + p.path,
  );
  assert(
    !/cms-(?:hero|home-cover)-credit/.test(covered.html),
    "House picture credited on " + p.path,
  );
  assert(
    covered.head.includes(cover.staticSrc),
    "Cover not used as the social image on " + p.path,
  );
  assert.equal(
    (updated.html.match(/<h1\b/g) || []).length,
    1,
    "Heading count on " + p.path,
  );
  assert(
    (updated.html.match(/<section\b/g) || []).length >=
      (base.html.match(/<section\b/g) || []).length,
    "Existing sections lost on " + p.path,
  );
  const withdrawn = { ...row, status: "withdrawn" };
  assert.equal(
    site.render(p.path, { index: [withdrawn], document: null }).html,
    base.html,
    "Original template not restored on " + p.path,
  );
}
for (const locale of ["fr", "en"])
  for (const kind of ["service", "application"]) {
    const path =
        (locale === "en" ? "/en" : "") +
        (kind === "service" ? "/services/" : "/applications/") +
        "controle-technique",
      row = snapshot(kind, path, locale),
      result = site.render(path, { index: [row], document: row });
    assert(result.html.includes("page-hero"));
    assert(result.html.includes(marker));
    assert.equal((result.html.match(/<h1\b/g) || []).length, 1);
    assert(result.head.includes(kind === "service" ? "#service" : "#webpage"));
  }
console.log(
  `${editorialPageTemplates.length} original page templates apply title, introduction and cover edits, preserve their sections, accept authored additions and restore after withdrawal; four bilingual new-section pages render correctly.`,
);
