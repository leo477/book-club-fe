// @vitest-environment node
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { manifest } from './routes';

const appDir = fileURLToPath(new URL('../app', import.meta.url));
const IGNORED = new Set(['strangler.json', '_not-found']);

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return pages(full);
    return /^page\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe('strangler manifest coverage', () => {
  it('lists every page under src/app', () => {
    const patterns = new Set(manifest.map((route) => route.pattern));
    const found = pages(appDir)
      .map((file) => relative(appDir, join(file, '..')).split(sep))
      .filter((segments) => !segments.some((s) => IGNORED.has(s)))
      .map((segments) => '/' + segments.map((s) => decodeURIComponent(s).replace(/^\[(.+)\]$/, ':$1')).join('/'));
    expect(found.length).toBeGreaterThan(0);
    for (const pattern of found) expect(patterns).toContain(pattern);
  });
});
