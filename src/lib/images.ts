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
};

export function imageWidths(name: string) {
  return otherWidths[name] ?? defaultWidths;
}

/** Path of an image at a given width, or at its largest one. */
export function imageUrl(name: string, width = Math.max(...imageWidths(name))) {
  return `/images/${name}-${width}.webp`;
}
