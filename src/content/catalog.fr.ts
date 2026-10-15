// Everything the French site says, gathered in one catalogue. The English catalogue has the
// same shape (see catalog.en.ts).
import * as core from './fr';
import { pageCopy, contactPaths, formCopy } from './pages.fr';
import { visualCopy } from './visuals.fr';
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
} from './extra.fr';
import { cgv } from './cgv.fr';
import { ui } from './ui.fr';
import { research } from './research.fr';

export const fr = {
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
  ui,
};
