// Shapes shared by the French and English catalogues. Every entity carries an `id` that is the
// same in both languages (the French slug), so pages can be paired across languages; `slug` is
// the address in the catalogue's own language.

/** A link inside the site, resolved to the right address in each language. */
export type InternalLink =
  | { kind: 'service' | 'application' | 'study' | 'work' | 'innovation' | 'person'; id: string }
  | { kind: 'external'; href: string };

/** A case or subject shown on an expertise page, as published on ldgenx.fr. */
export interface CaseRef {
  title: string;
  image?: string;
  link?: InternalLink;
}

/** One section of a scientific write-up: paragraphs (with [links](url) and *italics*) and an
 *  optional figure with its caption and legend, as published. */
export interface WorkSection {
  title: string;
  paragraphs: string[];
  figure?: {
    image: string;
    alt: string;
    caption: string;
    legend: string;
  };
}

export interface Work {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** One sentence for cards, built from the section titles. */
  summary: string;
  image: string;
  sections: WorkSection[];
  facts: { label: string; value: string }[];
  service: string;
  source: string;
}

export interface Person {
  id: string;
  /** Address of the profile page; empty when the person has no page of their own. */
  slug: string;
  name: string;
  role: string;
  title: string;
  initials: string;
  photo: string;
  service: string;
  bio: string;
  biography: string[];
  source: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  summary: string;
  specs: string[];
  prices: { label: string; amount: number }[];
  images: { name: string; alt: string }[];
}

export interface PartnerMember {
  name: string;
  logo: string;
}

export interface StudySector {
  name: string;
  date: string;
  mode: string;
  /** Salinity (PSU), turbidity (NTU) and mean filtered volume (L), as recorded on site. */
  salinity: string;
  turbidity: string;
  volume: string;
  /** Species richness of the sector, as given in the final report. */
  richness: number;
  richnessNote?: string;
}

export interface StudySiteRecord {
  id: string;
  name: string;
  setting: 'port' | 'baie' | 'estuaire';
  area: string;
  sectors: StudySector[];
  synthesis: string;
  figure: string;
}

/** A figure of a published article, reproduced unchanged under its licence. */
export interface ResearchFigure {
  image: string;
  label: string;
  /** The original caption, in the article's language. */
  caption: string;
  credit: string;
  licence: string;
  width: number;
  height: number;
}

/** An article co-written by a member of the team (Recherche & publications). */
export interface ResearchPublication {
  /** Address in the catalogue (?publication=), the same in every language. */
  id: string;
  /** A reading title in the page's language; never a substitute for the bibliographic title. */
  readingTitle: string;
  /** The exact title of the published article. */
  title: string;
  authors: string[];
  /** Team members among the authors (person ids). */
  members: string[];
  /** Author note as published (e.g. equal contribution). */
  authorNote?: string;
  journal: string;
  year: number;
  /** Volume, issue and pages or article number, as published. */
  issue: string;
  /** First online publication, when it falls in an earlier year than the issue (ISO date). */
  online?: string;
  type: 'article' | 'review';
  doi: string;
  preprint?: string;
  links: { label: string; url: string }[];
  /** The version of the text consulted for this summary. */
  text: 'published' | 'preprint' | 'abstract';
  /** Licence of the article; figures are reproduced only under CC BY. */
  licence: string;
  themes: string[];
  services: string[];
  summary: string;
  question: string;
  approach: string;
  finding: string;
  limit: string;
  figures: ResearchFigure[];
}

/** A chart drawn from values stated in a published abstract. */
export type ResearchChart =
  | { kind: 'panel'; total: number; selected: number }
  | {
      kind: 'survival';
      groups: { label: string; susceptible: number; resistant: number }[];
    }
  | { kind: 'regions'; bars: { label: string; value: number }[]; shared: number; common: number };

/** One of the three topics put forward on the research page. */
export interface ResearchFeatured {
  publication: string;
  theme: string;
  label: string;
  species: string;
  steps: { value: string; label: string }[];
  chart: ResearchChart;
  chartTitle: string;
  chartNote: string;
}

/** An organism for which LDgenX presents a targeted DNA assay. Only documented facts: a status
 *  appears only when LDgenX has published one. */
export interface AssayTarget {
  id: string;
  name: string;
  latin?: string;
  /** A group of species rather than one species. */
  group?: boolean;
  image?: string;
  status?: string;
  /** Where LDgenX presents it. */
  source: string;
}

/** The custom targeted-assay module (primers, probe, dPCR). */
export interface CustomAssay {
  anchor: string;
  eyebrow: string;
  title: string;
  intro: string;
  steps: { title: string; text: string }[];
  stepsLabel: string;
  stage: {
    target: string;
    related: string;
    primers: string;
    probe: string;
    partitions: string;
    yourSpecies: string;
  };
  quantNote: string;
  illustration: string;
  targetsLabel: string;
  targets: AssayTarget[];
  otherTitle: string;
  otherText: string;
  otherAction: string;
  play: string;
  pause: string;
  home: { eyebrow: string; title: string; text: string; link: string };
}
