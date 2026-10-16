import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CSP_WS_ORIGIN, buildCsp } from './csp';

const FILES = ['../../vercel.json', '../../../../vercel.json'].map((rel) => fileURLToPath(new URL(rel, import.meta.url)));

const connectSrcs = (file: string): string[] => {
  const json = JSON.parse(readFileSync(file, 'utf8')) as { headers?: { headers?: { key: string; value: string }[] }[] };
  return (json.headers ?? [])
    .flatMap((h) => h.headers ?? [])
    .filter((h) => h.key === 'Content-Security-Policy')
    .map((h) => h.value.split('; ').find((d) => d.startsWith('connect-src ')) ?? '');
};

const imgSrcs = (file: string): string[][] => {
  const json = JSON.parse(readFileSync(file, 'utf8')) as { headers?: { headers?: { key: string; value: string }[] }[] };
  return (json.headers ?? [])
    .flatMap((h) => h.headers ?? [])
    .filter((h) => h.key === 'Content-Security-Policy')
    .map((h) => (h.value.split('; ').find((d) => d.startsWith('img-src ')) ?? '').split(' '));
};

describe('chat socket origin in every CSP', () => {
  it('is allowed by the Next CSP', () => {
    expect(buildCsp('n').split('; ').find((d) => d.startsWith('connect-src '))?.split(' ')).toContain(CSP_WS_ORIGIN);
  });

  it.each(FILES)('is allowed by each CSP declared in %s', (file) => {
    const sources = connectSrcs(file);
    for (const connect of sources) expect(connect.split(' ')).toContain(CSP_WS_ORIGIN);
  });

  it('allows the Google Books cover hosts, and no blanket https:, in every declared img-src', () => {
    const imgs = FILES.flatMap(imgSrcs);
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) {
      expect(img).toContain('https://books.google.com');
      expect(img).toContain('https://books.googleusercontent.com');
      expect(img).not.toContain('https:');
    }
  });

  it('keeps the img-src hosts of csp.ts and the root vercel.json identical', () => {
    const hosts = (img: string[]) => img.slice(1).filter((h) => !h.startsWith("'nonce-")).sort();
    const next = (buildCsp('n').split('; ').find((d) => d.startsWith('img-src ')) ?? '').split(' ');
    const root = imgSrcs(FILES[1]!);
    expect(root.length).toBeGreaterThan(0);
    for (const img of root) expect(hosts(img)).toEqual(hosts(next));
  });

  it('at least one vercel.json declares a CSP, so the check above is not vacuous', () => {
    expect(FILES.flatMap(connectSrcs).length).toBeGreaterThan(0);
  });
});
