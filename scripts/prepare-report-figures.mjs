// Writes the WebP versions of the case-study report figures listed in data/report-figures.json,
// through a browser canvas (no image library in the site's dependencies).
//
// Usage: LDGENX_PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node scripts/prepare-report-figures.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulePath = process.env.LDGENX_PLAYWRIGHT_MODULE;
if (!modulePath)
  throw new Error('Set LDGENX_PLAYWRIGHT_MODULE to an installed Playwright package.');
const { chromium } = createRequire(import.meta.url)(modulePath);
const manifest = JSON.parse(readFileSync(path.join(root, 'data/report-figures.json'), 'utf8'));

const browser = await chromium.launch();
const page = await browser.newPage();
for (const figure of manifest.figures) {
  const source = `data:image/png;base64,${readFileSync(path.join(root, figure.sourceFile)).toString('base64')}`;
  for (const width of figure.widths) {
    const url = await page.evaluate(
      async ({ source, width }) => {
        const img = new Image();
        img.src = source;
        await img.decode();
        const height = Math.round((width * img.naturalHeight) / img.naturalWidth);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.imageSmoothingQuality = 'high';
        context.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/webp', 0.9);
      },
      { source, width },
    );
    writeFileSync(
      path.join(root, 'public/images', `${figure.name}-${width}.webp`),
      Buffer.from(url.split(',')[1], 'base64'),
    );
  }
  console.log(`${figure.name}: ${figure.widths.join(', ')}`);
}
await browser.close();
