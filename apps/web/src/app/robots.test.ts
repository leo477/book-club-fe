import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import robots from './robots';

const legacy = readFileSync(resolve(process.cwd(), '../../public/robots.txt'), 'utf8');

describe('robots', () => {
  it('matches the legacy public/robots.txt rules and sitemap', () => {
    const { rules, sitemap } = robots();
    const rule = Array.isArray(rules) ? rules[0]! : rules;
    const legacyLines = legacy.split('\n').filter(Boolean);
    const disallow = legacyLines.filter((l) => l.startsWith('Disallow:')).map((l) => l.slice('Disallow:'.length).trim());

    expect(rule.userAgent).toBe('*');
    expect(rule.allow).toBe('/');
    expect(rule.disallow).toEqual(disallow);
    expect(sitemap).toBe(legacyLines.find((l) => l.startsWith('Sitemap:'))?.slice('Sitemap:'.length).trim());
  });
});
