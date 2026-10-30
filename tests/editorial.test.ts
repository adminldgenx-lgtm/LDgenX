import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyDocument,
  validateDocument,
  publicationIssues,
  safeLink,
  videoEmbed,
  documentMedia,
  contentSlug,
  EditorialError,
  contentPath,
  contentKinds,
} from "../supabase/functions/_shared/editorial.ts";
import { editorialPageTemplates } from "../supabase/functions/_shared/editorial-pages.ts";

test("new sections and existing-page paths remain bilingual and stable", () => {
  assert.equal(
    contentPath("service", "fr", "nouvelle-expertise"),
    "/services/nouvelle-expertise",
  );
  assert.equal(
    contentPath("application", "en", "new-application"),
    "/en/applications/new-application",
  );
  assert.equal(contentPath("page", "fr", ""), "/");
  assert.equal(contentPath("page", "en", ""), "/en");
  assert.equal(
    contentPath("page", "fr", "a-propos/equipe"),
    "/a-propos/equipe",
  );
  assert.equal(new Set(contentKinds).size, 6);
});
test("page edits can preserve existing body sections while requiring review and image rights", () => {
  const d = emptyDocument();
  d.title = "Accueil";
  d.summary = "Une introduction scientifique suffisamment développée.";
  assert.deepEqual(publicationIssues(d, "page"), ["review"]);
  d.reviewed = true;
  assert.deepEqual(publicationIssues(d, "page"), []);
  d.cover = {
    mediaId: "17a1a94a-e945-4eb9-8865-2b4dcbeef47a",
    alt: "",
    caption: "",
    credit: "",
    licenceUrl: "",
  };
  assert.deepEqual(publicationIssues(d, "page"), ["alt", "credit"]);
  assert(publicationIssues(d, "service").includes("body"));
});
test("editable page registry contains only unique existing public routes", () => {
  assert(editorialPageTemplates.length > 20);
  assert.equal(
    new Set(editorialPageTemplates.map((p) => p.path)).size,
    editorialPageTemplates.length,
  );
  for (const p of editorialPageTemplates) {
    assert(p.path.startsWith("/"));
    assert(!/^\/(?:admin|espace|api)(?:\/|$)/.test(p.path));
    assert(!p.path.includes(".."));
    assert(p.title.trim());
    assert(p.summary.trim());
  }
});
import {
  webpSize,
  videoMime,
} from "../supabase/functions/_shared/editorial-media.ts";
function rejects(fn: () => unknown) {
  assert.throws(fn, EditorialError);
}
test("scientific formatting survives validation without HTML", () => {
  const d = emptyDocument();
  d.body = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Dicentrarchus labrax",
            marks: [{ type: "italic" }],
          },
          { type: "text", text: "2", marks: [{ type: "subscript" }] },
        ],
      },
    ],
  };
  assert.deepEqual(validateDocument(d).body, d.body);
});
test("script links, untrusted players and malformed documents are rejected", () => {
  for (const link of [
    "javascript:alert(1)",
    "data:text/html,x",
    "//evil.example",
    "/\\evil.example",
    "https://a:b@example.com",
  ])
    rejects(() => safeLink(link));
  for (const url of [
    "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
    "https://example.com/embed/1",
    "javascript:foo",
  ])
    rejects(() => videoEmbed(url));
  const d = emptyDocument();
  d.body = {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "paragraph" }] }],
  };
  rejects(() => validateDocument(d));
  d.body = { type: "doc", content: [{ type: "script", text: "alert(1)" }] };
  rejects(() => validateDocument(d));
});
test("publication requires scientific review, source and media attribution", () => {
  const d = emptyDocument();
  d.title = "Un titre scientifique";
  d.summary = "Un résumé scientifique suffisamment développé.";
  d.body = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Observation et description des résultats. ".repeat(5),
          },
        ],
      },
    ],
  };
  assert.deepEqual(publicationIssues(d, "article"), ["review"]);
  assert(publicationIssues(d, "publication").includes("publication_reference"));
  d.reviewed = true;
  d.cover = {
    mediaId: "17a1a94a-e945-4eb9-8865-2b4dcbeef47a",
    alt: "",
    caption: "",
    credit: "",
    licenceUrl: "",
  };
  assert.deepEqual(publicationIssues(d, "article"), ["alt", "credit"]);
  assert.equal(documentMedia(d).length, 1);
});
test("trusted videos canonicalise to privacy-oriented click-to-load hosts", () => {
  assert.equal(
    videoEmbed("https://youtu.be/dQw4w9WgXcQ").url,
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(
    videoEmbed("https://vimeo.com/123456789").url,
    "https://player.vimeo.com/video/123456789?dnt=1",
  );
});
test("WebP dimensions and animation limits verified from bytes", () => {
  const bytes = new Uint8Array(32);
  for (const [offset, text] of [
    [0, "RIFF"],
    [8, "WEBP"],
    [12, "VP8X"],
  ] as const)
    for (let i = 0; i < text.length; i++)
      bytes[offset + i] = text.charCodeAt(i);
  bytes[24] = 99;
  bytes[27] = 49;
  assert.deepEqual(webpSize(bytes), { width: 100, height: 50 });
  bytes[20] = 2;
  rejects(() => webpSize(bytes));
  rejects(() => webpSize(new TextEncoder().encode('<svg onload="alert(1)"/>')));
});
test("video magic and slug boundaries", () => {
  rejects(() => videoMime(new Uint8Array(50)));
  assert.equal(contentSlug("ADNe : étude à Palavas !"), "adne-etude-a-palavas");
  assert.equal(safeLink("/ressources#figures"), "/ressources#figures");
});
test("validated source import keeps every original working copy within limits", async () => {
  try {
    const rows = JSON.parse(
      await Deno.readTextFile(".prerender/editorial-seed.json"),
    );
    assert.equal(rows.length, 74);
    for (const row of rows) validateDocument(row.document);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return;
    throw e;
  }
});

test("scientific table spans survive validation without shifting data columns", () => {
  const d = emptyDocument();
  d.body = {
    type: "doc",
    content: [
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                attrs: { colspan: 2, rowspan: 1 },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Population A" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const n = validateDocument(d).body.content![0].content![0].content![0];
  assert.equal(n.attrs?.colspan, 2);
  d.body.content![0].content![0].content![0].attrs = { colspan: 0, rowspan: 1 };
  rejects(() => validateDocument(d));
});

test("scientific writing structures contain headings only and cannot pass publication checks as finished text", async () => {
  const { scientificOutline, canStartStructure } =
    await import("../src/portal/editorial/writing.ts");
  for (const kind of ["article", "study", "publication"] as const) {
    for (const locale of ["fr", "en"] as const) {
      const draft = emptyDocument();
      assert(canStartStructure(draft.body));
      draft.body = scientificOutline(kind, locale);
      assert(!canStartStructure(draft.body));
      assert(
        !canStartStructure({
          type: "doc",
          content: [{ type: "figure", attrs: { mediaId: "existing-figure" } }],
        }),
      );
      assert.deepEqual(validateDocument(draft).body, draft.body);
      assert.equal(
        draft.body.content?.filter((n) => n.type === "heading").length,
        4,
      );
      assert.equal(
        draft.body.content
          ?.filter((n) => n.type === "paragraph")
          .every((n) => !n.content?.length),
        true,
      );
      assert(publicationIssues(draft, kind).includes("body"));
      assert(publicationIssues(draft, kind).includes("review"));
    }
  }
});

test("local draft recovery retains URL-only edits, validates data and requires scientific review again", async () => {
  const { readWritingRecovery } =
    await import("../src/portal/editorial/writing.ts");
  const document = emptyDocument();
  document.reviewed = true;
  const restored = readWritingRecovery(
    JSON.stringify({ document, slug: "new-address" }),
    document,
    "old-address",
  );
  assert(restored);
  assert.equal(restored.slug, "new-address");
  assert.equal(restored.document.reviewed, false);
  assert.deepEqual(restored.document.body, validateDocument(document).body);
  assert.equal(
    readWritingRecovery(
      JSON.stringify({ document, slug: "same" }),
      document,
      "same",
    ),
    null,
  );
  assert.equal(readWritingRecovery("{broken", document, "same"), null);
  assert.equal(
    readWritingRecovery(
      JSON.stringify({ document: { body: { type: "script" } }, slug: "same" }),
      document,
      "same",
    ),
    null,
  );
});
