// Pictures that are not LDgenX's own, with their source and licence in data/licensed-photos.json
// (prepared by scripts/prepare-licensed-photos.mjs). All are in the public domain or under CC0,
// so none needs a credit. None of them shows LDgenX equipment.
export const licensedPhotos: Record<
  string,
  { widths: number[]; width: number; height: number; altFr: string; altEn: string }
> = {
  'eolien-en-mer': {
    widths: [640, 860, 1100, 1536],
    width: 1536,
    height: 1025,
    altFr: 'Éoliennes en mer du parc de Block Island (États-Unis), par mer formée',
    altEn: 'Offshore wind turbines of the Block Island wind farm (United States) in heavy seas',
  },
  'biofilm-microbien': {
    widths: [640, 860, 1100, 1536],
    width: 1536,
    height: 1052,
    altFr: 'Biofilm bactérien observé au microscope électronique à balayage',
    altEn: 'Bacterial biofilm seen under a scanning electron microscope',
  },
  'terrain-kayak': {
    widths: [480, 778],
    width: 778,
    height: 1037,
    altFr: 'Sortie de terrain en kayak sur l’eau',
    altEn: 'A field outing by kayak on the water',
  },
  'vison-europe': {
    widths: [640, 860, 1100, 1488],
    width: 1488,
    height: 992,
    altFr: 'Vison d’Europe au pelage mouillé, au sol',
    altEn: 'European mink with wet fur, on the ground',
  },
  'ours-brun': {
    widths: [640, 860, 1100, 1536, 2048],
    width: 2048,
    height: 1365,
    altFr: 'Ours brun traversant une clairière en forêt, dans les Carpates',
    altEn: 'Brown bear crossing a forest clearing in the Carpathians',
  },
  'estuaire-gironde': {
    widths: [640, 860, 1100, 1536, 2048],
    width: 2048,
    height: 1365,
    altFr:
      'L’embouchure de l’estuaire de la Gironde vue de la Station spatiale internationale, aux eaux chargées de sédiments',
    altEn:
      'The mouth of the Gironde estuary seen from the International Space Station, its waters laden with sediment',
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
