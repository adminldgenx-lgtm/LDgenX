import type {
  ContentKind,
  ContentLocale,
} from "../../../supabase/functions/_shared/editorial";

type Words = [fr: string, en: string];

/** The sections of the website, each with its own management page. */
export interface SiteSection {
  id: string;
  kind: ContentKind;
  name: Words;
  /** How the rest of the screen speaks of one item. */
  item: Words;
  add: Words;
  text: Words;
  /** Where its items are listed on the website. */
  page: Record<ContentLocale, string>;
}
export const siteSections: SiteSection[] = [
  {
    id: "expertises",
    kind: "service",
    name: ["Expertises", "Expertise"],
    item: ["cette expertise", "this expertise"],
    add: ["Ajouter une expertise", "Add an expertise"],
    text: [
      "Les pages de vos services, du menu Expertises à leur présentation complète.",
      "Your service pages, from the Expertise menu to their full presentation.",
    ],
    page: { fr: "/services", en: "/en/services" },
  },
  {
    id: "applications",
    kind: "application",
    name: ["Applications", "Applications"],
    item: ["cette application", "this application"],
    add: ["Ajouter une application", "Add an application"],
    text: [
      "Les secteurs où vos analyses s’appliquent : biodiversité, aquaculture, agriculture…",
      "The sectors your analyses serve: biodiversity, aquaculture, agriculture…",
    ],
    page: { fr: "/applications", en: "/en/applications" },
  },
  {
    id: "etudes-de-cas",
    kind: "study",
    name: ["Études de cas", "Case studies"],
    item: ["cette étude de cas", "this case study"],
    add: ["Ajouter une étude de cas", "Add a case study"],
    text: [
      "Vos projets réels : contexte, question, approche et enseignements.",
      "Your real projects: context, question, approach and lessons.",
    ],
    page: { fr: "/etudes-de-cas", en: "/en/case-studies" },
  },
  {
    id: "publications",
    kind: "publication",
    name: ["Publications", "Publications"],
    item: ["cette publication", "this publication"],
    add: ["Ajouter une publication", "Add a publication"],
    text: [
      "Les articles scientifiques de l’équipe, chacun avec sa page et son résumé.",
      "The team’s scientific papers, each with its own page and summary.",
    ],
    page: { fr: "/recherche", en: "/en/research" },
  },
  {
    id: "ressources",
    kind: "article",
    name: ["Ressources", "Resources"],
    item: ["cet article", "this article"],
    add: ["Écrire un article", "Write an article"],
    text: [
      "Vos articles et guides, avec leur sommaire automatique.",
      "Your articles and guides, with their automatic table of contents.",
    ],
    page: { fr: "/ressources", en: "/en/resources" },
  },
];
export const sectionOfKind = (kind: ContentKind) =>
  siteSections.find((section) => section.kind === kind);
