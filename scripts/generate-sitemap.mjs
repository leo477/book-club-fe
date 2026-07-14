/**
 * Generates a strict sitemap.xml into the production build output.
 *
 * Runs as the npm `postbuild` hook (after `ng build`), overwriting the
 * static copy that Angular copies from public/ so every deploy ships a
 * fresh <lastmod> and the sitemap can never intersect with the SPA HTML.
 *
 * Public clubs are fetched from the backend so each /clubs/{id} page is
 * indexable; any fetch failure degrades to static routes only (exit 0).
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://book-club-planer.vercel.app';
const API_URL = process.env.SITEMAP_API_URL ?? 'https://book-club-be.onrender.com/api/v1';
const OUTPUT_DIR = './dist/book-club-fe/browser';

const ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/clubs', changefreq: 'daily', priority: '0.8' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
];

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchPublicClubs() {
  try {
    const res = await fetch(`${API_URL}/clubs`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      throw new Error(`GET /clubs responded ${res.status}`);
    }
    const clubs = await res.json();
    if (!Array.isArray(clubs)) {
      throw new Error('GET /clubs returned a non-array payload');
    }
    return clubs.filter(c => c.isPublic && c.id);
  } catch (err) {
    console.warn(`  ⚠️ Failed to fetch clubs for sitemap (${err.message}) — emitting static routes only.`);
    return [];
  }
}

if (!existsSync(OUTPUT_DIR)) {
  console.error(`Output directory ${OUTPUT_DIR} not found — run ng build first.`);
  process.exit(1);
}

const lastmod = new Date().toISOString().slice(0, 10);
const clubs = await fetchPublicClubs();

const staticUrls = ROUTES.map(
  ({ path, changefreq, priority }) =>
    `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
);

const clubUrls = clubs.map(club => {
  const clubLastmod = (club.createdAt ?? '').slice(0, 10) || lastmod;
  return `  <url><loc>${escapeXml(`${SITE_URL}/clubs/${club.id}`)}</loc><lastmod>${clubLastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticUrls,
  ...clubUrls,
  '</urlset>',
  '',
].join('\n');

const outputPath = join(OUTPUT_DIR, 'sitemap.xml');
writeFileSync(outputPath, xml, 'utf8');
console.log(`  ✅ Wrote ${outputPath} (${ROUTES.length} static + ${clubUrls.length} club URLs, lastmod ${lastmod})`);
