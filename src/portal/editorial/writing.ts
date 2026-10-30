import type {
  ContentKind,
  ContentLocale,
  ContentNode,
  EditorialDocument,
} from "../../../supabase/functions/_shared/editorial";

import { validateDocument } from "../../../supabase/functions/_shared/editorial";

const sections: Record<ContentKind, Record<ContentLocale, string[]>> = {
  article: {
    fr: ["Contexte", "Approche", "Enseignements", "Limites et sources"],
    en: ["Context", "Approach", "Insights", "Limitations and sources"],
  },
  study: {
    fr: [
      "Contexte et objectifs",
      "Méthodes",
      "Résultats",
      "Interprétation et limites",
    ],
    en: [
      "Context and objectives",
      "Methods",
      "Results",
      "Interpretation and limitations",
    ],
  },
  publication: {
    fr: ["Question de recherche", "Approche", "Résultats", "Limites et portée"],
    en: ["Research question", "Approach", "Results", "Limitations and scope"],
  },
};

/** Empty headings only: authors supply all scientific statements and references. */
export function scientificOutline(
  kind: ContentKind,
  locale: ContentLocale,
): ContentNode {
  return {
    type: "doc",
    content: sections[kind][locale].flatMap((text) => [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text }],
      },
      { type: "paragraph", content: [] },
    ]),
  };
}

export function outlineLabels(kind: ContentKind, locale: ContentLocale) {
  return sections[kind][locale];
}

export function canStartStructure(body: ContentNode) {
  return (body.content ?? []).every(
    (node) => node.type === "paragraph" && !node.content?.length && !node.text,
  );
}

/** Recover content and URL edits, but require a fresh scientific review. */
export function readWritingRecovery(
  raw: string | null,
  saved: EditorialDocument,
  slug: string,
) {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value.slug !== "string" || value.slug.length > 200)
      return null;
    const document = validateDocument(value.document);
    if (
      JSON.stringify(document) === JSON.stringify(validateDocument(saved)) &&
      value.slug === slug
    )
      return null;
    return {
      document: { ...document, reviewed: false },
      slug: value.slug as string,
    };
  } catch {
    return null;
  }
}
