// R8 parity checks for /profile, /support and /support/new, run against BOTH targets (PARITY_TARGET equivalent: the playwright
// projects `legacy` = Angular and `next`). Every /api/v1 call is fulfilled by e2e/parity/r8/fixtures.ts through page.route, so
// no real backend and no seeded persona is involved. Locators are shared by both DOMs (data-testid values that exist in both,
// roles, labels, uk/en text); a test that needs Next-only markup is marked next-only.
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { expect, test } from './bypass';
import { LANG_COOKIE, watchConsole } from './r6/helpers';
import type { Role } from './r6/fixtures';
import {
  installProfileMock,
  SUB_IDS,
  type MockSubmission,
  type ProfileMock,
} from './r8/fixtures';

const SHOTS = 'playwright-report/parity/r8';
mkdirSync(SHOTS, { recursive: true });

type Lang = 'uk' | 'en';
const L = {
  saved: { uk: /Збережено!/, en: /Saved!/ },
  saveError: { uk: /Не вдалось зберегти/, en: /Failed to save/ },
  saveName: { uk: /Зберегти ім'я/, en: /Save Name/ },
  save: { uk: /^Зберегти$/, en: /^Save$/ },
  nameRequired: { uk: /Ім'я є обов'язковим/, en: /Display name is required/ },
  nameMin: { uk: /Мінімум 2 символи/, en: /Must be at least 2 characters/ },
  nameInvalid: {
    uk: /Ім'я може містити лише літери/,
    en: /Display name can contain only letters/,
  },
  organizer: { uk: /Організатор/, en: /Organizer/ },
  reader: { uk: /Читач/, en: /Reader/ },
  noStats: { uk: /Статистики ще немає/, en: /No statistics yet/ },
  titleRequired: { uk: /Заголовок обов'язковий/, en: /Title is required/ },
  titleMin: { uk: /щонайменше 3 символи/, en: /at least 3 characters/ },
  bodyRequired: { uk: /Деталі обов'язкові/, en: /Details are required/ },
  bodyMin: { uk: /щонайменше 10 символів/, en: /at least 10 characters/ },
  submitOk: { uk: /Звернення надіслано/, en: /Submission sent/ },
  statusUpdated: { uk: /Статус оновлено/, en: /Status updated/ },
  approve: { uk: /Схвалити/, en: /Approve/ },
  reject: { uk: /Відхилити/, en: /Reject/ },
  startWork: { uk: /Почати роботу/, en: /Start work/ },
  markDone: { uk: /Позначити готовим/, en: /Mark done/ },
  complaints: { uk: 'Скарги', en: 'Complaints' },
  supportTitle: { uk: /Підтримка/, en: /Support/ },
} as const;

async function open(
  page: Page,
  role: Role,
  path: string,
  opts: Parameters<typeof installProfileMock>[2] = {},
  lang: Lang = 'uk',
): Promise<ProfileMock> {
  const mock = await installProfileMock(page, role, opts);
  await page
    .context()
    .addCookies(LANG_COOKIE(test.info().project.use.baseURL!, lang, 'light'));
  await page.goto(path);
  return mock;
}

const calls = (m: ProfileMock, method: string, path: string) =>
  m.log.filter((r) => r.method === method && r.path === path);
const toast = (page: Page, re: RegExp) => page.getByText(re).first();
const nameInput = (page: Page) => page.getByTestId('display-name-input');

test.describe('guards (P1/P4)', () => {
  for (const path of ['/profile', '/support', '/support/new']) {
    test(`a guest on ${path} ends on /login without any profile or support call`, async ({
      page,
    }) => {
      const mock = await open(page, 'guest', path);
      await page.waitForURL(/\/login/);
      expect(
        mock.log.filter(
          (r) => r.path.startsWith('/users') || r.path.startsWith('/support'),
        ),
      ).toEqual([]);
    });
  }
});

for (const lang of ['uk', 'en'] as const) {
  test.describe(`/profile ${lang}`, () => {
    test('renders the user, the five stats and the saved socials; stats come from one GET /users/me/stats', async ({
      page,
    }) => {
      const errors = watchConsole(page);
      const mock = await open(page, 'member', '/profile', {}, lang);
      await expect(page.locator('#profile-heading')).toHaveText(
        'Максим Учасник',
      );
      await expect(page.locator('dd')).toHaveText(['4', '7', '2', '11', '9']);
      await expect(
        page.getByRole('button', { name: L.reader[lang] }).first(),
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(
        page.getByRole('button', { name: L.organizer[lang] }).first(),
      ).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByRole('textbox', { name: 'Telegram' })).toHaveValue(
        'maxim_reads',
      );
      await expect(nameInput(page)).toHaveValue('Максим Учасник');
      expect(calls(mock, 'GET', '/users/me/stats')).toHaveLength(1);
      expect(errors).toEqual([]);
    });

    test('stats failure reads as zeros plus the no-statistics hint', async ({
      page,
    }) => {
      await open(page, 'member', '/profile', { stats: 'fail' }, lang);
      await expect(page.getByText(L.noStats[lang])).toBeVisible();
      await expect(page.locator('dd')).toHaveText(['0', '0', '0', '0', '0']);
    });

    test('display name: required, min, unsafe characters; aria-invalid; submit disabled while invalid', async ({
      page,
    }) => {
      await open(page, 'member', '/profile', {}, lang);
      const submit = page.getByRole('button', { name: L.saveName[lang] });
      await expect(submit).toBeEnabled();

      await nameInput(page).fill('');
      await nameInput(page).blur();
      await expect(page.getByText(L.nameRequired[lang])).toBeVisible();
      await expect(nameInput(page)).toHaveAttribute('aria-invalid', 'true');
      // Angular renders aria-describedby="" on the deployed build (its error element id is not wired); Next wires it (improvement)
      if (test.info().project.name === 'next')
        await expect(nameInput(page)).toHaveAttribute('aria-describedby', /.+/);
      await expect(submit).toBeDisabled();

      await nameInput(page).fill('a');
      await nameInput(page).blur();
      await expect(page.getByText(L.nameMin[lang])).toBeVisible();
      await expect(submit).toBeDisabled();

      for (const bad of ['<script>x</script>', 'Ім`я', 'a&b', 'x'.repeat(51)]) {
        await nameInput(page).fill(bad);
        await nameInput(page).blur();
        await expect(page.getByText(L.nameInvalid[lang]), bad).toBeVisible();
        await expect(submit, bad).toBeDisabled();
      }

      await nameInput(page).fill("Оля-Марія O'Brien_2.0");
      await nameInput(page).blur();
      await expect(page.getByText(L.nameInvalid[lang])).toHaveCount(0);
      await expect(nameInput(page)).not.toHaveAttribute('aria-invalid', 'true');
      await expect(submit).toBeEnabled();
    });

    test('saving the name: one PATCH /users/me with {displayName}, saved toast, heading updated', async ({
      page,
    }) => {
      const mock = await open(page, 'member', '/profile', {}, lang);
      await nameInput(page).fill('Нове Ім’я'.replace('’', "'"));
      await page.getByRole('button', { name: L.saveName[lang] }).click();
      await expect(toast(page, L.saved[lang])).toBeVisible();
      await expect(page.locator('#profile-heading')).toHaveText("Нове Ім'я");
      const patches = calls(mock, 'PATCH', '/users/me');
      expect(patches).toHaveLength(1);
      expect(JSON.parse(patches[0]!.body!)).toEqual({
        displayName: "Нове Ім'я",
      });
      test
        .info()
        .annotations.push({
          type: 'har',
          description: `after name save: GET /auth/me x${calls(mock, 'GET', '/auth/me').length}`,
        });
    });

    test('a rejected name save shows the save-error toast and keeps the old heading', async ({
      page,
    }) => {
      await open(
        page,
        'member',
        '/profile',
        { fail: { 'PATCH /users/me': 422 } },
        lang,
      );
      await nameInput(page).fill('Інше Імя');
      await page.getByRole('button', { name: L.saveName[lang] }).click();
      await expect(toast(page, L.saveError[lang])).toBeVisible();
      await expect(page.locator('#profile-heading')).toHaveText(
        'Максим Учасник',
      );
    });

    test('role change: PATCH /users/me/role {role}, aria-pressed moves, badge follows; failure toasts and keeps the role', async ({
      page,
    }) => {
      const mock = await open(page, 'member', '/profile', {}, lang);
      const organizer = page
        .locator('fieldset')
        .getByRole('button', { name: L.organizer[lang] });
      const reader = page
        .locator('fieldset')
        .getByRole('button', { name: L.reader[lang] });
      await organizer.click();
      await expect(toast(page, L.saved[lang])).toBeVisible();
      await expect(organizer).toHaveAttribute('aria-pressed', 'true');
      await expect(reader).toHaveAttribute('aria-pressed', 'false');
      expect(
        JSON.parse(calls(mock, 'PATCH', '/users/me/role')[0]!.body!),
      ).toEqual({ role: 'organizer' });
      expect(calls(mock, 'PATCH', '/users/me/role')).toHaveLength(1);
      test
        .info()
        .annotations.push({
          type: 'har',
          description: `after role save: GET /auth/me x${calls(mock, 'GET', '/auth/me').length}`,
        });
    });

    test('role change failure keeps the previous role', async ({ page }) => {
      await open(
        page,
        'member',
        '/profile',
        { fail: { 'PATCH /users/me/role': 422 } },
        lang,
      );
      const fieldset = page.locator('fieldset');
      await fieldset.getByRole('button', { name: L.organizer[lang] }).click();
      await expect(toast(page, L.saveError[lang])).toBeVisible();
      await expect(
        fieldset.getByRole('button', { name: L.reader[lang] }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    test('socials: empty inputs are left out of PATCH /users/me/socials; visibility toggle sends {socialsPublic}', async ({
      page,
    }) => {
      const mock = await open(page, 'member', '/profile', {}, lang);
      await page.getByRole('textbox', { name: 'GitHub' }).fill('maxim-gh');
      await page.getByRole('textbox', { name: 'Telegram' }).fill('');
      await page.getByRole('button', { name: L.save[lang] }).click();
      await expect(toast(page, L.saved[lang])).toBeVisible();
      const socials = calls(mock, 'PATCH', '/users/me/socials');
      expect(socials).toHaveLength(1);
      expect(JSON.parse(socials[0]!.body!)).toEqual({ github: 'maxim-gh' });

      const box = page.getByRole('checkbox');
      await expect(box).not.toBeChecked();
      await box.check();
      await expect
        .poll(() => calls(mock, 'PATCH', '/users/me/socials-visibility').length)
        .toBe(1);
      expect(
        JSON.parse(
          calls(mock, 'PATCH', '/users/me/socials-visibility')[0]!.body!,
        ),
      ).toEqual({ socialsPublic: true });
    });
  });
}

test.describe('/profile admin', () => {
  test('an admin has neither role card pressed and still gets the page', async ({
    page,
  }) => {
    await open(page, 'admin', '/profile');
    await expect(page.locator('#profile-heading')).toBeVisible();
    await expect(
      page.locator('fieldset button[aria-pressed="true"]'),
    ).toHaveCount(0);
  });
});

const board = (page: Page) => page.getByTestId('support-like');

for (const lang of ['uk', 'en'] as const) {
  test.describe(`/support ${lang}`, () => {
    test('renders complaints, comments and the five suggestion columns; one GET /support', async ({
      page,
    }) => {
      const errors = watchConsole(page);
      const mock = await open(page, 'member', '/support', {}, lang);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        L.supportTitle[lang],
      );
      await expect(
        page.getByRole('heading', { level: 2, name: L.complaints[lang] }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 3, name: 'Скарга перша' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 3, name: 'Коментар перший' }),
      ).toBeVisible();
      for (const t of [
        'Ідея на розгляді',
        'Ідея схвалена',
        'Ідея в роботі',
        'Ідея готова',
        'Ідея відхилена',
      ])
        await expect(
          page.getByRole('heading', { level: 3, name: t }),
        ).toBeVisible();
      await expect(page.getByTestId('support-new')).toHaveAttribute(
        'href',
        '/support/new',
      );
      expect(calls(mock, 'GET', '/support')).toHaveLength(1);
      expect(errors).toEqual([]);
    });

    test('likes: only complaints and comments have a like button; optimistic toggle sends POST then DELETE', async ({
      page,
    }) => {
      const mock = await open(page, 'member', '/support', {}, lang);
      await expect(board(page)).toHaveCount(2);
      const complaintLike = page
        .locator('section', {
          has: page.getByRole('heading', { level: 3, name: 'Скарга перша' }),
        })
        .getByTestId('support-like')
        .first();
      await expect(complaintLike).toHaveAttribute('aria-pressed', 'false');
      await expect(complaintLike).toContainText('3');
      await complaintLike.click();
      await expect(complaintLike).toHaveAttribute('aria-pressed', 'true');
      await expect(complaintLike).toContainText('4');
      await complaintLike.click();
      await expect(complaintLike).toHaveAttribute('aria-pressed', 'false');
      await expect(complaintLike).toContainText('3');
      await expect
        .poll(
          () =>
            calls(mock, 'DELETE', `/support/${SUB_IDS.complaint}/like`).length,
        )
        .toBe(1);
      expect(
        calls(mock, 'POST', `/support/${SUB_IDS.complaint}/like`),
      ).toHaveLength(1);
    });

    test('a failed like restores the previous state', async ({ page }) => {
      const mock = await open(
        page,
        'member',
        '/support',
        { fail: { 'POST /support/:id/like': 422 } },
        lang,
      );
      const like = page
        .locator('section', {
          has: page.getByRole('heading', { level: 3, name: 'Скарга перша' }),
        })
        .getByTestId('support-like')
        .first();
      await like.click();
      await expect
        .poll(
          () =>
            calls(mock, 'POST', `/support/${SUB_IDS.complaint}/like`).length,
        )
        .toBe(1);
      await expect(like).toHaveAttribute('aria-pressed', 'false');
      await expect(like).toContainText('3');
    });

    test('a plain user and an organizer see no admin controls', async ({
      page,
    }) => {
      for (const role of ['member', 'organizer'] as const) {
        await page.unrouteAll({ behavior: 'ignoreErrors' });
        await open(page, role, '/support', {}, lang);
        await expect(
          page.getByRole('heading', { level: 3, name: 'Ідея на розгляді' }),
        ).toBeVisible();
        for (const id of [
          'support-approve',
          'support-reject',
          'support-advance',
        ])
          await expect(page.getByTestId(id), `${role} ${id}`).toHaveCount(0);
      }
    });

    test('admin: approve/reject on pending, advance on approved and in progress, nothing on done or rejected', async ({
      page,
    }) => {
      const mock = await open(page, 'admin', '/support', {}, lang);
      await expect(
        page.getByRole('heading', { level: 3, name: 'Ідея на розгляді' }),
      ).toBeVisible();
      await expect(page.getByTestId('support-approve')).toHaveCount(1);
      await expect(page.getByTestId('support-reject')).toHaveCount(1);
      await expect(page.getByTestId('support-advance')).toHaveCount(2);
      await expect(
        page
          .getByTestId('support-advance')
          .filter({ hasText: L.startWork[lang] }),
      ).toHaveCount(1);
      await expect(
        page
          .getByTestId('support-advance')
          .filter({ hasText: L.markDone[lang] }),
      ).toHaveCount(1);

      await page.getByTestId('support-approve').click();
      await expect(toast(page, L.statusUpdated[lang])).toBeVisible();
      const patches = calls(
        mock,
        'PATCH',
        `/support/${SUB_IDS.pending}/status`,
      );
      expect(patches).toHaveLength(1);
      expect(JSON.parse(patches[0]!.body!)).toEqual({ status: 'approved' });
      await expect(page.getByTestId('support-approve')).toHaveCount(0);
      await expect(page.getByTestId('support-advance')).toHaveCount(3);

      await page
        .getByTestId('support-advance')
        .filter({ hasText: L.startWork[lang] })
        .first()
        .click();
      await expect
        .poll(
          () =>
            mock.log.filter(
              (r) => r.method === 'PATCH' && r.path.endsWith('/status'),
            ).length,
        )
        .toBe(2);
    });

    test('admin reject sends {status: rejected}', async ({ page }) => {
      const mock = await open(page, 'admin', '/support', {}, lang);
      await page.getByTestId('support-reject').click();
      await expect
        .poll(
          () =>
            calls(mock, 'PATCH', `/support/${SUB_IDS.pending}/status`).length,
        )
        .toBe(1);
      expect(
        JSON.parse(
          calls(mock, 'PATCH', `/support/${SUB_IDS.pending}/status`)[0]!.body!,
        ),
      ).toEqual({ status: 'rejected' });
    });

    test('an empty board shows the three empty states and no cards', async ({
      page,
    }) => {
      await open(
        page,
        'member',
        '/support',
        { submissions: [] as MockSubmission[] },
        lang,
      );
      await expect(
        page.getByText(
          lang === 'uk'
            ? /Поки що немає (скарг|коментарів|пропозицій)/
            : /No (complaints|comments|suggestions) yet/,
        ),
      ).toHaveCount(3);
      await expect(
        page.getByRole('heading', { level: 3, name: /Скарга|Коментар|Ідея/ }),
      ).toHaveCount(0);
      await expect(page.getByTestId('support-like')).toHaveCount(0);
    });
  });
}

for (const lang of ['uk', 'en'] as const) {
  test.describe(`/support/new ${lang}`, () => {
    const type = (p: Page) => p.getByTestId('submission-type-select');
    const title = (p: Page) => p.getByTestId('submission-title-input');
    const body = (p: Page) => p.getByTestId('submission-body-input');
    const submit = (p: Page) => p.getByTestId('submission-submit');

    test('empty submit is blocked: no POST, required messages, aria-invalid on both fields', async ({
      page,
    }) => {
      const mock = await open(page, 'member', '/support/new', {}, lang);
      await submit(page).click();
      await expect(page.getByText(L.titleRequired[lang])).toBeVisible();
      await expect(page.getByText(L.bodyRequired[lang])).toBeVisible();
      await expect(title(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(body(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(page).toHaveURL(/\/support\/new$/);
      expect(calls(mock, 'POST', '/support')).toHaveLength(0);
    });

    test('min lengths (3 / 10) and max lengths (120 / 2000)', async ({
      page,
    }) => {
      await open(page, 'member', '/support/new', {}, lang);
      await title(page).fill('ab');
      await body(page).fill('short');
      await submit(page).click();
      await expect(page.getByText(L.titleMin[lang])).toBeVisible();
      await expect(page.getByText(L.bodyMin[lang])).toBeVisible();
      await title(page).fill('x'.repeat(121));
      await body(page).fill('y'.repeat(2001));
      await submit(page).click();
      await expect(page.getByText(L.titleMin[lang])).toHaveCount(0);
      await expect(title(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(body(page)).toHaveAttribute('aria-invalid', 'true');
      await title(page).fill('x'.repeat(120));
      await body(page).fill('y'.repeat(2000));
      await expect(title(page)).not.toHaveAttribute('aria-invalid', 'true');
      await expect(body(page)).not.toHaveAttribute('aria-invalid', 'true');
    });

    test('success: one POST /support with trimmed payload, success toast, back on /support with the new card', async ({
      page,
    }) => {
      const mock = await open(page, 'member', '/support/new', {}, lang);
      await expect(type(page)).toHaveValue('suggestion');
      await type(page).selectOption('comment');
      await title(page).fill('  Новий коментар  ');
      await body(page).fill('  Тіло звернення з пробілами  ');
      await page.evaluate(
        () => ((window as unknown as Record<string, number>)['__spa'] = 1),
      );
      await submit(page).click();
      await expect(page).toHaveURL(/\/support$/);
      // Next pushes within the router only when /support is a Next-owned route in the strangler flags; `next dev` without
      // Edge Config owns none, so it hard-navigates and the queued toast is dropped with the document (environment, not a defect).
      const soft = await page.evaluate(
        () => (window as unknown as Record<string, number>)['__spa'] === 1,
      );
      test
        .info()
        .annotations.push({
          type: 'navigation',
          description: soft
            ? 'soft (SPA) navigation'
            : 'hard navigation (route not enabled in flags)',
        });
      if (soft) await expect(toast(page, L.submitOk[lang])).toBeVisible();
      const posts = calls(mock, 'POST', '/support');
      expect(posts).toHaveLength(1);
      expect(JSON.parse(posts[0]!.body!)).toEqual({
        type: 'comment',
        title: 'Новий коментар',
        body: 'Тіло звернення з пробілами',
      });
      await expect(
        page.getByRole('heading', { level: 3, name: 'Новий коментар' }),
      ).toBeVisible();
    });

    test('a double click sends a single POST and the button is disabled while sending', async ({
      page,
    }) => {
      const mock = await open(
        page,
        'member',
        '/support/new',
        { latency: { 'POST /support': 700 } },
        lang,
      );
      await title(page).fill('Подвійний клік');
      await body(page).fill('Перевірка подвійного натискання');
      await submit(page).click();
      await expect(submit(page)).toBeDisabled();
      await submit(page)
        .click({ force: true, noWaitAfter: true })
        .catch(() => undefined);
      await expect(page).toHaveURL(/\/support$/);
      expect(calls(mock, 'POST', '/support')).toHaveLength(1);
    });

    test('a rejected submit shows an inline alert, stays on the form and keeps the input', async ({
      page,
    }) => {
      await open(
        page,
        'member',
        '/support/new',
        { fail: { 'POST /support': 422 } },
        lang,
      );
      await title(page).fill('Не вийде');
      await body(page).fill('Сервер відхилить цей запит');
      await submit(page).click();
      await expect(
        page.getByRole('alert').filter({ hasText: '⚠️' }),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/support\/new$/);
      await expect(title(page)).toHaveValue('Не вийде');
      await expect(submit(page)).toBeEnabled();
    });

    test('cancel returns to /support without a POST', async ({ page }) => {
      const mock = await open(page, 'member', '/support/new', {}, lang);
      await page
        .getByRole('button', { name: lang === 'uk' ? 'Скасувати' : 'Cancel' })
        .click();
      await expect(page).toHaveURL(/\/support$/);
      expect(calls(mock, 'POST', '/support')).toHaveLength(0);
    });
  });
}

// P7: axe on both targets. Structural serious/critical must be zero; colour-contrast is logged (tracked separately).
for (const lang of ['uk', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    for (const [name, role, path, ready] of [
      [
        'profile',
        'member',
        '/profile',
        (p: Page) => p.locator('#profile-heading'),
      ],
      [
        'support',
        'admin',
        '/support',
        (p: Page) =>
          p.getByRole('heading', { level: 3, name: 'Ідея на розгляді' }),
      ],
      [
        'support-new',
        'member',
        '/support/new',
        (p: Page) => p.getByTestId('submission-submit'),
      ],
    ] as const) {
      test(`axe ${name} ${lang} ${theme}`, async ({
        page,
        context,
        baseURL,
      }, ti) => {
        await context.addCookies(LANG_COOKIE(baseURL!, lang, theme));
        await installProfileMock(page, role);
        await page.goto(path);
        await expect(ready(page)).toBeVisible();
        await page.waitForLoadState('networkidle');
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
        const structural = results.violations.filter(
          (v) =>
            v.id !== 'color-contrast' &&
            (v.impact === 'serious' || v.impact === 'critical'),
        );
        expect(structural.map((v) => v.id)).toEqual([]);
      });
    }
  }
}

// P8: screenshots for manual review (no cross-target pixel baseline: the two DOMs differ by design).
for (const theme of ['light', 'dark'] as const) {
  for (const width of [375, 768, 1280] as const) {
    for (const [name, role, path, ready] of [
      [
        'profile',
        'member',
        '/profile',
        (p: Page) => p.locator('#profile-heading'),
      ],
      [
        'support',
        'admin',
        '/support',
        (p: Page) =>
          p.getByRole('heading', { level: 3, name: 'Ідея на розгляді' }),
      ],
      [
        'support-new',
        'member',
        '/support/new',
        (p: Page) => p.getByTestId('submission-submit'),
      ],
    ] as const) {
      test(`shot ${name} ${width} ${theme}`, async ({
        page,
        context,
        baseURL,
      }, ti) => {
        await page.setViewportSize({ width, height: 900 });
        await context.addCookies(LANG_COOKIE(baseURL!, 'uk', theme));
        await installProfileMock(page, role);
        await page.goto(path);
        await expect(ready(page)).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(600);
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

// P2: request journey per target, written to playwright-report/parity/r8/har-<target>-<journey>.txt and diffed by the caller.
import { writeFileSync } from 'node:fs';
test.describe('P2 request journeys', () => {
  test('profile: load, save name, change role, save socials, toggle visibility', async ({
    page,
  }, ti) => {
    const mock = await open(page, 'member', '/profile');
    await expect(page.locator('#profile-heading')).toBeVisible();
    await nameInput(page).fill('Нове Імя');
    await page.getByRole('button', { name: L.saveName.uk }).click();
    await expect(toast(page, L.saved.uk)).toBeVisible();
    await page
      .locator('fieldset')
      .getByRole('button', { name: L.organizer.uk })
      .click();
    await expect
      .poll(() => calls(mock, 'PATCH', '/users/me/role').length)
      .toBe(1);
    await page.getByRole('textbox', { name: 'GitHub' }).fill('gh');
    await page.getByRole('button', { name: L.save.uk }).click();
    await page.getByRole('checkbox').check();
    await expect
      .poll(() => calls(mock, 'PATCH', '/users/me/socials-visibility').length)
      .toBe(1);
    await page.waitForTimeout(800);
    writeFileSync(
      `${SHOTS}/har-${ti.project.name}-profile.txt`,
      mock.log
        .map(
          (r) =>
            `${r.method} ${r.path}${r.query} ${r.method === 'GET' ? '' : r.body}`,
        )
        .join('\n') + '\n',
    );
  });
  test('support: load, like, create', async ({ page }, ti) => {
    const mock = await open(page, 'admin', '/support');
    await expect(page.getByTestId('support-like').first()).toBeVisible();
    await page.getByTestId('support-like').first().click();
    await page.getByTestId('support-approve').click();
    await expect
      .poll(() => mock.log.filter((r) => r.method === 'PATCH').length)
      .toBe(1);
    await page.getByTestId('support-new').click();
    await page.getByTestId('submission-title-input').fill('Журнал запитів');
    await page
      .getByTestId('submission-body-input')
      .fill('Перевірка набору запитів');
    await page.getByTestId('submission-submit').click();
    await expect(page).toHaveURL(/\/support$/);
    await page.waitForTimeout(1000);
    writeFileSync(
      `${SHOTS}/har-${ti.project.name}-support.txt`,
      mock.log
        .map(
          (r) =>
            `${r.method} ${r.path}${r.query} ${r.method === 'GET' ? '' : r.body}`,
        )
        .join('\n') + '\n',
    );
  });
});
