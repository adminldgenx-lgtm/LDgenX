// Pictures added on 21 October 2026, with their source and licence in data/licensed-photos.json
// (prepared by scripts/prepare-licensed-photos.mjs). None of them shows LDgenX equipment.
export const licensedPhotos: Record<
  string,
  {
    widths: number[];
    width: number;
    height: number;
    altFr: string;
    altEn: string;
    credit?: string;
    creditEn?: string;
  }
> = {
  'eolien-en-mer': {
    widths: [640, 860, 1100, 1536],
    width: 1536,
    height: 1025,
    altFr: 'Éoliennes en mer du parc de Block Island (États-Unis), par mer formée',
    altEn: 'Offshore wind turbines of the Block Island wind farm (United States) in heavy seas',
    credit: 'U.S. Department of Energy',
  },
  'biofilm-microbien': {
    widths: [640, 860, 1100, 1536],
    width: 1536,
    height: 1060,
    altFr: 'Biofilm bactérien observé au microscope électronique à balayage',
    altEn: 'Bacterial biofilm seen under a scanning electron microscope',
    credit: 'K. A. Zacharski, CC BY 4.0, recadrée',
    creditEn: 'K. A. Zacharski, CC BY 4.0, cropped',
  },
  'terrain-kayak': {
    widths: [480, 778],
    width: 778,
    height: 1037,
    altFr: 'Sortie de terrain en kayak sur l’eau',
    altEn: 'A field outing by kayak on the water',
  },
  'bioinformatique-alignement': {
    widths: [640, 860, 1100, 1536],
    width: 1536,
    height: 1152,
    altFr:
      'Illustration : lectures de séquençage alignées sur un génome de référence, avec un variant',
    altEn: 'Illustration: sequencing reads aligned to a reference genome, with one variant',
  },
};
