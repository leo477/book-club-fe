// R9 parity checks for /login, /register and /auth/callback, run against BOTH targets (playwright projects `legacy` = Angular
// and `next`). Every /api/v1 call is fulfilled by e2e/parity/r9/fixtures.ts through page.route (cookie-session mock: a boolean
// stands in for the httpOnly cookie). No backend, no real credential, no real account: the deployed Angular site is only used as
// a front end, and its API and Google start URL are intercepted. /events (the hard-navigation target) is a stub document.
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from './bypass';
import { LANG_COOKIE, watchConsole } from './r6/helpers';
import {
  ACCESS,
  BOOM_EMAIL,
  GOOD,
  GOOD_CODE,
  REFRESH,
  TAKEN_EMAIL,
  installAuthMock,
  type AuthMock,
} from './r9/fixtures';

const SHOTS = 'playwright-report/parity/r9';
mkdirSync(SHOTS, { recursive: true });

type Lang = 'uk' | 'en';
const L = {
  required: { uk: /Це поле є обов'язковим\./, en: /This field is required\./ },
  email: {
    uk: /Введіть коректну адресу електронної пошти\./,
    en: /Please enter a valid email address\./,
  },
  min8: { uk: /Мінімум 8 символів\./, en: /Minimum 8 characters required\./ },
  anyMin: {
    uk: /Мінімум \d+ символів\./,
    en: /Minimum \d+ characters required\./,
  },
  invalidCreds: {
    uk: /Невірний email або пароль\./,
    en: /Invalid email or password\./,
  },
  noMatch: { uk: /Паролі не збігаються/, en: /Passwords do not match/ },
  weak: { uk: /^\s*Слабкий\s*$/, en: /^\s*Weak\s*$/ },
  medium: { uk: /^\s*Середній\s*$/, en: /^\s*Medium\s*$/ },
  strong: { uk: /^\s*Надійний\s*$/, en: /^\s*Strong\s*$/ },
  created: {
    uk: /Акаунт успішно створено!/,
    en: /Account created successfully!/,
  },
  oauthFailed: {
    uk: /Не вдалося увійти через Google/,
    en: /Google sign-in failed/,
  },
  signIn: { uk: 'Увійти', en: 'Sign in' },
  create: { uk: 'Створити акаунт', en: 'Create account' },
} as const;

const proj = () => test.info().project.name;
const TOKEN_LIKE = /token|jwt|MOCK-(ACCESS|REFRESH)|eyJ[A-Za-z0-9_-]{8,}/i;

async function open(
  page: Page,
  path: string,
  opts: Parameters<typeof installAuthMock>[2] = {},
  lang: Lang = 'uk',
  theme: 'light' | 'dark' = 'light',
): Promise<AuthMock> {
  const mock = await installAuthMock(page, proj(), opts);
  await page
    .context()
    .addCookies(LANG_COOKIE(test.info().project.use.baseURL!, lang, theme));
  await page.goto(path);
  await hydrated(page);
  return mock;
}

/** Next dev hydrates late: text typed before React attaches to the form is wiped by the form defaults, so wait for it. */
async function hydrated(page: Page): Promise<void> {
  if (proj() !== 'next') return;
  await page.waitForFunction(() => {
    const f = document.querySelector('form');
    return !f || Object.keys(f).some((k) => k.startsWith('__reactProps'));
  });
}

const calls = (m: AuthMock, method: string, path: string) =>
  m.log.filter((r) => r.method === method && r.path === path);
const submit = (page: Page) => page.locator('form button[type="submit"]');

/** Every localStorage/sessionStorage key+value and every readable cookie that looks like a credential. */
async function tokenLeaks(page: Page): Promise<string[]> {
  return page.evaluate((reSrc) => {
    const re = new RegExp(reSrc, 'i');
    const out: string[] = [];
    for (const [name, store] of [
      ['localStorage', localStorage],
      ['sessionStorage', sessionStorage],
    ] as const)
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i)!;
        const v = store.getItem(k) ?? '';
        if (re.test(k) || re.test(v)) out.push(`${name}:${k}`);
      }
    for (const c of document.cookie
      .split(';')
      .map((x) => x.trim())
      .filter(Boolean))
      if (re.test(c)) out.push(`cookie:${c.split('=')[0]}`);
    return out;
  }, TOKEN_LIKE.source);
}

async function fillLogin(page: Page, email: string, password: string) {
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
}

async function fillRegister(
  page: Page,
  over: Partial<Record<'name' | 'email' | 'pw' | 'confirm', string>> = {},
) {
  await page.locator('#reg-display-name').fill(over.name ?? 'Ада Лавлейс');
  await page
    .locator('#reg-email')
    .fill(over.email ?? 'new.reader@example.test');
  await page.locator('#reg-password').fill(over.pw ?? 'Sup3rSecret!');
  await page
    .locator('#reg-confirm-password')
    .fill(over.confirm ?? over.pw ?? 'Sup3rSecret!');
}

for (const lang of ['uk', 'en'] as const) {
  test.describe(`/login ${lang}`, () => {
    test('renders ids, heading, google button and register link; a guest costs one session-status and no /auth/me', async ({
      page,
    }) => {
      const errors = watchConsole(page);
      const mock = await open(page, '/login', {}, lang);
      await expect(page.locator('#login-email')).toBeVisible();
      await expect(page.locator('#login-password')).toBeVisible();
      await expect(page.locator('#login-email')).toHaveAttribute(
        'type',
        'email',
      );
      await expect(page.locator('#login-password')).toHaveAttribute(
        'type',
        'password',
      );
      await expect(
        page.getByRole('heading', { level: 2, name: L.signIn[lang] }),
      ).toBeVisible();
      await expect(page.locator('a[href="/register"]')).toBeVisible();
      await expect(page.getByTestId('login-error')).toHaveCount(0);
      await page.waitForLoadState('networkidle');
      expect(calls(mock, 'GET', '/auth/session-status')).toHaveLength(1);
      expect(calls(mock, 'GET', '/auth/me')).toHaveLength(0);
      expect(calls(mock, 'POST', '/auth/refresh')).toHaveLength(0);
      expect(errors).toEqual([]);
    });

    test('validation: empty submit shows required x2 and sends nothing; bad email; short password', async ({
      page,
    }) => {
      const mock = await open(page, '/login', {}, lang);
      await submit(page).click();
      await expect(page.getByText(L.required[lang])).toHaveCount(2);
      expect(calls(mock, 'POST', '/auth/login')).toHaveLength(0);
      await page.locator('#login-email').fill('not-an-email');
      await page.locator('#login-email').blur();
      await expect(page.getByText(L.email[lang])).toBeVisible();
      await page.locator('#login-password').fill('short');
      await page.locator('#login-password').blur();
      await expect(page.getByText(L.min8[lang])).toBeVisible();
      await submit(page).click();
      expect(calls(mock, 'POST', '/auth/login')).toHaveLength(0);
      if (proj() === 'next') {
        await expect(page.locator('#login-email')).toHaveAttribute(
          'aria-invalid',
          'true',
        );
        await expect(page.locator('#login-password')).toHaveAttribute(
          'aria-invalid',
          'true',
        );
      }
    });

    test('success: one POST /auth/login {email,password}, hard navigation to /events', async ({
      page,
    }) => {
      const mock = await open(page, '/login', {}, lang);
      await fillLogin(page, GOOD.email, GOOD.password);
      await submit(page).click();
      await expect(page).toHaveURL(/\/events$/);
      const posts = calls(mock, 'POST', '/auth/login');
      expect(posts).toHaveLength(1);
      expect(JSON.parse(posts[0]!.body!)).toEqual({
        email: GOOD.email,
        password: GOOD.password,
      });
      // Next: document request to /events (hard navigation). Angular: SPA router.navigate (no document request).
      const hard = mock.log.some((r) => r.method === 'NAV');
      test
        .info()
        .annotations.push({
          type: 'nav',
          description: hard
            ? 'hard navigation (document request)'
            : 'SPA navigation',
        });
      if (proj() === 'next') expect(hard).toBe(true);
    });

    test('in flight: the submit button is disabled and a double click posts once', async ({
      page,
    }) => {
      const mock = await open(
        page,
        '/login',
        { latency: { 'POST /auth/login': 700 } },
        lang,
      );
      await fillLogin(page, GOOD.email, GOOD.password);
      await submit(page).click();
      await expect(submit(page)).toBeDisabled();
      await submit(page)
        .click({ force: true, timeout: 1_000 })
        .catch(() => undefined);
      await expect(page).toHaveURL(/\/events$/);
      expect(calls(mock, 'POST', '/auth/login')).toHaveLength(1);
    });

    test('wrong credentials: login-error alert with the localized message, stays on /login, button re-enabled, retry succeeds', async ({
      page,
    }) => {
      const mock = await open(page, '/login', {}, lang);
      await fillLogin(page, GOOD.email, 'WrongPassword9');
      await submit(page).click();
      const alert = page.getByTestId('login-error');
      await expect(alert).toBeVisible();
      await expect(alert).toHaveText(L.invalidCreds[lang]);
      await expect(alert).toHaveAttribute('role', 'alert');
      await expect(page).toHaveURL(/\/login$/);
      await expect(submit(page)).toBeEnabled();
      await page.locator('#login-password').fill(GOOD.password);
      await submit(page).click();
      await expect(page).toHaveURL(/\/events$/);
      expect(calls(mock, 'POST', '/auth/login')).toHaveLength(2);
    });

    test('server error 500: login-error is shown with the backend message, no navigation', async ({
      page,
    }) => {
      await open(page, '/login', {}, lang);
      await fillLogin(page, BOOM_EMAIL, GOOD.password);
      await submit(page).click();
      await expect(page.getByTestId('login-error')).toContainText(
        'Server exploded',
      );
      await expect(page).toHaveURL(/\/login$/);
    });

    test('Google button: full-page navigation to <oauth base>/auth/oauth/google?origin=<this origin>', async ({
      page,
      baseURL,
    }) => {
      const mock = await open(page, '/login', {}, lang);
      await page.getByRole('button', { name: /Google/ }).click();
      await expect.poll(() => mock.googleUrls.length).toBeGreaterThan(0);
      const u = new URL(mock.googleUrls[0]!);
      expect(u.pathname).toMatch(/\/auth\/oauth\/google$/);
      expect(u.searchParams.get('origin')).toBe(new URL(baseURL!).origin);
      expect([...u.searchParams.keys()]).toEqual(['origin']);
      test
        .info()
        .annotations.push({ type: 'google', description: mock.googleUrls[0]! });
    });

    test('a signed-in visitor: the form still renders (no redirect) with a back-home link; refresh/me cost recorded', async ({
      page,
    }) => {
      const mock = await open(page, '/login', { session: true }, lang);
      await expect(page.locator('#login-email')).toBeVisible();
      await expect(page.locator('a[href="/events"]')).toBeVisible();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/login$/);
      test.info().annotations.push({
        type: 'p2',
        description: `signed-in /login load: session-status x${calls(mock, 'GET', '/auth/session-status').length}, refresh x${calls(mock, 'POST', '/auth/refresh').length}, me x${calls(mock, 'GET', '/auth/me').length}`,
      });
    });
  });

  test.describe(`/register ${lang}`, () => {
    test('renders ids, role cards (reader pressed), google button and login link', async ({
      page,
    }) => {
      const errors = watchConsole(page);
      await open(page, '/register', {}, lang);
      for (const id of [
        '#reg-display-name',
        '#reg-email',
        '#reg-password',
        '#reg-confirm-password',
      ])
        await expect(page.locator(id)).toBeVisible();
      const pressed = page.locator('button[aria-pressed]');
      await expect(pressed).toHaveCount(2);
      await expect(pressed.first()).toHaveAttribute('aria-pressed', 'true');
      await expect(pressed.nth(1)).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
      await expect(page.locator('a[href="/login"]')).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });

    test('validation: required, min length, email testid, password min, mismatch; nothing is sent', async ({
      page,
    }) => {
      const mock = await open(page, '/register', {}, lang);
      await submit(page).click();
      await expect(page.getByText(L.required[lang]).first()).toBeVisible();
      expect(calls(mock, 'POST', '/auth/register')).toHaveLength(0);
      await page.locator('#reg-display-name').fill('a');
      await page.locator('#reg-display-name').blur();
      await expect(page.getByText(L.anyMin[lang])).toBeVisible();
      await page.locator('#reg-email').fill('not-an-email');
      await page.locator('#reg-email').blur();
      await expect(page.getByTestId('register-email-error')).toBeVisible();
      await expect(page.getByTestId('register-email-error')).toHaveText(
        L.email[lang],
      );
      await page.locator('#reg-password').fill('Sup3rSecret!');
      await page.locator('#reg-confirm-password').fill('Different1!');
      await page.locator('#reg-confirm-password').blur();
      await expect(page.getByText(L.noMatch[lang])).toBeVisible();
      await submit(page).click();
      expect(calls(mock, 'POST', '/auth/register')).toHaveLength(0);
      await page.locator('#reg-confirm-password').fill('Sup3rSecret!');
      await page.locator('#reg-confirm-password').blur();
      await expect(page.getByText(L.noMatch[lang])).toHaveCount(0);
    });

    test('password strength: weak (<8), medium (1 class), strong (2+ classes)', async ({
      page,
    }) => {
      await open(page, '/register', {}, lang);
      const pw = page.locator('#reg-password');
      await pw.fill('abc');
      await expect(page.getByText(L.weak[lang])).toBeVisible();
      await pw.fill('abcdefgh1');
      await expect(page.getByText(L.medium[lang])).toBeVisible();
      await pw.fill('abcdefG1!');
      await expect(page.getByText(L.strong[lang])).toBeVisible();
    });

    test('role cards toggle aria-pressed', async ({ page }) => {
      await open(page, '/register', {}, lang);
      const pressed = page.locator('button[aria-pressed]');
      await pressed.nth(1).click();
      await expect(pressed.nth(1)).toHaveAttribute('aria-pressed', 'true');
      await expect(pressed.first()).toHaveAttribute('aria-pressed', 'false');
    });

    test('success: POST /auth/register without confirmPassword, welcome card with the name, then /events', async ({
      page,
    }) => {
      const mock = await open(page, '/register', {}, lang);
      await fillRegister(page);
      await page.locator('button[aria-pressed]').nth(1).click();
      await submit(page).click();
      const card = page.getByTestId('register-feedback');
      await expect(card).toBeVisible();
      await expect(card).toContainText(L.created[lang]);
      await expect(card).toContainText('Ада Лавлейс');
      const posts = calls(mock, 'POST', '/auth/register');
      expect(posts).toHaveLength(1);
      expect(JSON.parse(posts[0]!.body!)).toEqual({
        displayName: 'Ада Лавлейс',
        email: 'new.reader@example.test',
        password: 'Sup3rSecret!',
        role: 'organizer',
      });
      await expect(page).toHaveURL(/\/events$/, { timeout: 15_000 });
    });

    test('in flight: submit disabled while the request runs, a double click posts once', async ({
      page,
    }) => {
      const mock = await open(
        page,
        '/register',
        { latency: { 'POST /auth/register': 700 } },
        lang,
      );
      await fillRegister(page);
      await submit(page).click();
      await expect(submit(page)).toBeDisabled();
      await submit(page)
        .click({ force: true, timeout: 1_000 })
        .catch(() => undefined);
      await expect(page.getByTestId('register-feedback')).toBeVisible();
      expect(calls(mock, 'POST', '/auth/register')).toHaveLength(1);
    });

    test('backend error 409: register-feedback alert shows the backend message, form kept, no navigation', async ({
      page,
    }) => {
      await open(page, '/register', {}, lang);
      await fillRegister(page, { email: TAKEN_EMAIL });
      await submit(page).click();
      const alert = page.getByTestId('register-feedback');
      await expect(alert).toContainText('Email already registered');
      await expect(page.locator('#reg-email')).toHaveValue(TAKEN_EMAIL);
      await expect(page).toHaveURL(/\/register$/);
      await expect(submit(page)).toBeEnabled();
    });

    test('Google button on /register uses the same start URL', async ({
      page,
      baseURL,
    }) => {
      const mock = await open(page, '/register', {}, lang);
      await page.getByRole('button', { name: /Google/ }).click();
      await expect.poll(() => mock.googleUrls.length).toBeGreaterThan(0);
      expect(new URL(mock.googleUrls[0]!).searchParams.get('origin')).toBe(
        new URL(baseURL!).origin,
      );
    });
  });
}

test.describe('/auth/callback', () => {
  test('?code=good: code removed from the URL before the exchange resolves, POST exchange {code}, GET /auth/me, then /events', async ({
    page,
  }) => {
    const mock = await open(page, `/auth/callback?code=${GOOD_CODE}`, {
      latency: { 'POST /auth/oauth/exchange': 800 },
    });
    await expect
      .poll(() => calls(mock, 'POST', '/auth/oauth/exchange').length)
      .toBe(1);
    // while the exchange is still in flight the one-time code must already be out of the address bar
    expect(new URL(page.url()).search).toBe('');
    await expect(page).toHaveURL(/\/events$/);
    const ex = calls(mock, 'POST', '/auth/oauth/exchange');
    expect(ex).toHaveLength(1);
    expect(JSON.parse(ex[0]!.body!)).toEqual({ code: GOOD_CODE });
    expect(ex[0]!.query).toBe('');
    expect(calls(mock, 'GET', '/auth/me').length).toBeGreaterThanOrEqual(1);
  });

  test('no code: /login without any exchange call', async ({ page }) => {
    const mock = await open(page, '/auth/callback');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#login-email')).toBeVisible();
    expect(calls(mock, 'POST', '/auth/oauth/exchange')).toHaveLength(0);
  });

  for (const lang of ['uk', 'en'] as const) {
    test(`exchange failure (${lang}): /login, code gone from URL, no /auth/me, error toast text`, async ({
      page,
    }) => {
      const mock = await open(
        page,
        '/auth/callback?code=expired-or-used',
        {},
        lang,
      );
      await expect(page).toHaveURL(/\/login$/);
      expect(page.url()).not.toContain('code=');
      expect(calls(mock, 'GET', '/auth/me')).toHaveLength(0);
      const toast = page.getByText(L.oauthFailed[lang]);
      const shown = await toast
        .first()
        .isVisible()
        .catch(() => false);
      const visible =
        shown ||
        (await toast
          .first()
          .waitFor({ state: 'visible', timeout: 3_000 })
          .then(
            () => true,
            () => false,
          ));
      test
        .info()
        .annotations.push({
          type: 'toast',
          description: `oauth_failed toast visible on /login after redirect: ${visible}`,
        });
      // D-1 (medium): Next raises the toast and then hard-navigates, which reloads the page and drops it; Angular's SPA navigation keeps it.
      // Marked as an expected failure on next so the suite flips (and demands removal of this line) once the message survives the navigation.
      test.fail(
        proj() === 'next',
        'D-1: oauth_failed toast is lost by the hard navigation to /login',
      );
      expect(visible).toBe(true);
    });
  }

  test('exchange ok but /auth/me fails: treated as failure, /login', async ({
    page,
  }) => {
    await open(page, `/auth/callback?code=${GOOD_CODE}`, {
      fail: { 'GET /auth/me': 500 },
    });
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('P4 session / storage (no tokens in JS-reachable storage)', () => {
  test('next: login, register and OAuth never leave a token in localStorage, sessionStorage or document.cookie, even if the backend body carries tokens', async ({
    page,
  }) => {
    test.skip(
      proj() !== 'next',
      'asserted on the Next target; Angular keeps the access token in memory by design (reported separately)',
    );
    const mock = await open(page, '/login', { tokensInBody: true });
    await fillLogin(page, GOOD.email, GOOD.password);
    await submit(page).click();
    await expect(page).toHaveURL(/\/events$/);
    expect(await tokenLeaks(page)).toEqual([]);
    mock.session = false;

    await page.goto('/register');
    await hydrated(page);
    await fillRegister(page);
    await submit(page).click();
    await expect(page.getByTestId('register-feedback')).toBeVisible();
    expect(await tokenLeaks(page)).toEqual([]);
    await expect(page).toHaveURL(/\/events$/, { timeout: 15_000 });
    expect(await tokenLeaks(page)).toEqual([]);

    mock.session = false;
    await page.goto(`/auth/callback?code=${GOOD_CODE}`);
    await expect(page).toHaveURL(/\/events$/);
    expect(await tokenLeaks(page)).toEqual([]);
    // the page DOM must not echo them either
    expect(await page.content()).not.toContain(ACCESS);
    expect(await page.content()).not.toContain(REFRESH);
  });

  test('angular reference: what the legacy app leaves in storage after a login (informational)', async ({
    page,
  }) => {
    test.skip(
      proj() !== 'legacy',
      'reference measurement for the Angular target',
    );
    await open(page, '/login');
    await fillLogin(page, GOOD.email, GOOD.password);
    await submit(page).click();
    await expect(page).toHaveURL(/\/events$/);
    test
      .info()
      .annotations.push({
        type: 'angular-storage',
        description: JSON.stringify(await tokenLeaks(page)),
      });
  });

  test('legacy bc_refresh_token / bc_has_session are migrated once (POST /auth/refresh) and deleted on load', async ({
    page,
  }) => {
    const mock = await installAuthMock(page, proj(), { session: true });
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        sessionStorage.setItem('seeded', '1');
        localStorage.setItem('bc_refresh_token', 'LEGACY-REFRESH-123');
        localStorage.setItem('bc_has_session', '1');
      }
    });
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect
      .poll(() =>
        page.evaluate(() => [
          localStorage.getItem('bc_refresh_token'),
          localStorage.getItem('bc_has_session'),
        ]),
      )
      .toEqual([null, null]);
    const refresh = calls(mock, 'POST', '/auth/refresh');
    expect(refresh).toHaveLength(1);
    expect(JSON.parse(refresh[0]!.body!)).toEqual({
      refreshToken: 'LEGACY-REFRESH-123',
    });
  });
});

// P7: axe on both targets. Structural serious/critical must be zero; colour-contrast is logged and asserted separately on Next.
for (const lang of ['uk', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    for (const [name, path, ready] of [
      ['login', '/login', '#login-email'],
      ['register', '/register', '#reg-display-name'],
    ] as const) {
      test(`axe ${name} ${lang} ${theme}`, async ({ page }, ti) => {
        await open(page, path, {}, lang, theme);
        await expect(page.locator(ready)).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(800);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
          .analyze();
        const summary = results.violations.map(
          (v) =>
            `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' ').slice(-60))
              .join(' | ')}`,
        );
        console.log(
          `[axe ${ti.project.name} ${name} ${lang} ${theme}] ${summary.length ? summary.join('\n  ') : 'no violations'}`,
        );
        const detail = results.violations.flatMap((v) =>
          v.nodes.map(
            (n) =>
              `${v.id}: ${n.html.slice(0, 160)}\n    ${(n.any[0]?.message ?? n.failureSummary ?? '').slice(0, 220)}`,
          ),
        );
        writeFileSync(
          `${SHOTS}/axe-${ti.project.name}-${name}-${lang}-${theme}.txt`,
          summary.join('\n') + '\n' + detail.join('\n') + '\n',
        );
        const structural = results.violations.filter(
          (v) =>
            v.id !== 'color-contrast' &&
            (v.impact === 'serious' || v.impact === 'critical'),
        );
        expect(structural.map((v) => v.id)).toEqual([]);
        // colour contrast is reported (axe-*.txt) and only blocks with PARITY_STRICT_CONTRAST=1: known defect, see PARITY-R9.md
        if (
          ti.project.name === 'next' &&
          process.env['PARITY_STRICT_CONTRAST'] === '1'
        )
          expect(
            results.violations
              .filter((v) => v.id === 'color-contrast')
              .map((v) => v.id),
          ).toEqual([]);
      });
    }
  }
}

// P8: screenshots for manual review (no cross-target pixel baseline: the DOMs and the book intro differ by design).
for (const theme of ['light', 'dark'] as const) {
  for (const width of [375, 768, 1280] as const) {
    for (const [name, path, ready] of [
      ['login', '/login', '#login-email'],
      ['register', '/register', '#reg-display-name'],
    ] as const) {
      test(`shot ${name} ${width} ${theme}`, async ({ page }, ti) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path, {}, 'uk', theme);
        await expect(page.locator(ready)).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1200);
        await page.screenshot({
          path: `${SHOTS}/${ti.project.name}-${name}-${width}-${theme}.png`,
          fullPage: true,
        });
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, 'horizontal page scroll').toBeLessThanOrEqual(0);
      });
    }
  }
}

// P2: request journeys, written to playwright-report/parity/r9/har-<target>-<journey>.txt (not committed) and counted in the report.
const dump = (mock: AuthMock, name: string, target: string) =>
  writeFileSync(
    `${SHOTS}/har-${target}-${name}.txt`,
    mock.log
      .map(
        (r) =>
          `${r.method} ${r.path}${r.query} ${r.method === 'GET' || !r.body ? '' : r.body.replace(/"(password|confirmPassword)":"[^"]*"/g, '"$1":"***"')}`,
      )
      .join('\n') + '\n',
  );
const count = (m: AuthMock, method: string, path: string) =>
  calls(m, method, path).length;

test.describe('P2 request journeys', () => {
  test('guest: load /login, sign in', async ({ page }, ti) => {
    const mock = await open(page, '/login');
    await fillLogin(page, GOOD.email, GOOD.password);
    await submit(page).click();
    await expect(page).toHaveURL(/\/events$/);
    await page.waitForTimeout(1200);
    dump(mock, 'login', ti.project.name);
    expect(count(mock, 'POST', '/auth/login')).toBe(1);
  });

  test('guest: load /register, register, wait for the hard navigation', async ({
    page,
  }, ti) => {
    const mock = await open(page, '/register');
    await fillRegister(page);
    await submit(page).click();
    await expect(page).toHaveURL(/\/events$/, { timeout: 15_000 });
    await page.waitForTimeout(1000);
    dump(mock, 'register', ti.project.name);
    expect(count(mock, 'POST', '/auth/register')).toBe(1);
  });

  test('google callback: load /auth/callback?code, land on /events', async ({
    page,
  }, ti) => {
    const mock = await open(page, `/auth/callback?code=${GOOD_CODE}`);
    await expect(page).toHaveURL(/\/events$/);
    await page.waitForTimeout(1000);
    dump(mock, 'callback', ti.project.name);
    expect(count(mock, 'POST', '/auth/oauth/exchange')).toBe(1);
  });

  test('refresh churn: five consecutive hard loads of /login with a live session', async ({
    page,
  }, ti) => {
    const mock = await installAuthMock(page, proj(), { session: true });
    await page
      .context()
      .addCookies(LANG_COOKIE(ti.project.use.baseURL!, 'uk', 'light'));
    for (let i = 0; i < 5; i++) {
      await page.goto('/login');
      await expect(page.locator('#login-email')).toBeVisible();
      await page.waitForLoadState('networkidle');
    }
    dump(mock, 'churn', ti.project.name);
    const summary = `5 hard loads with session: session-status x${count(mock, 'GET', '/auth/session-status')}, refresh x${count(mock, 'POST', '/auth/refresh')}, me x${count(mock, 'GET', '/auth/me')}`;
    console.log(`[churn ${ti.project.name}] ${summary}`);
    ti.annotations.push({ type: 'churn', description: summary });
    if (ti.project.name === 'next')
      expect(count(mock, 'POST', '/auth/refresh')).toBe(0);
  });
});
