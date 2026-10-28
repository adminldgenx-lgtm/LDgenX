// Pictures that are not LDgenX's own, with their source and licence in data/licensed-photos.json
// (prepared by scripts/prepare-licensed-photos.mjs). Attribution for the Slack photograph is
// published in the legal notice; other third-party photos are public domain/CC0.
export const licensedPhotos: Record<
  string,
  { widths: number[]; width: number; height: number; altFr: string; altEn: string }
> = {
  'estuaire-slack': {
    widths: [480, 640, 1000, 1536, 2048],
    width: 2048,
    height: 811,
    altFr: 'L’estuaire de la Slack à Ambleteuse, entre berges de galets et dunes',
    altEn: 'The Slack estuary at Ambleteuse, between shingle banks and dunes',
  },
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

/** Kept off the project cards; the legal notice linked from every footer provides attribution. */
export const photoAttributions = [
  {
    image: 'estuaire-slack',
    title: { fr: 'La Slack à Ambleteuse', en: 'The Slack at Ambleteuse' },
    author: 'Velvet',
    authorUrl: 'https://commons.wikimedia.org/wiki/User:Velvet',
    source: 'https://commons.wikimedia.org/wiki/File:Ambleteuse_slack.jpg',
    licence: 'CC BY-SA 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    note: {
      fr: 'Photographie de 2014 utilisée pour illustrer le milieu étudié. Versions WebP et JPEG redimensionnées ; cadrage des vignettes adapté à l’écran. Aucune retouche de la scène ou des couleurs. Ces versions restent sous la même licence.',
      en: 'A 2014 photograph illustrating the study environment. Resized WebP and JPEG versions; thumbnail framing adapts to the screen. No changes to the scene or colours. These versions remain under the same licence.',
    },
  },
];
