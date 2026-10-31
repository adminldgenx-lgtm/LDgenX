// The site's logo files, all drawn from logos/authentic/ldgenx-logo.svg: the client's original
// logo (logos/correct logo/logo_ldgenx.png), traced in its three colours on a transparent ground.
// The favicons are separate and stay as they are.
//
// Usage: node scripts/build-brand.mjs
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const master = await readFile('logos/authentic/ldgenx-logo.svg', 'utf8');
const group = (id) => {
  const start = master.indexOf(`<g id="${id}"`);
  if (start < 0) throw new Error(`Missing group ${id}`);
  return master.slice(master.indexOf('>', start) + 1, master.indexOf('</g>', start));
};
// Bounds of each part in the traced drawing.
const symbol = { x: 312, y: 104, width: 449, height: 442 };
const wordmark = { x: 395, y: 562, width: 275, height: 73 };
const NAVY = '#0e2f52';
const LIGHT = '#f5f7f3';

// The horizontal version used in the header: same 570 × 160 frame as before, so the layout holds.
function lockup(ink) {
  const fit = 156 / symbol.height;
  const size = 384 / wordmark.width;
  const paint = (paths) => paths.replaceAll(NAVY, ink);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="570" height="160" viewBox="0 0 570 160"><title>LDgenX</title><g transform="translate(${(1 - symbol.x * fit).toFixed(2)} ${(2 - symbol.y * fit).toFixed(2)}) scale(${fit.toFixed(5)})">${paint(group('symbol'))}</g><g transform="translate(${(185 - wordmark.x * size).toFixed(2)} ${(29 - wordmark.y * size).toFixed(2)}) scale(${size.toFixed(5)})">${paint(group('wordmark'))}</g></svg>\n`;
}

await writeFile('public/brand/logo.svg', master);
await writeFile('public/brand/lockup-navy.svg', lockup(NAVY));
await writeFile('public/brand/lockup-light.svg', lockup(LIGHT));
// Read by search engines for the organisation's logo (structured data).
await sharp(Buffer.from(master), { density: 300 })
  .resize({ width: 1200 })
  .png({ compressionLevel: 9, palette: true, quality: 100 })
  .toFile('public/brand/full.png');
console.log('Brand files written from the authentic logo.');
