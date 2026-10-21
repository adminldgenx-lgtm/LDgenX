// Everything the English site says, with the same shape as the French catalogue. The terms of
// sale are published in French only: the English catalogue carries the French text.
import type { Catalog } from './catalog';
import * as core from './en';
import { pageCopy, contactPaths, formCopy } from './pages.en';
import { visualCopy } from './visuals.en';
import {
  works,
  people,
  equipment,
  partnerIntro,
  companyStory,
  news,
  booking,
  artoisPicardie,
  customAssay,
  erc,
} from './extra.en';
import { cgv } from './cgv.fr';
import { ui } from './ui.en';
import { research } from './research.en';
import { knowledge, cir, samplingKits } from './knowledge.en';
import { routeSources } from './site';

export const en: Catalog = {
  ...core,
  pageCopy,
  contactPaths,
  formCopy,
  visualCopy,
  works,
  people,
  equipment,
  partnerIntro,
  companyStory,
  news,
  booking,
  artoisPicardie,
  customAssay,
  erc,
  cgv,
  research,
  /** Addresses of the publication pages (see content/site.ts). */
  publications: routeSources.en.publications,
  knowledge,
  cir,
  samplingKits,
  ui,
};
