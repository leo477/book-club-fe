// R7 parity checks for /events and /events/:id. The target is served by `next dev|start` (no backend needed: every /api/v1 call is
// fulfilled by e2e/parity/r7/fixtures.ts through page.route, so no real backend and no seeded persona is involved).
// Tests marked next-only rely on Next markup (data-testid) and are skipped on the legacy project.
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { expect, test } from './bypass';
import { LANG_COOKIE, watchConsole } from './r6/helpers';
import type { Role } from './r6/fixtures';
import { EVENT_IDS, installEventsMock, type EventsMock } from './r7/fixtures';

const SHOTS = 'playwright-report/parity/r7';
mkdirSync(SHOTS, { recursive: true });

const card = (page: Page, title: string): Locator =>
  page.getByTestId('event-card').filter({ hasText: title });
const attendees = async (c: Locator) =>
  Number(/(\d+) (відвідують|attending)/.exec((await c.innerText()) ?? '')?.[1]);

async function open(
  page: Page,
  role: Role,
  path = '/events',
  opts: Parameters<typeof installEventsMock>[2] = {},
): Promise<EventsMock> {
  const mock = await installEventsMock(page, role, opts);
  await page.goto(path);
  return mock;
}

test.describe('P1/P4 guard', () => {
  test('a guest is replaced to /login on the feed and on the detail, without any events call', async ({
    page,
  }) => {
    for (const path of ['/events', `/events/${EVENT_IDS.soon}`]) {
      const mock = await installEventsMock(page, 'guest');
      await page.goto(path);
      await page.waitForURL(/\/login$/);
      expect(
        mock.log.filter((r) => r.path.startsWith('/events')),
        `events calls for ${path}`,
      ).toEqual([]);
      await page.unroute('**/api/v1/**');
    }
  });
});

test.describe('feed', () => {
  test('renders grouped cards, the first-50 query and the city filter', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    const errors = watchConsole(page);
    const mock = await open(page, 'member');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('event-card')).toHaveCount(4);
    expect(mock.log.filter((r) => r.path === '/events')[0]?.query).toMatch(
      /skip=0/,
    );
    expect(mock.log.filter((r) => r.path === '/events')[0]?.query).toMatch(
      /limit=50/,
    );
    const filter = page.getByRole('combobox');
    await filter
      .selectOption({ label: 'Львів' })
      .catch(() => filter.selectOption('Львів'));
    await expect(page.getByTestId('event-card')).toHaveCount(1);
    await filter.selectOption('');
    await expect(page.getByTestId('event-card')).toHaveCount(4);
    expect(errors).toEqual([]);
  });

  test('tabs: roving tabindex, ArrowRight/ArrowLeft wrap, Home and End move focus and selection', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'member');
    const tablist = page.getByRole('tablist');
    const upcoming = tablist.getByRole('tab').nth(0);
    const mine = tablist.getByRole('tab').nth(1);
    await expect(upcoming).toHaveAttribute('aria-selected', 'true');
    await expect(upcoming).toHaveAttribute('tabindex', '0');
    await expect(mine).toHaveAttribute('tabindex', '-1');

    await upcoming.focus();
    await page.keyboard.press('ArrowRight');
    await expect(mine).toBeFocused();
    await expect(mine).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveAccessibleName(
      await mine.innerText().then((t) => new RegExp(t.split('\n')[0]!.trim())),
    );
    await page.keyboard.press('ArrowRight');
    await expect(upcoming).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(mine).toBeFocused();
    await page.keyboard.press('Home');
    await expect(upcoming).toBeFocused();
    await expect(upcoming).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(mine).toBeFocused();
    await expect(mine).toHaveAttribute('aria-selected', 'true');
    await expect(tablist.getByRole('tab', { selected: true })).toHaveCount(1);
  });

  test('countdown timer is shown only for events starting within 3 days', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'member');
    await expect(page.getByTestId('event-card')).toHaveCount(4);
    await expect(card(page, 'Скоро зустріч').getByRole('timer')).toHaveText(
      /^\d+d \d+h \d+m \d+s$/,
    );
    await expect(card(page, 'Далека зустріч').getByRole('timer')).toHaveCount(
      0,
    );
    await expect(card(page, 'Вже почалась').getByRole('timer')).toHaveCount(0);
    await expect(page.getByRole('timer')).toHaveCount(1);
    const first = await card(page, 'Скоро зустріч')
      .getByRole('timer')
      .innerText();
    await expect
      .poll(async () =>
        card(page, 'Скоро зустріч').getByRole('timer').innerText(),
      )
      .not.toBe(first);
  });

  test('an event that already started has a disabled closed-registration button', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'member');
    await expect(
      card(page, 'Вже почалась').getByTestId('event-rsvp-button'),
    ).toBeDisabled();
  });

  test('a load failure shows an alert and no cards', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await installEventsMock(page, 'member');
    await page.route('**/api/v1/events?*', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"detail":"boom"}',
      }),
    );
    await page.goto('/events');
    await expect(
      page.getByRole('alert').filter({ hasText: /\S/ }).first(),
    ).toBeVisible();
    await expect(page.getByTestId('event-card')).toHaveCount(0);
  });
});

test.describe('RSVP', () => {
  test('optimistic: the count and button flip before the server answers, then stay after the refetch; cancel flips back', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    const mock = await open(page, 'member', '/events', {
      latency: { 'POST /events/:id/attend': 800 },
    });
    const c = card(page, 'Далека зустріч');
    await expect(c).toBeVisible();
    expect(await attendees(c)).toBe(2);
    await c.getByTestId('event-rsvp-button').click();
    await expect(c.getByTestId('event-rsvp-button')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(c).toContainText('3 відвідують');
    expect(
      mock.events[EVENT_IDS.far]!.isAttending,
      'server has not answered yet',
    ).toBe(false);
    await expect(c.getByTestId('event-rsvp-button')).not.toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(c.getByTestId('event-rsvp-button')).toContainText('✓');
    expect(await attendees(c)).toBe(3);
    expect(
      mock.log.filter((r) => r.method === 'POST' && r.path.endsWith('/attend')),
    ).toHaveLength(1);

    await c.getByTestId('event-rsvp-button').click();
    await expect(c.getByTestId('event-rsvp-button')).not.toContainText('✓');
    expect(await attendees(c)).toBe(2);
    expect(mock.log.filter((r) => r.method === 'DELETE')).toHaveLength(1);
  });

  test('rollback: a 400 restores the count and the button and shows the registration-closed toast; the other card is untouched', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'member', '/events', {
      latency: { 'POST /events/:id/attend': 500 },
      fail: { 'POST /events/:id/attend': 400 },
    });
    const c = card(page, 'Далека зустріч');
    const other = card(page, 'Скоро зустріч');
    await expect(other).toBeVisible();
    await c.getByTestId('event-rsvp-button').click();
    await expect(c).toContainText('3 відвідують');
    await expect(
      page
        .locator('[data-sonner-toast]')
        .filter({ hasText: 'Реєстрація закрита' }),
    ).toBeVisible();
    expect(await attendees(c)).toBe(2);
    await expect(c.getByTestId('event-rsvp-button')).not.toContainText('✓');
    await expect(c.getByTestId('event-rsvp-button')).not.toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(await attendees(other)).toBe(2);
  });

  test('My events lists the attended event and its count badge after RSVP', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'member');
    await card(page, 'Далека зустріч').getByTestId('event-rsvp-button').click();
    const mine = page.getByRole('tablist').getByRole('tab').nth(1);
    await expect(mine).toContainText('1');
    await mine.click();
    await expect(page.getByTestId('event-card')).toHaveCount(1);
    await expect(page.getByTestId('event-card')).toContainText(
      'Далека зустріч',
    );
  });
});

test.describe('detail', () => {
  test('renders the event, requests it once, RSVP is optimistic and rolls back on 400', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    const mock = await open(page, 'member', `/events/${EVENT_IDS.far}`, {
      latency: { 'POST /events/:id/attend': 500 },
      fail: { 'POST /events/:id/attend': 400 },
    });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Далека зустріч' }),
    ).toBeVisible();
    expect(
      mock.log.filter((r) => r.path === `/events/${EVENT_IDS.far}`),
    ).toHaveLength(1);
    const btn = page.getByTestId('event-rsvp-button');
    await btn.click();
    await expect(page.getByText('2 відвідують')).toHaveCount(0);
    await expect(page.getByText('3 відвідують')).toBeVisible();
    await expect(
      page
        .locator('[data-sonner-toast]')
        .filter({ hasText: 'Реєстрація закрита' }),
    ).toBeVisible();
    await expect(page.getByText('2 відвідують')).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('an upper-case id is lower-cased for the fetch', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    const mock = await open(
      page,
      'member',
      `/events/${EVENT_IDS.far.toUpperCase()}`,
    );
    await expect(
      page.getByRole('heading', { level: 1, name: 'Далека зустріч' }),
    ).toBeVisible();
    expect(mock.log.some((r) => r.path === `/events/${EVENT_IDS.far}`)).toBe(
      true,
    );
  });

  test('a missing event shows the error with a way back', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'member', `/events/${EVENT_IDS.missing}`);
    await expect(
      page.getByRole('alert').filter({ hasText: /\S/ }),
    ).toBeVisible();
    await page
      .getByRole('link', { name: /До подій|Back to Events/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/events$/);
  });

  test('organizer controls only for the organizer; cancel needs confirmation', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'organizer', `/events/${EVENT_IDS.far}`);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Далека зустріч' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Редагувати подію' }),
    ).toHaveAttribute('href', `/events/${EVENT_IDS.far}/edit`);
    await page.getByRole('button', { name: 'Скасувати подію' }).click();
    await expect(page.getByText('Скасувати цю подію?')).toBeVisible();
    await page.getByRole('button', { name: 'Скасувати', exact: true }).click();
    await expect(page.getByText('Скасувати цю подію?')).toHaveCount(0);
  });

  test('a member sees no organizer controls', async ({ page }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    await open(page, 'member', `/events/${EVENT_IDS.far}`);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Далека зустріч' }),
    ).toBeVisible();
    await expect(page.getByText('Управління організатора')).toHaveCount(0);
  });

  test('no coordinates: no maps key request and no map', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    const mock = await open(page, 'member', `/events/${EVENT_IDS.far}`, {
      mapsKey: 'key',
    });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(mock.log.filter((r) => r.path === '/config/maps-key')).toHaveLength(
      0,
    );
  });

  test('map failure: key endpoint 404 renders nothing and the page stays usable', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    const errors = watchConsole(page);
    const mock = await open(page, 'member', `/events/${EVENT_IDS.withMap}`, {
      mapsKey: 'none',
    });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Зустріч з картою' }),
    ).toBeVisible();
    await expect
      .poll(() => mock.log.filter((r) => r.path === '/config/maps-key').length)
      .toBe(1);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /Google Maps/ })).toHaveCount(
      0,
    );
    await expect(page.locator('.gm-style')).toHaveCount(0);
    await expect(page.getByTestId('event-rsvp-button')).toBeEnabled();
    expect(errors).toEqual([]);
  });

  test('map failure: the Maps script cannot load, renders nothing, page stays usable and nothing is thrown', async ({
    page,
  }, ti) => {
    test.skip(ti.project.name !== 'next', 'next-only');
    const errors = watchConsole(page, [
      /maps\.googleapis|Google Maps JavaScript API|ERR_FAILED|net::/,
    ]);
    await page.route(
      (url) =>
        url.hostname === 'maps.googleapis.com' ||
        url.hostname === 'maps.gstatic.com',
      (route) => route.abort(),
    );
    const mock = await open(page, 'member', `/events/${EVENT_IDS.withMap}`, {
      mapsKey: 'key',
    });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Зустріч з картою' }),
    ).toBeVisible();
    await expect
      .poll(() => mock.log.filter((r) => r.path === '/config/maps-key').length)
      .toBe(1);
    await expect(page.getByRole('link', { name: /Google Maps/ })).toHaveCount(
      0,
      { timeout: 15_000 },
    );
    await expect(page.locator('.gm-style')).toHaveCount(0);
    await expect(page.getByTestId('event-rsvp-button')).toBeEnabled();
    expect(errors).toEqual([]);
  });
});

for (const lang of ['uk', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`axe ${lang} ${theme}`, () => {
      for (const [name, path] of [
        ['feed', '/events'],
        ['detail', `/events/${EVENT_IDS.soon}`],
      ] as const) {
        test(`${name}: wcag2a/2aa/22aa, no critical or serious except colour contrast (reported separately)`, async ({
          page,
          context,
          baseURL,
        }, ti) => {
          test.skip(ti.project.name !== 'next', 'next-only');
          await context.addCookies(LANG_COOKIE(baseURL!, lang, theme));
          await open(page, 'member', path);
          await expect(
            name === 'feed'
              ? page.getByTestId('event-card').first()
              : page.getByRole('heading', { level: 1, name: 'Скоро зустріч' }),
          ).toBeVisible();
          await page.waitForLoadState('networkidle');
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();
          const summary = results.violations.map(
            (v) =>
              `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes
                .slice(0, 4)
                .map(
                  (n) =>
                    n.target.join(' ').slice(-70) +
                    (v.id === 'color-contrast'
                      ? ` [${(n.any[0]?.data as { contrastRatio?: number; fgColor?: string; bgColor?: string } | undefined)?.contrastRatio} ${(n.any[0]?.data as { fgColor?: string } | undefined)?.fgColor}/${(n.any[0]?.data as { bgColor?: string } | undefined)?.bgColor}]`
                      : ''),
                )
                .join(' | ')}`,
          );
          console.log(
            `[axe ${name} ${lang} ${theme}] ${summary.length ? summary.join('\n  ') : 'no violations'}`,
          );
          await page.screenshot({
            path: `${SHOTS}/axe-${name}-${lang}-${theme}.png`,
            fullPage: true,
          });
          const structural = results.violations.filter(
            (v) =>
              v.id !== 'color-contrast' &&
              (v.impact === 'serious' || v.impact === 'critical'),
          );
          expect(structural.map((v) => v.id)).toEqual([]);
        });
      }
    });
  }
}
