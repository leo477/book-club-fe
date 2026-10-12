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

describe('chat socket origin in every CSP', () => {
  it('is allowed by the Next CSP', () => {
    expect(buildCsp('n').split('; ').find((d) => d.startsWith('connect-src '))?.split(' ')).toContain(CSP_WS_ORIGIN);
  });

  it.each(FILES)('is allowed by each CSP declared in %s', (file) => {
    const sources = connectSrcs(file);
    for (const connect of sources) expect(connect.split(' ')).toContain(CSP_WS_ORIGIN);
  });

  it('at least one vercel.json declares a CSP, so the check above is not vacuous', () => {
    expect(FILES.flatMap(connectSrcs).length).toBeGreaterThan(0);
  });
});
