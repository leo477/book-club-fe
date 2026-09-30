// R6 checks that compare the two targets inside one test: request-set (HAR) diffs per journey, rendered <head> parity and
// axe node counts. Runs once (in the `next` project) and opens its own legacy context. Both sides are fed by
// e2e/parity/r6/fixtures.ts through page.route, so the data is identical and no real backend is reached.
import AxeBuilder from '@axe-core/playwright';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { parityTargets } from '../../playwright.parity.config';
import { expect, test } from './bypass';
import { diff, signatures, type AllowEntry } from './har-signature';
import { extractSeo, jsonLdTypes } from './html-meta';
import { IDS, newState, type MockState, type Role } from './r6/fixtures';
import { installApiMock, LANG_COOKIE, settle } from './r6/helpers';

const OUT = 'playwright-report/parity/r6';
mkdirSync(OUT, { recursive: true });
const club = `/clubs/${IDS.public}`;

interface Side {
  name: 'legacy' | 'next';
  ctx: BrowserContext;
  page: Page;
  state: MockState;
  entries: { request: { method: string; url: string; postData?: { text?: string } } }[];
  origin: string;
}

async function side(browser: Browser, name: 'legacy' | 'next', role: Role, over: Parameters<typeof newState>[1] = {}, theme: 'light' | 'dark' = 'light'): Promise<Side> {
  const base = parityTargets[name];
  const ctx = await browser.newContext({
    baseURL: base,
    bypassCSP: name === 'legacy' && process.env['PARITY_LEGACY_BYPASS_CSP'] === '1',
    timezoneId: 'Europe/Kyiv',
    viewport: { width: 1280, height: 900 },
    colorScheme: theme,
  });
  await ctx.addCookies(LANG_COOKIE(base, 'uk', theme));
  await ctx.addInitScript(([t]) => { localStorage.setItem('lang', 'uk'); localStorage.setItem('theme', t); }, [theme]);
  const state = newState(role, over);
  await installApiMock(ctx, state);
  const page = await ctx.newPage();
  const entries: Side['entries'] = [];
  page.on('request', (r) => entries.push({ request: { method: r.method(), url: r.url(), postData: r.postData() ? { text: r.postData()! } : undefined } }));
  return { name, ctx, page, state, entries, origin: new URL(base).origin };
}

const sigs = (s: Side) => signatures(s.entries, s.origin);

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

const journeys: Record<string, { role: Role; over?: Parameters<typeof newState>[1]; steps: (p: Page) => Promise<void> }> = {
  'r6-guest-view': {
    role: 'guest',
    steps: async (p) => {
      await p.goto(club);
      await settle(p);
      await scrollThrough(p);
    },
  },
  'r6-guest-history-tab': {
    role: 'guest',
    steps: async (p) => {
      await p.goto(club);
      await settle(p);
      await p.getByRole('tab').nth(1).click();
      await expect(p.getByText('Минула зустріч')).toBeVisible();
    },
  },
  'r6-member-vote': {
    role: 'member',
    steps: async (p) => {
      await p.goto(club);
      await settle(p);
      await scrollThrough(p);
      await p.getByRole('button', { name: /^Голосувати$/ }).first().click();
      await p.getByRole('button', { name: /Проголосовано/ }).waitFor();
      await p.waitForTimeout(800);
      await p.getByRole('button', { name: /Проголосовано/ }).click();
      await p.getByRole('button', { name: /^Голосувати$/ }).first().waitFor();
      await p.waitForTimeout(800);
    },
  },
  'r6-join': {
    role: 'member',
    over: { joined: false },
    steps: async (p) => {
      await p.goto(club);
      await settle(p);
      await p.getByTestId('join-button').click();
      await p.getByTestId('join-pending').waitFor();
      await p.waitForTimeout(800);
    },
  },
  'r6-leave': {
    role: 'member',
    steps: async (p) => {
      await p.goto(club);
      await settle(p);
      await p.getByTestId('leave-button').click();
      await p.getByTestId('join-button').waitFor();
      await p.waitForTimeout(800);
    },
  },
  'r6-organizer-view': {
    role: 'organizer',
    steps: async (p) => {
      await p.goto(club);
      await settle(p);
      await scrollThrough(p);
    },
  },
};

function loadAllowlist(name: string): AllowEntry[] {
  try {
    return (JSON.parse(readFileSync(path.join(process.cwd(), 'e2e', 'parity', 'allowlists', `${name}.json`), 'utf-8')) as { ignore: AllowEntry[] }).ignore;
  } catch {
    return [];
  }
}

test.describe('r6 dual-target', () => {
  test.beforeEach(({}, ti) => test.skip(ti.project.name !== 'next', 'runs both targets itself'));

  for (const [name, j] of Object.entries(journeys)) {
    test(`HAR diff ${name}`, async ({ browser }) => {
      test.setTimeout(120_000);
      const legacy = await side(browser, 'legacy', j.role, j.over);
      const next = await side(browser, 'next', j.role, j.over);
      try {
        await j.steps(legacy.page);
        await j.steps(next.page);
      } finally {
        await legacy.ctx.close();
        await next.ctx.close();
      }
      const l = sigs(legacy);
      const n = sigs(next);
      const stale: string[] = [];
      const problems = diff(l, n, loadAllowlist(name), stale);
      writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({ legacy: l, next: n, problems, stale, unhandled: { legacy: legacy.state.unhandled, next: next.state.unhandled } }, null, 2));
      console.log(`HAR ${name}: legacy=${l.length} next=${n.length} unallowlisted=${problems.length} stale=${stale.length}`);
      for (const p of problems) console.log(`  DIFF ${p}`);
      for (const p of stale) console.log(`  STALE ${p}`);
      expect(problems).toEqual([]);
    });
  }

  test('rendered head after hydration: legacy vs next (title, description, canonical, og, JSON-LD)', async ({ browser }) => {
    const snap = async (name: 'legacy' | 'next') => {
      const s = await side(browser, name, 'guest');
      await s.page.goto(club);
      await settle(s.page);
      const html = await s.page.content();
      const seo = extractSeo(html);
      await s.ctx.close();
      return seo;
    };
    const legacy = await snap('legacy');
    const next = await snap('next');
    writeFileSync(path.join(OUT, 'rendered-head.json'), JSON.stringify({ legacy, next }, null, 2));
    console.log('rendered head legacy:', JSON.stringify({ ...legacy, jsonLd: jsonLdTypes(legacy.jsonLd) }));
    console.log('rendered head next:  ', JSON.stringify({ ...next, jsonLd: jsonLdTypes(next.jsonLd) }));
    expect(next.title).toBe(legacy.title);
    expect(next.description).toBe(legacy.description);
    expect(next.ogTitle).toBe(legacy.ogTitle);
    expect(next.canonical).toBe(legacy.canonical);
    // JSON-LD: Angular emits a single Organization, Next an @graph with the same Organization fields (+ Event nodes)
    const legacyOrg = JSON.parse(legacy.jsonLd.find((b) => b.includes(IDS.public))!) as Record<string, unknown>;
    const nextGraph = (JSON.parse(next.jsonLd.find((b) => b.includes(IDS.public))!) as { '@graph': Record<string, unknown>[] })['@graph'];
    const nextOrg = nextGraph.find((n) => n['@type'] === 'Organization')!;
    for (const key of ['name', 'description', 'url', 'image', 'address', 'foundingDate', 'keywords']) expect(nextOrg[key], key).toEqual(legacyOrg[key]);
  });

  test('dates: Next pins Europe/Kyiv, Angular follows the viewer timezone (documented delta)', async ({ browser }) => {
    const read = async (name: 'legacy' | 'next', timezoneId: string) => {
      const ctx = await browser.newContext({ baseURL: parityTargets[name], timezoneId, bypassCSP: name === 'legacy' && process.env['PARITY_LEGACY_BYPASS_CSP'] === '1' });
      await ctx.addCookies(LANG_COOKIE(parityTargets[name], 'uk', 'light'));
      await installApiMock(ctx);
      const page = await ctx.newPage();
      await page.goto(club);
      await settle(page);
      const text = await page.getByText(/\d{1,2} (січня|грудня) 2026|\d{1,2} січня 2027/).first().innerText();
      await ctx.close();
      return text.replace(/\s+/g, ' ').trim();
    };
    const got = {
      'legacy/Kyiv': await read('legacy', 'Europe/Kyiv'),
      'legacy/Los_Angeles': await read('legacy', 'America/Los_Angeles'),
      'next/Kyiv': await read('next', 'Europe/Kyiv'),
      'next/Los_Angeles': await read('next', 'America/Los_Angeles'),
    };
    console.log('date delta:', JSON.stringify(got));
    writeFileSync(path.join(OUT, 'date-timezone.json'), JSON.stringify(got, null, 2));
    expect(got['next/Kyiv']).toBe(got['next/Los_Angeles']);
    expect(got['legacy/Kyiv']).toBe(got['next/Kyiv']);
  });

  for (const role of ['guest', 'member', 'organizer'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test(`axe parity ${role} ${theme}: Next has no rule and no more nodes than legacy`, async ({ browser }) => {
        const run = async (name: 'legacy' | 'next') => {
          const s = await side(browser, name, role, {}, theme);
          await s.page.goto(club);
          await settle(s.page);
          await scrollThrough(s.page);
          const r = await new AxeBuilder({ page: s.page }).withTags(['wcag2a', 'wcag2aa']).analyze();
          await s.ctx.close();
          return r.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => ({ id: v.id, nodes: v.nodes.length }));
        };
        const legacy = await run('legacy');
        const next = await run('next');
        console.log(`axe parity ${role} ${theme}: legacy=${JSON.stringify(legacy)} next=${JSON.stringify(next)}`);
        for (const v of next) {
          const l = legacy.find((x) => x.id === v.id);
          expect(l, `${v.id} exists only on Next`).toBeTruthy();
          expect(v.nodes, v.id).toBeLessThanOrEqual(l!.nodes);
        }
      });
    }
  }
});
