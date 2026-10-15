// Widths available for each image in public/images. The illustrations (1536 × 1024 sources in
// images/generated) exist from 640 to 1536 px. Photographs published by LDgenX on ldgenx.fr
// exist only at web resolution and the team portraits at 4:5 (see docs/CONTENT-SOURCES.md):
// they are served at their own size, never enlarged.
const defaultWidths = [640, 860, 1100, 1536];
const otherWidths: Record<string, number[]> = {
  'equipe-maxime': [473],
  'terrain-prelevement': [480, 829],
  'carte-artois-picardie': [480, 970],
  'materiel-pompe': [480, 1000],
  'portrait-maeva': [480, 900],
  'portrait-emilie': [480, 900],
  'portrait-maxime': [480, 900],
  // Real photo sent by LDgenX (October 2026), cropped to 4:5; not a studio portrait.
  'portrait-damien': [480, 659],
  // Imported from the public LDgenX sites and the Artois-Picardie documents (October 2026).
  'ap-adne-chalut': [900, 1600],
  'ap-carte-stations': [900, 1600],
  'ap-diversite-locale': [900, 1600],
  'ap-diversite-regionale': [900, 1600],
  'ap-especes-elas': [900, 1600],
  'ap-especes-teleo': [900, 1600],
  'ap-guildes-chalut': [900, 1600],
  'ap-rapport-carte': [900, 1159],
  'ap-rapport-guildes': [900, 1489],
  'ap-rapport-richesse': [900, 1489],
  'ap-rapport-turbidite': [900, 1348],
  'ap-rapport-venn': [900, 1030],
  'ap-richesse-sites': [900, 1600],
  'ap-site-authie': [900, 1600],
  'ap-site-boulogne': [900, 1600],
  'ap-site-calais': [900, 1600],
  'ap-site-canche': [900, 1600],
  'ap-site-dunkerque-est': [900, 1600],
  'ap-site-dunkerque-ouest': [900, 1600],
  'ap-site-slack': [900, 1600],
  'ap-site-somme': [900, 1600],
  bluetechshow: [550, 1000],
  'cas-bar': [640, 1000],
  'cas-crevettes': [640, 1000],
  'cas-eolien-offshore': [640, 799],
  'cas-microplastiques': [640, 1000],
  'cas-oursin': [640, 1000],
  'cas-requin': [640, 1000],
  'cas-sar': [640, 1000],
  'cas-truites': [425],
  'cas-vanneau': [640, 1000],
  'fig-bar-nodavirose': [1000],
  'fig-gebv': [1000],
  'fig-omble-ancestralite': [1000],
  'fig-omble-lg26': [779],
  'fig-orb-admixture': [1000],
  'fig-orb-diversite': [679],
  'fig-orb-introductions': [698],
  'fig-puce-truite': [1000],
  'materiel-capsules': [640, 1000],
  'materiel-pompe-interieur': [640, 1000],
  'materiel-stickpump': [405],
  'materiel-torpille': [1000],
  'materiel-torpille-terrain': [480, 732],
  riviere: [640, 1000],
  // Figures of the team's CC BY articles (Recherche & publications), at their published size.
  'pub-omble-ascendance-fig2': [739],
  'pub-coho-epigenome-fig2': [709],
  'pub-truite-snp-fig1': [707],
  'pub-truite-snp-fig4': [596],
  'pub-truite-snp-fig5': [709],
  'pub-truite-carte-fig1': [757],
  'pub-truite-carte-fig3': [757],
  'pub-arc-en-ciel-fig1': [709],
  'pub-arc-en-ciel-fig3': [709],
  'pub-bar-vnn-fig1': [708],
  'pub-bar-vnn-fig2': [597],
  'pub-bar-vnn-fig4': [796],
  'pub-porc-gwas-fig1': [599],
  'pub-porc-gwas-fig2': [784],
  'pub-porc-gwas-fig3': [596],
  'pub-porc-prediction-fig1': [797],
  'pub-porc-prediction-fig2': [784],
  'terrain-palavas': [657],
};

export function imageWidths(name: string) {
  return otherWidths[name] ?? defaultWidths;
}

/** Path of an image at a given width, or at its largest one. */
export function imageUrl(name: string, width = Math.max(...imageWidths(name))) {
  return `/images/${name}-${width}.webp`;
}
