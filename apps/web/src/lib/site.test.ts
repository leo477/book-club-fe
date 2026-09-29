import { describe, expect, it } from 'vitest';
import { messages } from '@/test/harness';
import { ORGANIZATION_JSON_LD, SITE_URL } from './site';

describe('site constants', () => {
  it.each(['uk', 'en'] as const)('SITE_URL matches SEO.site_url in %s', (locale) => {
    expect(SITE_URL).toBe(messages[locale]['SEO.site_url']);
  });

  it('derives every organization URL from SITE_URL', () => {
    const urls = JSON.stringify(ORGANIZATION_JSON_LD).match(/https?:\/\/[^"]+/g)!.filter((u) => !u.includes('schema.org'));
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url.startsWith(SITE_URL)).toBe(true);
  });
});
