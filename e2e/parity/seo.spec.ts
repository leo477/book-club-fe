import { test, expect } from '@playwright/test';
import { extractSeo, jsonLdProblems, jsonLdTypes, type SeoSnapshot } from './html-meta';
import { expectations } from './expectations';
import { assertBaselineWritable } from './snapshot-guard';
import { guestRedirects, publicRoutes, rawRoutes, slug } from './routes';

const PROD_ORIGINS = ['https://book-club-planer.vercel.app', 'https://www.book-club-planer.vercel.app'];
const PREVIEW_ORIGIN = /https:\/\/book-club-planer(?:-[a-z0-9-]+)?\.vercel\.app/g;

test.beforeAll(({}, testInfo) => assertBaselineWritable(testInfo));

function assertComplete(seo: SeoSnapshot): void {
  expect(seo.title).not.toBe('');
  expect(seo.description).not.toBe('');
  expect(seo.ogTitle).not.toBe('');
  expect(seo.ogDescription).not.toBe('');
  expect(seo.ogUrl).toMatch(/^https?:\/\//);
  expect(seo.ogImage).toMatch(/^https?:\/\//);
  expect(seo.canonical).toMatch(/^https?:\/\//);
  expect(jsonLdProblems(jsonLdTypes(seo.jsonLd))).toEqual([]);
}

function summarise(seo: SeoSnapshot, origins: string[]): string {
  let text = JSON.stringify({ ...seo, jsonLd: jsonLdTypes(seo.jsonLd) }, null, 2) + '\n';
  for (const origin of [...origins, ...PROD_ORIGINS]) text = text.split(origin).join('{ORIGIN}');
  text = text.replace(PREVIEW_ORIGIN, '{ORIGIN}');
  return text;
}

function assertTarget(project: string, route: string, seo: SeoSnapshot, origin: string): void {
  const expected = expectations[project]?.[route];
  if (!expected) return;
  expect(seo.title).toMatch(expected.title);
  expect(seo.description).toMatch(expected.description);
  expect(seo.ogTitle).toMatch(expected.title);
  expect(seo.canonical).toBe(new URL(route, origin).href);
  expect(seo.ogUrl).toBe(new URL(route, origin).href);
  expect(jsonLdTypes(seo.jsonLd)).toEqual(expect.arrayContaining(expected.jsonLd));
}

for (const [route, target] of Object.entries(guestRedirects)) {
  test(`seo guest redirect ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL((url) => url.pathname === target);
  });
}

for (const route of rawRoutes) {
  test.describe(`seo raw ${route}`, () => {
    test('raw HTML without JS', async ({ request, baseURL }, testInfo) => {
      const resp = await request.get(route);
      expect(resp.status()).toBe(200);
      const seo = extractSeo(await resp.text());
      const project = testInfo.project.name;
      if (expectations[project]) {
        assertComplete(seo);
        assertTarget(project, route, seo, new URL(baseURL!).origin);
      } else {
        expect(summarise(seo, [new URL(baseURL!).origin])).toMatchSnapshot(`raw-${slug(route)}.json`);
      }
    });
  });
}

for (const route of publicRoutes) {
  test.describe(`seo rendered ${route}`, () => {
    test('after JS render', async ({ page, baseURL }, testInfo) => {
      await page.goto(route);
      await expect(page).toHaveURL((url) => url.pathname === route);
      await page.waitForLoadState('networkidle');
      const seo = extractSeo(await page.content());
      assertComplete(seo);
      const origin = new URL(baseURL!).origin;
      assertTarget(testInfo.project.name, route, seo, origin);
      expect(summarise(seo, [origin, new URL(page.url()).origin])).toMatchSnapshot(`rendered-${slug(route)}.json`);
    });
  });
}
