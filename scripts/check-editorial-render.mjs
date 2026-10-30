import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const site = await import("../.prerender/entry-server.js");
await site.ready;
const seed = JSON.parse(
  await readFile(".prerender/editorial-seed.json", "utf8"),
);
let count = 0;
for (const locale of ["fr", "en"]) {
  const draft = seed.find(
    (e) =>
      e.kind === "publication" &&
      e.locale === locale &&
      e.document.year === "2021",
  );
  const path = site.pages.find(
    (p) =>
      p.kind === "publication" &&
      p.locale === locale &&
      p.id === draft.legacyId,
  ).path;
  const summary = {
    ...draft,
    ...draft.document,
    path,
    status: "published",
    publishedAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
    media: [],
  };
  const result = site.render(path, { index: [summary], document: summary });
  assert(
    result.html.includes(
      locale === "fr"
        ? "Résumé de publication scientifique"
        : "Scientific publication summary",
    ),
  );
  assert(
    result.html.includes(
      locale === "fr" ? "Résumé mis à jour le" : "Summary updated on",
    ),
  );
  assert(result.html.includes("2021"));
  const graph = JSON.parse(
    result.head.match(
      /<script id="ldgenx-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/,
    )[1],
  );
  const article = graph["@graph"].find((n) => n["@type"] === "Article");
  assert.equal(article.author[0]["@type"], "Organization");
  assert.equal(article.about["@type"], "ScholarlyArticle");
  assert.equal(article.about.identifier.value, draft.document.doi);
  assert.equal(
    article.about.author.length,
    draft.document.author.split(";").length,
  );
  count++;
}
console.log(
  `Editorial scientific rendering: ${count} languages preserve the paper's reference/year and distinguish the summary's date/authorship.`,
);
