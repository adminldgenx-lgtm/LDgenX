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
} from "../supabase/functions/_shared/editorial.ts";
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
