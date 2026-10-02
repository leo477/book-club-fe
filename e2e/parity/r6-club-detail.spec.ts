// R6 parity checks for /clubs/:id. The Next target must be started against the R6 mock backend
// (see e2e/parity/r6/mock-backend.ts; BACKEND_ORIGIN=https://localhost:9922, REVALIDATE_SECRET=parity-secret) and the legacy
// target is the deployed Angular app. Every /api/v1 call made by a browser is fulfilled by e2e/parity/r6/fixtures.ts
// (`installApiMock`) so nothing reaches a real backend and both targets see identical data.
// Tests without a `next-only` marker run against BOTH projects and assert the same behaviour.
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { expect, test } from './bypass';
import { extractSeo, jsonLdProblems, jsonLdTypes } from './html-meta';
import { IDS, newState, type Role } from './r6/fixtures';
import { installApiMock, LANG_COOKIE, settle, watchConsole } from './r6/helpers';

// test-only: drop <script> blocks (any case, `</script >` too) so assertions see the server-rendered markup; split/join leaves no partial tags behind
const withoutScripts = (html: string): string => html.split(/<script\b[\s\S]*?<\/script[^>]*>/i).join('');

const SHOTS = 'playwright-report/parity/r6';
mkdirSync(SHOTS, { recursive: true });
const SITE = 'https://book-club-planer.vercel.app';
const club = (id: string = IDS.public) => `/clubs/${id}`;
const nextOnly = (name: string) => name === 'next';

async function open(page: Page, role: Role, id: string = IDS.public, over: Parameters<typeof newState>[1] = {}, latency: Record<string, number> = {}) {
  const mock = await installApiMock(page, newState(role, over), latency);
  await page.goto(club(id));
  await settle(page);
  return mock;
}

/** Legacy defers the members list until it scrolls into view. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

test.describe('P1 URLs and status codes', () => {
  test('next: trailing slash redirects, query is ignored by the canonical, uppercase ids do not break', async ({ request }, ti) => {
    test.skip(!nextOnly(ti.project.name), 'next-only');
    const slash = await request.get(`${club()}/`, { maxRedirects: 0 });
    expect([301, 307, 308]).toContain(slash.status());
    expect(slash.headers()['location']).toMatch(new RegExp(`${club()}$`));
    const q = await request.get(`${club()}?utm_source=x&tab=history`);
    expect(q.status()).toBe(200);
    expect(extractSeo(await q.text()).canonical).toBe(`${SITE}${club()}`);
  });

  test('next: missing club is a real 404 with the not-found panel; legacy answers 200 (documented delta)', async ({ request, page }, ti) => {
    const res = await request.get(club(IDS.missing));
    if (nextOnly(ti.project.name)) {
      expect(res.status()).toBe(404);
      const html = await res.text();
      // nothing to index on a 404
      expect(html).toMatch(/<meta name="robots" content="noindex/);
      // Known limit: with a real 404 status Next serves its `__next_error__` recovery shell (by design, see PARITY-R6 finding 3)
      // and renders not-found.tsx on the client, so a no-JS visitor gets a blank 404 body; logged, not asserted.
      console.log(`[next] 404 body has the panel in server HTML: ${/Клуб не знайдено|Club not found/i.test(withoutScripts(html))}`);
    } else {
      expect(res.status()).toBe(200);
    }
    await installApiMock(page);
    await page.goto(club(IDS.missing));
    await expect(page.getByRole('alert').filter({ hasText: /\S/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Назад до клубів|←/ }).first()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/not-found-${ti.project.name}.png` });
  });

  test('next: a backend failure is not a 404 and is not cached as a missing club', async ({ request }, ti) => {
    test.skip(!nextOnly(ti.project.name), 'next-only');
    const first = await request.get(club(IDS.broken));
    expect(first.status()).toBeGreaterThanOrEqual(500);
    const before = await (await request.get('https://localhost:9922/__requests', { ignoreHTTPSErrors: true })).json().catch(() => null);
    const second = await request.get(club(IDS.broken));
    expect(second.status()).toBeGreaterThanOrEqual(500);
    const after = await (await request.get('https://localhost:9922/__requests', { ignoreHTTPSErrors: true })).json().catch(() => null);
    if (before && after) expect((after as string[]).length).toBeGreaterThan((before as string[]).length);
  });

  test('ids that are not UUIDs (create, junk, manage sub-route) are served by legacy on both targets', async ({ request }, ti) => {
    for (const p of ['/clubs/create', '/clubs/not-a-uuid', `${club()}/manage`]) {
      const res = await request.get(p);
      expect(res.status(), p).toBe(200);
      if (nextOnly(ti.project.name)) expect(await res.text(), p).toContain('<app-root');
    }
  });
});

test.describe('P6 SEO (raw HTML, no JS)', () => {
  test.beforeEach(({}, ti) => test.skip(!nextOnly(ti.project.name), 'next-only'));

  test('public club: title, description, canonical, og/twitter, robots, JSON-LD @graph with Organization and Event nodes', async ({ request }) => {
    const html = await (await request.get(club(), { headers: { cookie: 'lang=uk' } })).text();
    const seo = extractSeo(html);
    expect(html).toMatch(/<html lang="uk"/);
    expect(seo.title).toBe('Нічні читачі | Book Club');
    expect(seo.description).toBe('Читаємо сучасну українську прозу щочетверга.');
    expect(seo.canonical).toBe(`${SITE}${club()}`);
    expect(seo.ogTitle).toBe('Нічні читачі');
    expect(seo.ogUrl).toBe(`${SITE}${club()}`);
    expect(seo.ogImage).toBe('https://parity.supabase.co/storage/cover.svg');
    expect(html).toMatch(/<meta name="twitter:image" content="https:\/\/parity\.supabase\.co\/storage\/cover\.svg"/);
    expect(html).toMatch(/<meta name="robots" content="index, ?follow"/);
    expect(html).toContain('Нічні читачі'); // h1 in server HTML

    expect(jsonLdProblems(jsonLdTypes(seo.jsonLd))).toEqual([]);
    const ld = JSON.parse(seo.jsonLd.find((b) => b.includes(IDS.public))!) as { '@context': string; '@graph': Record<string, any>[] };
    expect(ld['@context']).toBe('https://schema.org');
    const graph = ld['@graph'];
    const org = graph.find((n) => n['@type'] === 'Organization')!;
    expect(org).toMatchObject({ '@id': `${SITE}${club()}`, name: 'Нічні читачі', url: `${SITE}${club()}`, foundingDate: '2026-03-01', keywords: 'проза, київ' });
    expect(org['address']).toMatchObject({ '@type': 'PostalAddress', addressLocality: 'Київ', addressCountry: 'UA' });
    const events = graph.filter((n) => n['@type'] === 'Event');
    expect(events.map((e) => e['name'])).toEqual(['Новорічна зустріч', 'Весняна зустріч']); // the held event is excluded
    for (const e of events) {
      expect(Number.isNaN(new Date(e['startDate']).getTime())).toBe(false);
      expect(e['eventStatus']).toBe('https://schema.org/EventScheduled');
      expect(e['location']).toMatchObject({ '@type': 'Place' });
      expect(e['organizer']).toEqual({ '@id': `${SITE}${club()}` });
      expect(e['url']).toMatch(new RegExp(`^${SITE}/events/e1e1e1e1-`));
    }
    const ids = graph.map((n) => n['@id']).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
    // every @type is one Google understands for this page
    expect(graph.every((n) => ['Organization', 'Event'].includes(n['@type']))).toBe(true);
  });

  test('english locale: title, description fallback and html lang follow the lang cookie', async ({ request }) => {
    const html = await (await request.get(club(IDS.bare), { headers: { cookie: 'lang=en' } })).text();
    const seo = extractSeo(html);
    expect(html).toMatch(/<html lang="en"/);
    expect(seo.title).toBe('Без обкладинки | Book Club');
    expect(seo.description.length).toBeGreaterThan(20);
    expect(seo.description).toContain('Без обкладинки');
    expect(seo.description).not.toMatch(/[А-Яа-яІіЇїЄє]{4}.*[А-Яа-яІіЇїЄє]{4}.*[А-Яа-яІіЇїЄє]{4}.*[А-Яа-яІіЇїЄє]{4}.*[А-Яа-яІіЇїЄє]{4}/s); // description fallback is English, only the name is Ukrainian
  });

  test('club without cover/description/city: safe fallbacks, no empty JSON-LD fields, og:image is an absolute https url', async ({ request }) => {
    const seo = extractSeo(await (await request.get(club(IDS.bare))).text());
    expect(seo.ogImage).toMatch(/^https:\/\/.+\.(png|jpg|jpeg|webp|svg)/);
    expect(seo.description.length).toBeGreaterThan(20);
    const ld = JSON.parse(seo.jsonLd.find((b) => b.includes(IDS.bare))!) as { '@graph': Record<string, unknown>[] };
    const org = ld['@graph'].find((n) => n['@type'] === 'Organization')!;
    for (const key of ['image', 'address', 'keywords']) expect(org, key).not.toHaveProperty(key);
    expect(Object.values(org).every((v) => v !== '' && v !== null && v !== undefined)).toBe(true);
    expect(ld['@graph'].filter((n) => n['@type'] === 'Event')).toEqual([]);
  });

  test('private club: noindex, generic title/og, no club JSON-LD (documented deltas)', async ({ request }) => {
    const res = await request.get(club(IDS.private));
    expect(res.status()).toBe(200);
    const html = await res.text();
    const seo = extractSeo(html);
    expect(html).toMatch(/<meta name="robots" content="noindex/);
    expect(seo.jsonLd.filter((b) => b.includes(IDS.private))).toEqual([]);
    // documented delta: the private club's name/description/cover never reach title/og/twitter (Angular puts the name in the title)
    expect(seo.title).toBe('Книжкові клуби | Book Club');
    expect(seo.ogImage).toBe(`${SITE}/og-image.png`);
    const head = html.match(/<head[\s\S]*?<\/head>/)![0];
    // the body is the stub view: name and member count only, none of the club's own content
    const body = withoutScripts(html);
    expect(body).toContain('Закритий клуб');
    expect(body).toContain('data-testid="private-stub"');
    expect(body).not.toContain('Читаємо сучасну українську прозу');
    expect(body).not.toContain('parity.supabase.co');
    expect(body).not.toContain('Хрещатик');
    const metas = head.match(/<meta[^>]*>/g)!.join('\n');
    expect(metas).not.toContain('Закритий клуб');
    expect(metas).not.toContain('parity.supabase.co');
  });

  test('next: private club stub: guests get the minimal view, members/organizers/admins the full club without a reload', async ({ page }, ti) => {
    test.skip(!nextOnly(ti.project.name), 'next-only');
    const about = page.getByText('Читаємо сучасну українську прозу');
    const guest = await open(page, 'guest', IDS.private);
    await expect(page.getByTestId('private-stub')).toBeVisible();
    await expect(page.getByTestId('guest-cta')).toBeVisible();
    await expect(about).toHaveCount(0);
    expect(guest.log.filter((l) => new RegExp(`/clubs/${IDS.private}`).test(l.path))).toEqual([]);

    const nonMember = await open(page, 'member', IDS.private, { joined: false });
    await expect(page.getByTestId('join-button')).toBeVisible();
    await expect(page.getByTestId('private-stub')).toBeVisible();
    await page.getByTestId('join-button').click();
    await expect(page.getByTestId('join-pending')).toBeVisible();
    expect(nonMember.log.filter((l) => l.path === `/clubs/${IDS.private}/members`)).toEqual([]);
    // one load, one refetch after the join so an immediate membership upgrades the gate
    await expect.poll(() => nonMember.log.filter((l) => l.method === 'GET' && l.path === `/clubs/${IDS.private}`).length).toBe(2);

    for (const role of ['member', 'organizer', 'admin'] as const) {
      const errs = watchConsole(page);
      await open(page, role, IDS.private, { joined: role === 'member' });
      await expect(about).toBeVisible();
      await expect(page.getByTestId('private-stub')).toHaveCount(0);
      expect(errs, role).toEqual([]);
    }
  });

  test('hostile club text cannot break out of JSON-LD or the document', async ({ request, page }) => {
    const html = await (await request.get(club(IDS.hostile))).text();
    expect(html).not.toContain('<script>window.__pwn');
    expect(html).not.toMatch(/<img src=x onerror/);
    const blocks = extractSeo(html).jsonLd;
    const ld = JSON.parse(blocks.find((b) => b.includes(IDS.hostile))!);
    expect(ld['@graph'][0].name).toContain('</script>'); // the data is intact once parsed
    expect(blocks.find((b) => b.includes(IDS.hostile))!).not.toContain('</script');
    expect(blocks.find((b) => b.includes(IDS.hostile))!).not.toContain(' ');
    const errs = watchConsole(page);
    await installApiMock(page);
    await page.goto(club(IDS.hostile));
    await settle(page);
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined();
    expect(await page.locator('img[src="x"]').count()).toBe(0);
    expect(errs).toEqual([]);
  });

  test('sitemap lists public club urls only (real backend: see r6-real-backend.spec.ts)', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain(`/clubs/${IDS.public}`);
    expect(xml).not.toContain(IDS.private);
  });

  test('server HTML carries the content without JS (name, description, events, members count, cover, CTA text)', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, javaScriptEnabled: false });
    await ctx.route('**/*', (r) => r.continue());
    const page = await ctx.newPage();
    await page.goto(club());
    await expect(page.getByTestId('club-name')).toHaveText(/Нічні читачі/i);
    await expect(page.getByText('Читаємо сучасну українську прозу щочетверга.')).toBeVisible();
    await expect(page.getByText('Новорічна зустріч', { exact: true })).toBeVisible();
    await expect(page.getByText('Весняна зустріч')).toBeVisible();
    await expect(page.getByText('Кав’ярня')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/no-js.png`, fullPage: true });
    await ctx.close();
  });
});

test.describe('P5/P7 hydration, dates, theme', () => {
  test.beforeEach(({}, ti) => test.skip(!nextOnly(ti.project.name), 'next-only'));

  for (const tz of ['Europe/Kyiv', 'America/Los_Angeles', 'Pacific/Kiritimati', 'UTC']) {
    for (const [lang, theme] of [['uk', 'dark'], ['en', 'light']] as const) {
      test(`no hydration mismatch, stable Europe/Kyiv dates: tz=${tz} ${lang} ${theme}`, async ({ browser, baseURL }) => {
        const ctx = await browser.newContext({ baseURL: baseURL!, timezoneId: tz, locale: lang === 'uk' ? 'uk-UA' : 'en-US', colorScheme: theme === 'dark' ? 'light' : 'dark' });
        await ctx.addCookies(LANG_COOKIE(baseURL!, lang, theme));
        const page = await ctx.newPage();
        const errs = watchConsole(page);
        // SSR text of the event date, read before any client code runs
        const ssr = await (await ctx.request.get(club())).text();
        await installApiMock(page);
        await page.goto(club());
        await settle(page);
        const expected = lang === 'uk' ? '1 січня 2027' : 'January 1, 2027';
        expect(ssr).toContain(expected);
        await expect(page.getByText(expected).first()).toBeVisible();
        await expect(page.getByText(lang === 'uk' ? '15 березня 2027' : 'March 15, 2027').first()).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(theme === 'dark');
        expect(ssr.match(/<html[^>]*>/)![0].includes('dark')).toBe(theme === 'dark');
        expect(errs.filter((e) => /hydrat|did not match|#418|#423|#425|#422/i.test(e))).toEqual([]);
        expect(errs).toEqual([]);
        await ctx.close();
      });
    }
  }
});

test.describe('P4/P3 roles, join, leave, vote (both targets)', () => {
  test('guest: join CTA points to login, members are hidden, no membership/vote-write calls', async ({ page }, ti) => {
    const errs = watchConsole(page);
    const { log } = await open(page, 'guest');
    await expect(page.getByTestId('guest-cta')).toBeVisible();
    await expect(page.getByTestId('guest-cta-login')).toHaveAttribute('href', '/login');
    await expect(page.getByTestId('guest-members-hidden')).toBeVisible();
    await expect(page.getByTestId('join-button')).toHaveCount(0);
    await expect(page.getByTestId('leave-button')).toHaveCount(0);
    expect(log.filter((l) => l.method !== 'GET')).toEqual([]);
    expect(log.map((l) => l.path)).not.toContain(`/clubs/${IDS.public}/my-membership`);
    expect(log.map((l) => l.path)).not.toContain(`/clubs/${IDS.public}/members`);
    if (nextOnly(ti.project.name)) {
      // documented delta: the club and its events come from the server, so the browser makes no club/events/membership call
      // (the book-stores widget of the sidebar is the only other browser call, and legacy makes it too)
      expect(log.map((l) => `${l.method} ${l.path}`).sort()).toEqual(['GET /auth/session-status', 'GET /books/stores']);
    }
    expect(errs).toEqual([]);
    await page.screenshot({ path: `${SHOTS}/guest-${ti.project.name}.png`, fullPage: true });
  });

  test('member: leave button, chat entry, no join CTA; members list visible', async ({ page }, ti) => {
    const errs = watchConsole(page);
    await open(page, 'member');
    await expect(page.getByTestId('leave-button')).toBeVisible();
    await expect(page.getByTestId('join-button')).toHaveCount(0);
    await expect(page.getByTestId('guest-cta')).toHaveCount(0);
    await scrollThrough(page);
    await expect(page.getByRole('heading', { name: /Учасники \(3\)|Members \(3\)/i })).toBeVisible();
    if (nextOnly(ti.project.name)) await expect(page.locator('main a[href="/chats"]')).toBeVisible(); // documented delta: link to legacy /chats
    else await expect(page.getByRole('button', { name: /Відкрити чат|Open chat/i })).toBeVisible();
    expect(errs).toEqual([]);
    await page.screenshot({ path: `${SHOTS}/member-${ti.project.name}.png`, fullPage: true });
  });

  test('organizer: manage link to the legacy route, no leave button, create-event entry', async ({ page }, ti) => {
    const errs = watchConsole(page);
    await open(page, 'organizer');
    await expect(page.locator(`a[href="/clubs/${IDS.public}/manage"]`)).toBeVisible();
    await expect(page.getByTestId('leave-button')).toHaveCount(0);
    await expect(page.getByTestId('join-button')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Створити подію|Create event/i }).or(page.getByRole('button', { name: /Створити подію|Create event/i }))).toBeVisible();
    expect(errs).toEqual([]);
    await page.screenshot({ path: `${SHOTS}/organizer-${ti.project.name}.png`, fullPage: true });
  });

  test('non-member join request: POST /join {} then pending state; repeated click impossible', async ({ page }) => {
    const errs = watchConsole(page);
    const { log } = await open(page, 'member', IDS.public, { joined: false });
    const join = page.getByTestId('join-button');
    await expect(join).toBeVisible();
    await join.click();
    await expect(page.getByTestId('join-pending')).toBeVisible();
    const posts = log.filter((l) => l.method === 'POST' && /join$/.test(l.path));
    expect(posts).toHaveLength(1);
    expect(posts[0].path).toBe(`/clubs/${IDS.public}/join`);
    expect(JSON.parse(posts[0].body || '{}')).toEqual({});
    await expect(page.locator('[data-sonner-toast], app-toast-container [role="status"], app-toast-container [role="alert"]').first()).toBeVisible();
    expect(errs).toEqual([]);
  });

  test('public club join that is immediate makes the viewer a member (legacy keeps the stale join CTA)', async ({ page }, ti) => {
    const { log } = await open(page, 'member', IDS.public, { joined: false, joinResult: 'member' });
    await page.getByTestId('join-button').click();
    await expect.poll(() => log.filter((l) => l.method === 'POST' && /join$/.test(l.path)).length).toBe(1);
    if (nextOnly(ti.project.name)) {
      await expect(page.getByTestId('leave-button')).toBeVisible();
      await expect(page.getByTestId('join-button')).toHaveCount(0);
    } else {
      // legacy delta (improvement in Next): after an immediate join Angular keeps showing the join CTA until a reload
      await page.waitForTimeout(3000);
      await expect(page.getByTestId('join-button')).toBeVisible();
    }
    expect(log.filter((l) => l.method === 'POST' && !l.path.startsWith('/auth/')).map((l) => l.path)).toEqual([`/clubs/${IDS.public}/join`]);
  });

  test('pending viewer sees the pending button, no join call', async ({ page }) => {
    const { log } = await open(page, 'pending', IDS.public, { joined: false });
    await expect(page.getByTestId('join-pending')).toBeVisible();
    await expect(page.getByTestId('join-button')).toHaveCount(0);
    expect(log.filter((l) => l.method !== 'GET' && !l.path.startsWith('/auth/'))).toEqual([]);
  });

  test('leave: DELETE /leave then the join CTA returns', async ({ page }) => {
    const errs = watchConsole(page);
    const { log } = await open(page, 'member');
    await page.getByTestId('leave-button').click();
    await expect(page.getByTestId('join-button')).toBeVisible();
    await expect(page.getByTestId('leave-button')).toHaveCount(0);
    const del = log.filter((l) => l.method === 'DELETE');
    expect(del.map((l) => l.path)).toEqual([`/clubs/${IDS.public}/leave`]);
    expect(errs).toEqual([]);
  });

  test('join 503: retried once, then an error alert is shown and the page stays', async ({ page }) => {
    const { log } = await open(page, 'member', IDS.public, { joined: false, fail: { 'POST /clubs/:id/join': 503 } });
    await page.getByTestId('join-button').click();
    // both targets retry a 503 once after ~5 s (cold-start handling) before surfacing the error
    await expect(page.getByRole('alert').filter({ hasText: /\S/ }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(new RegExp(`${club()}$`));
    expect(log.filter((l) => l.method === 'POST' && /join$/.test(l.path))).toHaveLength(2);
  });

  test('book vote: vote and unvote call the same endpoints and update the counts; plural forms match', async ({ page }) => {
    const errs = watchConsole(page);
    const { log } = await open(page, 'member');
    const meta = () => page.locator('section', { hasText: /Голосування|Vote/i }).first().innerText();
    const before = await meta();
    expect(before).toMatch(/2\s+голоси/);
    expect(before).toMatch(/\b1\s+голос\s/);
    expect(before).toMatch(/5\s+голосів/);
    expect(before).toMatch(/21\s+голос\s/);
    const buttons = page.getByRole('button', { name: /^Голосувати(\s—.*)?$/ });
    await buttons.first().click();
    await expect.poll(() => log.filter((l) => l.method === 'POST' && /vote$/.test(l.path)).length).toBe(1);
    expect(log.find((l) => l.method === 'POST' && /vote$/.test(l.path))!.path).toBe(`/clubs/${IDS.public}/book-vote/options/opt-1/vote`);
    await expect.poll(meta).toMatch(/3\s+голоси/);
    // second click is the unvote
    await page.getByRole('button', { name: /Проголосовано/ }).click();
    await expect.poll(() => log.filter((l) => l.method === 'DELETE' && /vote$/.test(l.path)).length).toBe(1);
    expect(log.find((l) => l.method === 'DELETE' && /vote$/.test(l.path))!.path).toBe(`/clubs/${IDS.public}/book-vote/options/opt-1/vote`);
    await expect.poll(meta).toMatch(/2\s+голоси/);
    expect(errs).toEqual([]);
  });

  test('book vote: optimistic update shows before the server answers (next), failure rolls back with an error', async ({ page }, ti) => {
    test.skip(!nextOnly(ti.project.name), 'next-only: the optimistic update is a stated requirement for the port');
    const { log } = await open(page, 'member', IDS.public, {}, { 'POST /clubs/:id/book-vote/options/:opt/vote': 1500 });
    const section = page.locator('section', { hasText: /Голосування/ }).first();
    await page.getByRole('button', { name: /^Голосувати(\s—.*)?$/ }).first().click();
    await expect(section).toContainText('3 голоси', { timeout: 800 });
    expect(log.filter((l) => l.method === 'POST')).toHaveLength(1);
    await expect.poll(() => log.filter((l) => l.path.endsWith('/book-vote/round')).length, { timeout: 8000 }).toBeGreaterThan(1);

    const failing = await page.context().newPage();
    const fail = await installApiMock(failing, newState('member', { fail: { 'POST /clubs/:id/book-vote/options/:opt/vote': 503 } }));
    await failing.goto(club());
    await settle(failing);
    await failing.getByRole('button', { name: /^Голосувати(\s—.*)?$/ }).first().click();
    await expect(failing.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 20_000 }); // after the single 503 retry
    await expect(failing.locator('section', { hasText: /Голосування/ }).first()).toContainText('2 голоси');
    expect(fail.log.filter((l) => l.method === 'POST' && /vote$/.test(l.path)).length).toBe(2);
  });

  test('organizer book vote: owner controls (close round, add option) on both', async ({ page }) => {
    await open(page, 'organizer');
    await expect(page.getByRole('button', { name: /Закрити голосування/ })).toBeVisible();
    await expect(page.getByPlaceholder(/Назва книги/)).toBeVisible();
  });
});

test.describe('P7 a11y: tabs, keyboard, focus, contrast', () => {
  test('events tabs: arrow keys, Home/End switch and focus; tablist/tabpanel semantics; history loads include_past', async ({ page }, ti) => {
    const errs = watchConsole(page);
    const { log } = await open(page, 'guest');
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    // the tab stop: Radix focuses the tablist container (focus lands on the active tab), Spartan puts tabindex=0 on the active tab
    await page.getByRole('tablist').first().focus().catch(() => undefined);
    if (!(await tabs.nth(0).evaluate((el) => el === document.activeElement))) await tabs.nth(0).focus();
    await expect(tabs.nth(0)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByText('Минула зустріч')).toBeVisible();
    expect(log.some((l) => l.path === `/clubs/${IDS.public}/events` && /include_past=true/.test(l.query))).toBe(true);
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(0)).toBeFocused();
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(tabs.nth(1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tabs.nth(0)).toBeFocused();
    // aria wiring
    const controls = await tabs.nth(0).getAttribute('aria-controls');
    if (controls) await expect(page.locator(`#${controls}`)).toHaveAttribute('role', 'tabpanel');
    expect(errs).toEqual([]);
    await page.screenshot({ path: `${SHOTS}/tabs-${ti.project.name}.png` });
  });

  test('keyboard: every interactive element in the page content is reachable and shows a visible focus indicator', async ({ page }, ti) => {
    await open(page, 'member');
    await scrollThrough(page);
    await page.getByTestId('club-name').evaluate((el) => (el as HTMLElement).focus?.());
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.evaluate(() => window.scrollTo(0, 0));
    const seen: string[] = [];
    const indicators: string[] = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        if (el.dataset['tabSeen']) return { label: '__cycle__', hasRing: true, inMain: false };
        el.dataset['tabSeen'] = '1';
        const cs = getComputedStyle(el);
        const hasRing = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && cs.boxShadow !== '');
        const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('data-testid') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
        return { label: `${el.tagName.toLowerCase()}:${label}`, hasRing, inMain: !!el.closest('main, app-club-detail, router-outlet + *') };
      });
      if (!info) continue;
      if (info.label === '__cycle__') break;
      seen.push(info.label);
      if (!info.hasRing) indicators.push(info.label);
    }
    console.log(`[${ti.project.name}] tab order: ${seen.join(' > ')}`);
    console.log(`[${ti.project.name}] focused without ring: ${indicators.join(' | ') || 'none'}`);
    expect(seen.length).toBeGreaterThan(14);
    expect(seen.some((l) => /Покинути клуб/.test(l))).toBe(true);
    expect(seen.some((l) => /Голосувати/.test(l))).toBe(true);
    expect(seen.some((l) => /Майбутні/.test(l))).toBe(true);
    // scrollable containers (the events list) are focusable in Chrome on both targets and carry no ring: logged, not counted
    if (nextOnly(ti.project.name)) expect(indicators.filter((l) => !l.startsWith('div:'))).toEqual([]);
  });

  for (const role of ['guest', 'member', 'organizer'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      for (const width of [375, 1280]) {
        test(`axe wcag2a/aa ${role} ${theme} ${width}`, async ({ page, context, baseURL }, ti) => {
          await context.addCookies(LANG_COOKIE(baseURL!, 'uk', theme));
          await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
          await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
          await page.setViewportSize({ width, height: 900 });
          await open(page, role);
          await scrollThrough(page);
          const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
          const serious = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
          console.log(`axe [${ti.project.name}] ${role} ${theme} ${width}: ${r.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length}) ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`).join('; ') || 'none'}`);
          // Pre-existing token contrast issue shared with legacy (see r6-dual.spec.ts 'axe parity'): anything else on Next fails here
          if (nextOnly(ti.project.name)) expect(serious.filter((v) => v.id !== 'color-contrast').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
        });
      }
    }
  }
});

test.describe('P3 states', () => {
  test('next: membership 503 and members 403 do not break the page', async ({ page }, ti) => {
    test.skip(!nextOnly(ti.project.name), 'next-only');
    const errs = watchConsole(page);
    await open(page, 'member', IDS.public, { fail: { 'GET /clubs/:id/my-membership': 503, 'GET /clubs/:id/members': 403 } });
    await expect(page.getByTestId('club-name')).toBeVisible();
    await expect(page.getByText('Новорічна зустріч', { exact: true })).toBeVisible();
    expect(errs).toEqual([]);
  });

  test('next: session-status 503 renders as a guest', async ({ page }, ti) => {
    test.skip(!nextOnly(ti.project.name), 'next-only');
    await open(page, 'guest', IDS.public, { fail: { 'GET /auth/session-status': 503 } });
    await expect(page.getByTestId('club-name')).toBeVisible();
    await expect(page.getByText('Новорічна зустріч', { exact: true })).toBeVisible();
  });
});

test.describe('revalidation hook (next)', () => {
  test.beforeEach(({}, ti) => test.skip(!nextOnly(ti.project.name), 'next-only'));
  const post = (request: import('@playwright/test').APIRequestContext, headers: Record<string, string>, data?: unknown) =>
    request.post('/_internal/revalidate', { headers, data: data ?? { tags: [`club:${IDS.public}`, 'clubs'] }, failOnStatusCode: false });

  test('rejects missing/wrong secret, bad tags, GET; is not shadowed by the /api rewrite', async ({ request }) => {
    expect((await post(request, {})).status()).toBe(401);
    expect((await post(request, { 'x-revalidate-secret': 'nope' })).status()).toBe(401);
    expect((await post(request, { 'x-revalidate-secret': 'parity-secret' }, { tags: ['club:../../etc'] })).status()).toBe(400);
    expect((await post(request, { 'x-revalidate-secret': 'parity-secret' }, { tags: [] })).status()).toBe(400);
    expect((await request.get('/_internal/revalidate', { failOnStatusCode: false })).status()).toBe(405);
    const res = await post(request, { 'x-revalidate-secret': 'parity-secret' });
    expect(res.status()).toBe(200);
    expect(res.headers()['cache-control']).toMatch(/no-store/);
  });

  test('ISR: a backend edit is invisible until the tag is revalidated, then visible on the next request', async ({ request }) => {
    const mutate = (name: string) =>
      request.post('https://localhost:9922/__mutate', { data: { id: IDS.public, patch: { name } }, ignoreHTTPSErrors: true });
    try {
      await request.post('/_internal/revalidate', { headers: { 'x-revalidate-secret': 'parity-secret' }, data: { tags: [`club:${IDS.public}`] } });
      expect(await (await request.get(club())).text()).toContain('Нічні читачі');
      await mutate('Перейменований клуб');
      expect(await (await request.get(club())).text()).not.toContain('Перейменований клуб'); // served from the 600 s cache
      const ok = await request.post('/_internal/revalidate', { headers: { 'x-revalidate-secret': 'parity-secret' }, data: { tags: [`club:${IDS.public}`] } });
      expect(ok.status()).toBe(200);
      await expect.poll(async () => (await (await request.get(club())).text()).includes('Перейменований клуб'), { timeout: 10_000 }).toBe(true);
    } finally {
      await mutate('Нічні читачі');
      await request.post('/_internal/revalidate', { headers: { 'x-revalidate-secret': 'parity-secret' }, data: { tags: [`club:${IDS.public}`] } });
    }
  });
});
