import { test, expect } from '@playwright/test';
import { extractSeo, jsonLdTypes, type SeoSnapshot } from './html-meta';
import { publicRoutes, slug } from './routes';

function assertComplete(seo: SeoSnapshot): void {
  expect(seo.title).not.toBe('');
  expect(seo.description).not.toBe('');
  expect(seo.ogTitle).not.toBe('');
  expect(seo.ogDescription).not.toBe('');
  expect(seo.ogUrl).toMatch(/^https?:\/\//);
  expect(seo.ogImage).not.toBe('');
  expect(seo.canonical).toMatch(/^https?:\/\//);
  expect(seo.jsonLd.length).toBeGreaterThan(0);
  expect(jsonLdTypes(seo.jsonLd)).not.toContain('invalid-json');
}

function summarise(seo: SeoSnapshot): string {
  return JSON.stringify({ ...seo, jsonLd: jsonLdTypes(seo.jsonLd) }, null, 2) + '\n';
}

for (const route of publicRoutes) {
  test.describe(`seo ${route}`, () => {
    test('raw HTML without JS', async ({ request }) => {
      const resp = await request.get(route);
      expect(resp.status()).toBe(200);
      const seo = extractSeo(await resp.text());
      assertComplete(seo);
      expect(summarise(seo)).toMatchSnapshot(`raw-${slug(route)}.json`);
    });

    test('after JS render', async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const seo = extractSeo(await page.content());
      assertComplete(seo);
      expect(summarise(seo)).toMatchSnapshot(`rendered-${slug(route)}.json`);
    });
  });
}
