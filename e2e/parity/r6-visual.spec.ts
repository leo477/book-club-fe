// R6 visual parity for /clubs/:id. Baselines come from the legacy project (`--project=legacy --update-snapshots`), the next
// project only compares (see snapshot-guard). Data is the deterministic fixture set in both targets and the timezone is
// pinned to Europe/Kyiv so Angular's browser-zone dates equal Next's fixed-zone dates.
import { test, expect } from './bypass';
import { assertBaselineWritable } from './snapshot-guard';
import { IDS, newState, type Role } from './r6/fixtures';
import { installApiMock, LANG_COOKIE, settle } from './r6/helpers';

const viewports = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
];
const cases: { role: Role; id?: string }[] = [{ role: 'guest' }, { role: 'member' }, { role: 'organizer' }];
const lang = process.env['PARITY_LANG'] ?? 'uk';
const suffix = lang === 'uk' ? '' : `-${lang}`;

test.beforeAll(({}, testInfo) => assertBaselineWritable(testInfo));
test.use({ timezoneId: 'Europe/Kyiv' });

for (const c of cases) {
  for (const theme of ['light', 'dark'] as const) {
    for (const vp of viewports) {
      test(`club-detail ${c.role} ${theme} ${vp.name}`, async ({ page, context, baseURL }) => {
        await context.addCookies(LANG_COOKIE(baseURL!, lang as 'uk' | 'en', theme));
        await page.addInitScript(([t, l]) => { localStorage.setItem('theme', t); localStorage.setItem('lang', l); }, [theme, lang]);
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await installApiMock(page, newState(c.role));
        await page.goto(`/clubs/${c.id ?? IDS.public}`);
        await settle(page);
        // Angular defers the members list until it is scrolled into view
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 80));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(`club-detail-${c.role}-${theme}-${vp.name}${suffix}.png`, {
          fullPage: true,
          // the chat link stand-in (documented delta) and transient UI
          mask: [page.locator('a.fixed[href="/chats"]'), page.locator('[data-sonner-toaster]'), page.locator('app-toast-container')],
        });
      });
    }
  }
}
