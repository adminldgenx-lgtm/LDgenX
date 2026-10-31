// Publishing must never change a page's design. Every built-in item, in both languages, goes
// through the whole path an administrator's edit takes (document, validation, publication,
// catalogue) and must render exactly the page it renders today. A new item must then land in
// the same templates and lists. Needs a finished `npm run build`. Nothing leaves this machine.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const site = await import("../.prerender/entry-server.js");
await site.ready;
const mainOf = (html) => html.match(/<main[\s\S]*<\/main>/)?.[0] ?? "";
function row(kind, locale, path, slug, legacyId, document) {
  return {
    id: randomUUID(),
    kind,
    locale,
    path,
    slug,
    groupId: randomUUID(),
    legacyId,
    status: "published",
    publishedAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    title: document.title,
    summary: document.summary,
    category: document.category,
    author: document.author,
    cover: document.cover,
    seoTitle: document.seoTitle,
    seoDescription: document.seoDescription,
    year: document.year,
    journal: document.journal,
    doi: document.doi,
    card: Object.fromEntries(
      site.cardFields[kind]
        .filter((key) => document.fields?.[key] !== undefined)
        .map((key) => [key, document.fields[key]]),
    ),
    coverMedia: null,
    document,
    media: [],
  };
}
const kinds = {
  article: "resources",
  study: "studies",
  service: "services",
  application: "applications",
  publication: "publications",
};
let checked = 0;
for (const page of site.pages) {
  const kind = page.kind in kinds ? page.kind : null;
  if (!kind) continue;
  const catalog = site.catalogs[page.locale];
  const draft = site.legacyDocument(kind, page.id, catalog);
  assert(draft, `${page.path}: no document`);
  const document = site.validateDocument({ ...draft, reviewed: true }, kind);
  assert.deepEqual(
    site.publicationIssues(document, kind),
    [],
    `${page.path}: not publishable as it stands`,
  );
  const published = row(
    kind,
    page.locale,
    page.path,
    page.path.split("/").at(-1),
    page.id,
    document,
  );
  const before = site.render(page.path);
  const after = site.render(page.path, { index: [published], document: published });
  const [was, is] = [mainOf(before.html), mainOf(after.html)];
  if (was !== is) {
    let at = 0;
    while (was[at] === is[at]) at++;
    assert.fail(
      `${page.path}: the template changed\n  before ${was.slice(at - 80, at + 120)}\n  after  ${is.slice(at - 80, at + 120)}`,
    );
  }
  assert(after.head.includes('type="application/ld+json"'), page.path);
  checked++;
}
console.log(`Passed: ${checked} built-in items publish to exactly the same page.`);

// New items of every kind, in the templates and lists of the site.
const cover = {
  staticSrc: "/images/riviere-1000.webp",
  alt: "Une rivière",
  caption: "",
  credit: "",
  licenceUrl: "",
};
const base = {
  title: "Un titre de contrôle",
  summary: "Une introduction de contrôle pour ce contenu nouveau.",
  category: "Contrôle",
  author: "LDgenX",
  seoTitle: "",
  seoDescription: "",
  cover,
  body: { type: "doc", content: [{ type: "paragraph" }] },
  references: [],
  doi: "",
  journal: "",
  year: "",
  reviewed: true,
};
const fresh = [
  {
    kind: "study",
    path: "/etudes-de-cas/etude-de-controle",
    list: "/etudes-de-cas",
    fields: {
      facts: [{ label: "Site", value: "Étang de contrôle" }],
      context: "Le contexte de contrôle.",
      question: "La question de contrôle ?",
      approach: "L’approche de contrôle.",
      result: "",
      service: "bioinformatique",
      source: "",
      ongoing: true,
    },
    marks: ["case-steps", "study-facts", "Le contexte de contrôle."],
  },
  {
    kind: "article",
    path: "/ressources/article-de-controle",
    list: "/ressources",
    body: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Une partie de contrôle" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Un texte assez long pour être publié. ".repeat(4) },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Un point de contrôle" }],
                },
              ],
            },
          ],
        },
      ],
    },
    fields: { service: "" },
    marks: ["article-layout", "article-aside", "Une partie de contrôle", "Un point de contrôle"],
  },
  {
    kind: "service",
    path: "/services/expertise-de-controle",
    list: "/services",
    fields: {
      headline: "Une expertise de contrôle.",
      short: "Une description courte.",
      scope: "Une ligne.",
      need: "Un besoin de contrôle.",
      approaches: [{ title: "Une méthode", text: "Son texte." }],
      prestations: ["Une prestation"],
      uses: ["Un usage"],
      sectors: ["aquaculture-peche"],
      cases: [],
    },
    marks: ["approach-layout", "use-section", "Un besoin de contrôle."],
  },
  {
    kind: "application",
    path: "/applications/application-de-controle",
    list: "/applications",
    fields: {
      headline: "Une application de contrôle.",
      scope: "Une ligne.",
      needs: [{ title: "Un besoin", text: "Son texte." }],
      uses: ["Un usage"],
      examples: [],
      approaches: [],
      deliverables: [],
      services: ["bioinformatique"],
    },
    marks: ["approach-layout", "Un besoin"],
  },
  {
    kind: "publication",
    path: "/recherche/publication-de-controle",
    list: "/recherche",
    cover: null,
    extra: { doi: "10.1234/controle", journal: "Revue de contrôle", year: "2026" },
    fields: {
      authors: ["Leitwein M", "Autre A"],
      members: ["maeva-leitwein"],
      authorNote: "",
      issue: "1, 2-3",
      online: "",
      type: "article",
      text: "published",
      licence: "CC BY 4.0",
      question: "La question ?",
      approach: "L’approche.",
      finding: "Le résultat.",
      limit: "La limite.",
      themes: [],
      services: ["bioinformatique"],
      applications: [],
      preprint: "",
      links: [],
      figures: [],
    },
    marks: ["publication-hero", "publication-points", "Revue de contrôle"],
  },
];
for (const item of fresh) {
  const document = site.validateDocument(
    {
      ...base,
      ...(item.cover === null ? { cover: null } : {}),
      ...item.extra,
      ...(item.body ? { body: item.body } : {}),
      fields: item.fields,
    },
    item.kind,
  );
  assert.deepEqual(
    site.publicationIssues(document, item.kind),
    [],
    `${item.kind}: not publishable`,
  );
  const published = row(
    item.kind,
    "fr",
    item.path,
    item.path.split("/").at(-1),
    null,
    document,
  );
  const page = site.render(item.path, { index: [published], document: published });
  for (const mark of item.marks)
    assert(page.html.includes(mark), `${item.kind}: "${mark}" is missing from its page`);
  assert(!page.html.includes("cms-document"), `${item.kind}: generic layout`);
  const schema = JSON.parse(
    page.head.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  assert(
    schema["@graph"].some((n) =>
      ["Article", "Service", "ScholarlyArticle", "WebPage"].includes(n["@type"]),
    ),
    `${item.kind}: structured data`,
  );
  assert(page.head.includes(`https://www.ldgenx.fr${item.path}`), `${item.kind}: canonical`);
  if (item.kind === "publication") {
    const paper = schema["@graph"].find((n) => n["@type"] === "ScholarlyArticle");
    assert.equal(paper.identifier.value, "10.1234/controle");
    assert.equal(paper.author.length, 2);
  }
  const list = site.render(item.list, { index: [published], document: null });
  assert(
    list.html.includes(item.path),
    `${item.kind}: not linked from ${item.list}`,
  );
  assert(!list.html.includes("cms-card"), `${item.kind}: generic card`);
}
console.log(`Passed: ${fresh.length} new kinds of content in the site's own templates and lists.`);

// Taking any item off the site must leave every other page standing.
for (const page of site.pages.filter((p) => p.kind in kinds)) {
  const withdrawn = {
    ...row(page.kind, page.locale, page.path, page.path.split("/").at(-1), page.id, {
      title: "",
      summary: "",
      category: "",
      author: "",
      cover: null,
      seoTitle: "",
      seoDescription: "",
      year: "",
      journal: "",
      doi: "",
      fields: {},
    }),
    status: "withdrawn",
    document: undefined,
  };
  for (const other of [
    page.locale === "fr" ? "/" : "/en",
    page.locale === "fr" ? "/services" : "/en/services",
    page.locale === "fr" ? "/applications" : "/en/applications",
    page.locale === "fr" ? "/etudes-de-cas" : "/en/case-studies",
    page.locale === "fr" ? "/recherche" : "/en/research",
    page.locale === "fr" ? "/ressources" : "/en/resources",
    page.locale === "fr" ? "/plan-du-site" : "/en/site-map",
  ]) {
    const result = site.render(other, { index: [withdrawn], document: null });
    assert(result.html.length > 1000, `${other} without ${page.path}`);
    if (other !== page.path)
      assert(
        !mainOf(result.html).includes(`href="${page.path}"`),
        `${other} still links to withdrawn ${page.path}`,
      );
  }
}
console.log("Passed: every item can leave the site without breaking the others.");
