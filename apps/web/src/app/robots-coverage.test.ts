import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The root layout is `index, follow`, so every page inherits "indexable" unless it opts out.
 * Each page must therefore either make an explicit robots decision in its own source
 * (`robots` in metadata, or `pageMetadata(..., { index: false })`), or be on the allowlist
 * of pages that are intentionally indexable.
 */
const INTENTIONALLY_INDEXABLE: Record<string, string> = {
  '/': 'only redirects to /events',
  '/privacy': 'public legal page, listed in the sitemap',
  '/terms': 'public legal page, listed in the sitemap',
  '/clubs': 'public clubs directory, listed in the sitemap',
  '/clubs/[id]': 'indexes public clubs only; stubs/private clubs return index: false',
};

const APP_DIR = __dirname;

function findPages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findPages(full);
    return entry.name === 'page.tsx' ? [full] : [];
  });
}

// "(shell)/clubs/%5F%5Fx/page.tsx" -> "/clubs/__x" (route groups dropped, %XX decoded)
function routeOf(file: string): string {
  const segments = relative(APP_DIR, file).split(sep).slice(0, -1);
  const route = segments.filter((s) => !/^\(.*\)$/.test(s)).map(decodeURIComponent).join('/');
  return `/${route}`;
}

const makesRobotsDecision = (src: string) => /\brobots\b/.test(src) || /\bindex:\s*(false|true)\b/.test(src);

describe('robots coverage', () => {
  const pages = findPages(APP_DIR);

  it('finds the pages', () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  it.each(pages.map((file) => [relative(APP_DIR, file), file]))('%s sets robots or is allowlisted', (rel, file) => {
    const route = routeOf(file);
    const allowed = route in INTENTIONALLY_INDEXABLE;
    const decided = makesRobotsDecision(readFileSync(file, 'utf8'));
    expect(
      allowed || decided,
      `${rel} (${route}) inherits the indexable root robots. Add \`robots: { index: false }\` / ` +
        '`pageMetadata(..., { index: false })`, or add it to INTENTIONALLY_INDEXABLE with a reason.',
    ).toBe(true);
  });

  it('keeps the allowlist free of stale routes', () => {
    const routes = new Set(pages.map(routeOf));
    expect(Object.keys(INTENTIONALLY_INDEXABLE).filter((r) => !routes.has(r))).toEqual([]);
  });
});
