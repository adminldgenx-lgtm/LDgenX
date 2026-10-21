// Prepares the photographs whose source and licence are recorded in data/licensed-photos.json,
// and draws the read-alignment illustration used for the bioinformatics expertise. Each image is
// written as WebP variants into public/images, through a browser canvas (no image library in
// the site's dependencies).
//
// Usage: LDGENX_PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node scripts/prepare-licensed-photos.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulePath = process.env.LDGENX_PLAYWRIGHT_MODULE;
if (!modulePath)
  throw new Error('Set LDGENX_PLAYWRIGHT_MODULE to an installed Playwright package.');
const { chromium } = createRequire(import.meta.url)(modulePath);
const manifest = JSON.parse(readFileSync(path.join(root, 'data/licensed-photos.json'), 'utf8'));

/** Sequencing reads stacked on a reference, one position carrying a variant: the view a
 *  bioinformatician works in. Drawn from a fixed seed, so every build gives the same image. */
function alignmentSvg(width = 1600, height = 1200) {
  let seed = 20261021;
  const random = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const bases = ['A', 'C', 'G', 'T'];
  const colour = { A: '#8cc63f', C: '#5fb3e6', G: '#f0b429', T: '#ee6b55' };
  const columns = 38;
  const left = 82;
  const cell = (width - left * 2) / columns;
  const reference = Array.from({ length: columns }, () => bases[Math.floor(random() * 4)]);
  const variant = 21;
  reference[variant] = 'C';
  const parts = [`<rect width="${width}" height="${height}" fill="#05213c"/>`];
  // The variant column, highlighted from the coverage down.
  parts.push(
    `<rect x="${left + variant * cell}" y="96" width="${cell}" height="${height - 150}" fill="#f0b429" opacity="0.1" rx="6"/>`,
  );
  // Coverage: a smooth walk, one bar per column.
  let depth = 0.55;
  for (let c = 0; c < columns; c++) {
    depth = Math.min(0.95, Math.max(0.3, depth + (random() - 0.5) * 0.16));
    const h = 150 * depth;
    parts.push(
      `<rect x="${left + c * cell + 3}" y="${250 - h}" width="${cell - 6}" height="${h}" rx="3" fill="#8cc63f" opacity="${c === variant ? 0.95 : 0.42}"/>`,
    );
  }
  // The reference sequence.
  reference.forEach((b, c) =>
    parts.push(
      `<text x="${left + c * cell + cell / 2}" y="318" text-anchor="middle" font-family="Menlo, ui-monospace, monospace" font-size="27" font-weight="700" fill="${colour[b]}">${b}</text>`,
    ),
  );
  parts.push(
    `<line x1="${left}" x2="${width - left}" y1="342" y2="342" stroke="#d6e2f0" stroke-opacity="0.25" stroke-width="2"/>`,
  );
  // Reads: one or two per row, at random places; mismatches shown as letters, as in a viewer.
  let carrying = 0;
  for (let row = 0; row < 17; row++) {
    const y = 372 + row * 46;
    let start = Math.floor(random() * 8);
    while (start < columns - 6) {
      const length = 10 + Math.floor(random() * 16);
      const end = Math.min(columns, start + length);
      const x = left + start * cell + 2;
      const w = (end - start) * cell - 4;
      const forward = random() > 0.5;
      parts.push(
        `<rect x="${x}" y="${y}" width="${w}" height="28" rx="7" fill="#d6e2f0" fill-opacity="0.14" stroke="#d6e2f0" stroke-opacity="0.32"/>`,
      );
      parts.push(
        forward
          ? `<path d="M${x + w - 2} ${y + 6} l10 8 -10 8z" fill="#d6e2f0" fill-opacity="0.45"/>`
          : `<path d="M${x + 2} ${y + 6} l-10 8 10 8z" fill="#d6e2f0" fill-opacity="0.45"/>`,
      );
      if (start <= variant && variant < end) {
        // About half of the reads over the variant carry the alternative base; as in a
        // viewer, bases that match the reference are not written.
        if (carrying++ % 2 === 0)
          parts.push(
            `<text x="${left + variant * cell + cell / 2}" y="${y + 21}" text-anchor="middle" font-family="Menlo, ui-monospace, monospace" font-size="21" font-weight="700" fill="${colour.T}">T</text>`,
          );
      }
      // A rare sequencing error, elsewhere on the read.
      if (random() > 0.72) {
        const c = start + 1 + Math.floor(random() * Math.max(1, end - start - 2));
        if (c !== variant) {
          const b = bases.filter((x) => x !== reference[c])[Math.floor(random() * 3)];
          parts.push(
            `<text x="${left + c * cell + cell / 2}" y="${y + 21}" text-anchor="middle" font-family="Menlo, ui-monospace, monospace" font-size="19" font-weight="700" fill="${colour[b]}" opacity="0.55">${b}</text>`,
          );
        }
      }
      start = end + 2 + Math.floor(random() * 6);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}</svg>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();
for (const photo of manifest.photos) {
  const source =
    photo.kind === 'illustration'
      ? `data:image/svg+xml;base64,${Buffer.from(alignmentSvg()).toString('base64')}`
      : `data:image/jpeg;base64,${readFileSync(path.join(root, photo.sourceFile)).toString('base64')}`;
  for (const width of photo.widths) {
    const url = await page.evaluate(
      async ({ source, crop, width }) => {
        const img = new Image();
        img.src = source;
        await img.decode();
        const [x, y, w, h] = crop ?? [0, 0, img.naturalWidth, img.naturalHeight];
        const height = Math.round((width * h) / w);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.imageSmoothingQuality = 'high';
        context.drawImage(img, x, y, w, h, 0, 0, width, height);
        return canvas.toDataURL('image/webp', 0.84);
      },
      { source, crop: photo.crop, width },
    );
    writeFileSync(
      path.join(root, 'public/images', `${photo.name}-${width}.webp`),
      Buffer.from(url.split(',')[1], 'base64'),
    );
  }
  console.log(`${photo.name}: ${photo.widths.join(', ')}`);
}
await browser.close();
