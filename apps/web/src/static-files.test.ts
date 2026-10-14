import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const webPublic = resolve(process.cwd(), 'public');
const legacyPublic = resolve(process.cwd(), '../../public');
const SHARED = ['favicon.ico', 'favicon.svg', 'og-image.png', 'googleea44a5e89a1de9d7.html'];

describe('apps/web/public', () => {
  it('ships every static file Next must serve once the legacy fallback is gone', () => {
    expect(readdirSync(webPublic)).toEqual(expect.arrayContaining(SHARED));
  });

  // Byte-identity collision guard: remove the existsSync/identity check against root public/
  // together with root public/ in R14.5 (SCRUM-119).
  it.each(SHARED)('collision guard: %s is byte-identical to the legacy copy while Angular still owns it', (name) => {
    expect(existsSync(resolve(legacyPublic, name))).toBe(true);
    expect(readFileSync(resolve(webPublic, name)).equals(readFileSync(resolve(legacyPublic, name)))).toBe(true);
  });
});
