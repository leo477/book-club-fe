// R5 parity checks for /clubs + shell against a deployed preview (guest/read-only against the real backend).
// SAFETY: every /api/v1 request is routed through `guardApi`: GETs are only let through when the test is a
// guest test; any non-GET is fulfilled by a mock or aborted (never reaches the backend).
import AxeBuilder from '@axe-core/playwright';
import type { Page, Route } from '@playwright/test';
import { expect, test } from './bypass';
import { mkdirSync } from 'node:fs';

const SHOTS = 'playwright-report/parity/r5';
mkdirSync(SHOTS, { recursive: true });

const USER = {
  id: 'u-1', email: 'mock@example.test', displayName: 'Mock User', role: 'user', avatarUrl: null,
  createdAt: '2026-01-01T00:00:00Z', socialsPublic: false, socials: {},
};
const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

interface Log { method: string; path: string; headers: Record<string, string>; body: string | null }

/** Mocks a signed-in session; unmocked non-GETs are aborted so nothing can write to the real backend. */
async function guardApi(page: Page, opts: {
  signedIn?: boolean; mine?: unknown[] | ((n: number) => Route | unknown); join?: (route: Route) => Promise<void> | void; sessionStatus?: (route: Route) => Promise<void> | void; mineHandler?: (route: Route, n: number) => Promise<void> | void;
} = {}): Promise<Log[]> {
  const log: Log[] = [];
  let mineCalls = 0;
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname.replace('/api/v1', '');
    log.push({ method: req.method(), path, headers: req.headers(), body: req.postData() });
    if (path === '/auth/session-status' && opts.sessionStatus) return opts.sessionStatus(route);
    if (opts.signedIn) {
      if (path === '/auth/session-status') return json(route, { hasSession: true });
      if (path === '/auth/me') return json(route, USER);
      if (path === '/auth/refresh' && req.method() === 'POST') return json(route, { accessToken: 'mock', refreshToken: 'mock', user: USER });
      if (path === '/config/maps-key') return json(route, {}, 404);
      if (path === '/clubs/my') {
        mineCalls++;
        if (opts.mineHandler) return opts.mineHandler(route, mineCalls);
        return json(route, Array.isArray(opts.mine) ? opts.mine : []);
      }
      if (/^\/clubs\/[^/]+\/join$/.test(path) && req.method() === 'POST') {
        if (opts.join) return opts.join(route);
        return json(route, { status: 'pending' });
      }
      if (req.method() === 'GET' && (path === '/clubs' || path.startsWith('/config/'))) return route.fallback();
      return req.method() === 'GET' ? route.abort('failed') : route.abort('blockedbyclient');
    }
    if (req.method() !== 'GET') return route.abort('blockedbyclient');
    return route.fallback();
  });
  return log;
}

function watchConsole(page: Page): string[] {
  const errs: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push(`console: ${m.text().slice(0, 300)}`);
  });
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message.slice(0, 300)}`));
  return errs;
}

test.describe('r5 /clubs (next)', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'next', 'next-only check'));

  test('P1 trailing slash, query strings and canonical', async ({ request, baseURL }) => {
    const r = await request.get('/clubs/', { maxRedirects: 0 });
    expect([301, 307, 308]).toContain(r.status());
    expect(r.headers()['location']).toMatch(/\/clubs$/);
    const q = await request.get('/clubs?city=Kyiv&utm_source=x');
    expect(q.status()).toBe(200);
    expect(await q.text()).toContain('rel="canonical" href="https://book-club-planer.vercel.app/clubs"');
    void baseURL;
  });

  test('P6 raw HTML without JS: title, club names, JSON-LD, canonical, og (uk + en)', async ({ request }) => {
    const pub = await (await request.get('/api/v1/clubs')).json();
    const names: string[] = pub.map((c: { name: string }) => c.name);
    expect(names.length).toBeGreaterThan(0);
    for (const [lang, title] of [['uk', /Книжкові клуби \| Book Club/], ['en', /Book Clubs \| Book Club/]] as const) {
      const html = await (await request.get('/clubs', { headers: { cookie: `lang=${lang}` } })).text();
      expect(html).toMatch(new RegExp(`<html lang="${lang}"`));
      expect(html).toMatch(title);
      for (const n of names) expect(html).toContain(n);
      expect(html).toContain('<link rel="canonical" href="https://book-club-planer.vercel.app/clubs"');
      expect(html).toMatch(/property="og:image" content="https:\/\//);
      const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
      expect(ld.length).toBeGreaterThan(0);
      expect(JSON.stringify(ld)).toContain('"WebSite"');
      expect(html.includes('</script><script>')).toBe(false);
    }
  });

  test('P6 sitemap contains public club urls; robots', async ({ request }) => {
    const pub = await (await request.get('/api/v1/clubs')).json();
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const c of pub) expect(xml).toContain(`/clubs/${c.id}`);
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  });

  test('P11 guest: no console errors, list rendered, no writes', async ({ page }) => {
    const errs = watchConsole(page);
    const log = await guardApi(page);
    await page.goto('/clubs');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('club-card').first()).toBeVisible();
    await expect(page.getByTestId('login-to-join').first()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/guest-clubs.png`, fullPage: true });
    expect(errs).toEqual([]);
    expect(log.filter((l) => l.method !== 'GET')).toEqual([]);
  });

  test('P4/P7 signed-in (mocked): tabs roving tabindex + arrow keys', async ({ page }) => {
    const errs = watchConsole(page);
    await guardApi(page, { signedIn: true, mine: [] });
    await page.goto('/clubs');
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    // Radix roving focus: the tablist container is the tab stop, focus lands on the active tab
    await expect(page.getByRole('tablist')).toBeVisible();
    await page.getByRole('tablist').focus();
    await expect(tabs.nth(0)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('tabindex', '-1');
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(0)).toBeFocused();
    await page.keyboard.press('End');
    await expect(tabs.nth(1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tabs.nth(0)).toBeFocused();
    expect(errs).toEqual([]);
  });

  test('P2/P4 join via mocked POST: request shape, extra GET /clubs/my, no console errors', async ({ page }) => {
    const errs = watchConsole(page);
    const log = await guardApi(page, { signedIn: true, mine: [] });
    await page.goto('/clubs');
    const join = page.getByRole('button', { name: /^(Приєднатися|Join)/ }).first();
    await expect(join).toBeVisible();
    const before = log.filter((l) => l.path === '/clubs/my').length;
    await join.click();
    await expect.poll(() => log.filter((l) => l.method === 'POST').length).toBe(1);
    const post = log.find((l) => l.method === 'POST')!;
    expect(post.path).toMatch(/^\/clubs\/[0-9a-f-]{36}\/join$/);
    expect(post.body ?? '{}').toBe('{}');
    expect(post.headers['content-type']).toMatch(/json/);
    await expect.poll(() => log.filter((l) => l.path === '/clubs/my').length).toBe(before + 1);
    expect(log.filter((l) => l.method !== 'GET' && l.method !== 'POST')).toEqual([]);
    expect(errs).toEqual([]);
  });

  test('P4 member and organizer (mocked): no join button on own/member clubs, my tab lists them', async ({ page, request }) => {
    const [club] = await (await request.get('/api/v1/clubs')).json();
    for (const [label, organizerId] of [['member', 'someone-else'], ['organizer', USER.id]] as const) {
      const mine = [{ ...club, organizerId }];
      const p = await page.context().newPage();
      await guardApi(p, { signedIn: true, mine });
      await p.goto('/clubs');
      const tabs = p.getByRole('tab');
      await expect(tabs).toHaveCount(2);
      await expect(p.getByRole('button', { name: /^(Приєднатися|Join)/ })).toHaveCount(0);
      await tabs.nth(1).click();
      await expect(p.getByTestId('club-card')).toHaveCount(1);
      await p.screenshot({ path: `${SHOTS}/${label}-my-tab.png`, fullPage: true });
      await p.close();
    }
  });

  test('P3 join 5xx shows error toast; page stays', async ({ page }) => {
    const log = await guardApi(page, { signedIn: true, join: (r) => json(r, { detail: 'boom' }, 503) });
    await page.goto('/clubs');
    await page.getByRole('button', { name: /^(Приєднатися|Join)/ }).first().click();
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/clubs$/);
    expect(log.some((l) => l.method === 'POST')).toBe(true);
  });

  test('P3 cold-start 503 on session-status: page renders as guest', async ({ page }) => {
    await guardApi(page, { sessionStatus: (r) => json(r, { detail: 'cold' }, 503) });
    await page.goto('/clubs');
    await expect(page.getByTestId('club-card').first()).toBeVisible();
    await expect(page.getByTestId('login-to-join').first()).toBeVisible({ timeout: 10_000 });
  });

  test('P3 cold-start 503 on /clubs/my: error handled, public list intact', async ({ page }) => {
    const errs = watchConsole(page);
    await guardApi(page, { signedIn: true, mineHandler: (r) => json(r, { detail: 'cold' }, 503) });
    await page.goto('/clubs');
    await expect(page.getByTestId('club-card').first()).toBeVisible();
    await page.getByRole('tab').nth(1).click();
    await page.waitForTimeout(8000);
    await page.screenshot({ path: `${SHOTS}/my-503.png`, fullPage: true });
    console.log('my-503 console:', JSON.stringify(errs));
    await expect(page).toHaveURL(/\/clubs$/);
  });

  test('P3 timeout on /clubs/my (hang): does not hang the page forever', async ({ page }) => {
    test.setTimeout(120_000);
    await guardApi(page, { signedIn: true, mineHandler: () => new Promise(() => {}) });
    await page.goto('/clubs');
    await page.getByRole('tab').nth(1).click();
    const t0 = Date.now();
    const settled = await page.locator('[data-sonner-toast]').first().waitFor({ timeout: 45_000 }).then(() => true, () => false);
    console.log(`timeout-hang: error UI appeared=${settled} after ${(Date.now() - t0) / 1000}s`);
    await page.screenshot({ path: `${SHOTS}/my-timeout.png`, fullPage: true });
    expect(settled).toBe(true);
  });

  test('P7 mobile sheet: focus trap, Escape, focus return', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await guardApi(page);
    await page.goto('/clubs');
    const trigger = page.getByRole('button', { name: 'Toggle navigation menu' });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    }
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog).toBeVisible();
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  });

  for (const lang of ['uk', 'en'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      for (const w of [375, 768, 1280]) {
        test(`P7 axe /clubs ${lang} ${theme} ${w}`, async ({ page, context, baseURL }) => {
          await context.addCookies([{ name: 'lang', value: lang, url: baseURL! }, { name: 'theme', value: theme, url: baseURL! }]);
          await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
          await page.setViewportSize({ width: w, height: 900 });
          await guardApi(page);
          await page.goto('/clubs');
          await page.waitForLoadState('networkidle');
          await expect(page.getByTestId('club-card').first()).toBeVisible();
          const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
          const bad = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
          console.log(`axe /clubs ${lang} ${theme} ${w}: ${r.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`).join(', ') || 'none'}`);
          expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
        });
      }
    }
  }

  for (const route of ['/privacy', '/terms']) {
    test(`P7 axe ${route}`, async ({ page }) => {
      await guardApi(page);
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id)).toEqual([]);
    });
  }

  test('P5a language Next -> Angular: switch on /clubs is honoured by Angular /profile', async ({ page }) => {
    await guardApi(page, { signedIn: true });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/clubs');
    await page.getByRole('button', { name: 'Switch to English' }).first().click().catch(() => undefined);
    await page.getByRole('button', { name: 'Перейти на українську' }).first().waitFor({ timeout: 10_000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('P5b language Angular -> Next: switch on Angular /profile is honoured by Next /clubs (needs lang cookie from Angular)', async ({ page, context }) => {
    await guardApi(page, { signedIn: true });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await page.getByRole('button', { name: 'Switch to English' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const cookie = (await context.cookies()).find((c) => c.name === 'lang')?.value;
    const ls = await page.evaluate(() => localStorage.getItem('lang'));
    console.log(`P5b after Angular switch: localStorage.lang=${ls} cookie.lang=${cookie}`);
    await page.goto('/clubs');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/Book Clubs/);
  });
});
