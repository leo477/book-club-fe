/**
 * Generates a strict sitemap.xml into the production build output.
 *
 * Runs as the npm `postbuild` hook (after `ng build`), overwriting the
 * static copy that Angular copies from public/ so every deploy ships a
 * fresh <lastmod> and the sitemap can never intersect with the SPA HTML.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://book-club-planer.vercel.app';
const OUTPUT_DIR = './dist/book-club-fe/browser';

const ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
];

if (!existsSync(OUTPUT_DIR)) {
  console.error(`Output directory ${OUTPUT_DIR} not found — run ng build first.`);
  process.exit(1);
}

const lastmod = new Date().toISOString().slice(0, 10);

const urls = ROUTES.map(
  ({ path, changefreq, priority }) =>
    `  <url><loc>${SITE_URL}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n');

const outputPath = join(OUTPUT_DIR, 'sitemap.xml');
writeFileSync(outputPath, xml, 'utf8');
console.log(`  ✅ Wrote ${outputPath} (${ROUTES.length} URLs, lastmod ${lastmod})`);
