// R11 parity checks for the seven quiz routes under /clubs/:id/quizzes, run against BOTH targets (playwright projects `legacy` =
// Angular and `next`). Every /api/v1 call is fulfilled by e2e/parity/r11/fixtures.ts through page.route, so no real backend and
// no seeded persona is involved. Locators are shared by both DOMs (data-testid values that exist in both, roles, labels, uk/en
// text); expectations that differ by design are written per target and listed in docs/migration/PARITY-R11.md (D-1..).
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from './bypass';
import { LANG_COOKIE, watchConsole } from './r6/helpers';
import {
  CLUB,
  entry,
  EVENT_ID,
  installQuizMock,
  liveSession,
  OTHER_CLUB,
  QZ,
  SESSION_ID,
  type QuizMock,
  type Viewer,
} from './r11/fixtures';

const SHOTS = 'playwright-report/parity/r11';
mkdirSync(SHOTS, { recursive: true });

type Lang = 'uk' | 'en';
const isNext = () => test.info().project.name === 'next';
const base = `/clubs/${CLUB}/quizzes`;

const L = {
  organizersOnly: /Тільки для Організаторів|Organizers only/i,
  notFound: /Quiz not found|Квіз не знайдено/i,
  noQuestions: /no questions yet|ще немає питань/i,
  takeQuiz: { uk: /Пройти квіз/, en: /Take Quiz/ },
  createBtn: { uk: /Створити квіз/, en: /Create Quiz/ },
  preview: { uk: /^Перегляд$/, en: /^Preview$/ },
  edit: { uk: /^Редагувати$/, en: /^Edit$/ },
  manage: { uk: /Керувати сесією/, en: /Manage Session/ },
  activate: { uk: /^Активувати$/, en: /^Activate$/ },
  deactivate: { uk: /^Деактивувати$/, en: /^Deactivate$/ },
  leaderboard: { uk: /Таблиця лідерів/, en: /Leaderboard/ },
  noQuizzesMember: { uk: /Організатор ще не створив/, en: /organizer hasn't created/ },
  noQuizzesOrg: { uk: /Створіть перший квіз/, en: /Create your first quiz/ },
  next: { uk: /Далі →/, en: /Next →/ },
  prev: { uk: /← Назад/, en: /← Previous/ },
  submit: { uk: /Відправити відповіді/, en: /Submit Quiz/ },
  result: { uk: /Перегляд відповідей/, en: /Review Answers/ },
  continue: { uk: /^Далі →$/, en: /^Continue →$/ },
  addQuestion: { uk: /\+ Додати запитання/, en: /\+ Add Question/ },
  publish: { uk: /Опублікувати вікторину/, en: /Publish Quiz/ },
  save: { uk: /Зберегти зміни/, en: /Save Changes/ },
  titleRequired: { uk: /Назва є обов'язковою/, en: /Title is required/ },
  titleMin: { uk: /Мінімум 3 символи/, en: /at least 3 characters/ },
  questionMin: { uk: /Мінімум 5 символів/, en: /at least 5 characters/ },
  qPlaceholder: { uk: /Яка головна тема розділу 3/, en: /What is the main theme of chapter 3/ },
  optionA: /^(Option|Варіант) A$/,
  optionB: /^(Option|Варіант) B$/,
  optionC: /^(Option|Варіант) C$/,
  optionD: /^(Option|Варіант) D$/,
  previewBanner: { uk: /Режим перегляду/, en: /Preview Mode/ },
  correctAnswer: { uk: /Правильн/, en: /Correct/ },
  startSession: { uk: /Почати сесію/, en: /Start Session/ },
  endSession: { uk: /Завершити сесію/, en: /End Session/ },
  refresh: { uk: /^Оновити$/, en: /^Refresh$/ },
  noParticipants: { uk: /Учасників ще немає/, en: /No participants yet/ },
  noActiveSession: { uk: /Немає активної сесії/, en: /No active session/ },
  noEvents: { uk: /не знайдено подій/, en: /No events found/ },
  questionOf: { uk: /Питання 1 з 3/, en: /Question 1 of 3/ },
} as const;

async function open(
  page: Page,
  viewer: Viewer,
  path: string,
  opts: Parameters<typeof installQuizMock>[2] = {},
  lang: Lang = 'uk',
  theme: 'light' | 'dark' = 'light',
): Promise<QuizMock> {
  const mock = await installQuizMock(page, viewer, opts);
  await page.context().addCookies(LANG_COOKIE(test.info().project.use.baseURL!, lang, theme));
  await page.goto(path);
  return mock;
}

const calls = (m: QuizMock, method: string, path: string | RegExp) =>
  m.log.filter((r) => r.method === method && (typeof path === 'string' ? r.path === path : path.test(r.path)));
const boardCalls = (m: QuizMock) => m.log.filter((r) => /\/leaderboard$/.test(r.path)).length;
const quizCalls = (m: QuizMock) => m.log.filter((r) => /\/quizzes/.test(r.path));
const card = (page: Page, title: string): Locator =>
  page.locator('h2', { hasText: title }).locator('xpath=ancestor::*[self::li or contains(@class,"glass-card")][1]');
const heading = (page: Page) => page.getByRole('heading', { level: 1 }).first();

/** A double click must send one request. Next does; the Angular buttons are not locked before the second click, so it may send two (D-11). */
function onceOnNext(n: number): void {
  test.info().annotations.push({ type: 'har', description: `double click sent ${n} request(s)` });
  if (isNext()) expect(n).toBe(1);
  else expect(n).toBeGreaterThanOrEqual(1);
}

/** Raw option click: a label (Next) or a button (Angular) holding the option text. */
const choose = (page: Page, text: RegExp) => page.getByText(text).first().click();

// ---------------------------------------------------------------------------------------------------------------------
// P1/P4 guards
// ---------------------------------------------------------------------------------------------------------------------
const ROUTES: [string, string][] = [
  ['list', base],
  ['create', `${base}/create`],
  ['take', `${base}/${QZ.active}`],
  ['edit', `${base}/${QZ.draft}/edit`],
  ['preview', `${base}/${QZ.draft}/preview`],
  ['session', `${base}/${QZ.live}/session`],
  ['leaderboard', `${base}/${QZ.live}/leaderboard`],
];

test.describe('guest guard (P1/P4)', () => {
  for (const [name, path] of ROUTES) {
    test(`a guest on the ${name} route ends on /login without any quiz call`, async ({ page }) => {
      const mock = await open(page, 'guest', path);
      await page.waitForURL(/\/login/);
      expect(quizCalls(mock).filter((r) => !/\/my-membership$/.test(r.path))).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------------------------------------------------
// role gates: organizer screens
// ---------------------------------------------------------------------------------------------------------------------
const GATED: [string, string][] = [
  ['create', `${base}/create`],
  ['edit', `${base}/${QZ.draft}/edit`],
  ['preview', `${base}/${QZ.draft}/preview`],
  ['session', `${base}/${QZ.live}/session`],
];

/** Who may open the organizer screens: the club's owner on both; a per-club co-organizer on Next only; a global organizer who is only a member on Angular only (D-1). */
const ALLOWED: Record<Viewer, { next: boolean; legacy: boolean }> = {
  guest: { next: false, legacy: false },
  member: { next: false, legacy: false },
  owner: { next: true, legacy: true },
  coorg: { next: true, legacy: false },
  globalorg: { next: false, legacy: true },
};

test.describe('role gates on create/edit/preview/session (P4)', () => {
  for (const viewer of ['member', 'owner', 'coorg', 'globalorg'] as const) {
    for (const [name, path] of GATED) {
      test(`${viewer} on ${name}`, async ({ page }, ti) => {
        const mock = await open(page, viewer, path);
        const allowed = ALLOWED[viewer][ti.project.name as 'next' | 'legacy'];
        if (allowed) {
          await expect(heading(page)).toBeVisible();
          await expect(page.getByText(L.organizersOnly)).toHaveCount(0);
          await expect(page).toHaveURL(new RegExp(`${path}$`));
        } else {
          await expect(page.getByText(L.organizersOnly).first()).toBeVisible();
          // Angular redirects to /clubs, Next shows the notice in place (D-2)
          if (isNext()) await expect(page).toHaveURL(new RegExp(`${path}$`));
          else await expect(page).toHaveURL(/\/clubs$/);
          expect(calls(mock, 'POST', /\/quizzes/)).toEqual([]);
          expect(calls(mock, 'PATCH', /\/quizzes/)).toEqual([]);
        }
      });
    }
  }

  test('take and leaderboard are open to any signed-in viewer (no role gate)', async ({ page }) => {
    await open(page, 'member', `${base}/${QZ.live}`);
    await expect(page.getByText('Питання наживо')).toBeVisible();
    await page.goto(`${base}/${QZ.live}/leaderboard`);
    await expect(page.getByText(L.organizersOnly)).toHaveCount(0);
    await expect(heading(page)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------------------------------------------------
for (const lang of ['uk', 'en'] as const) {
  test.describe(`list ${lang}`, () => {
    test('owner: five cards with the per-status actions; one GET /clubs/:id/quizzes', async ({ page }) => {
      const errors = watchConsole(page);
      const mock = await open(page, 'owner', base, {}, lang);
      await expect(card(page, 'Чернетка про Місто')).toBeVisible();
      await expect(page.getByRole('link', { name: L.createBtn[lang] })).toBeVisible();

      const draft = card(page, 'Чернетка про Місто');
      await expect(draft.getByRole('link', { name: L.preview[lang] })).toBeVisible();
      await expect(draft.getByRole('link', { name: L.edit[lang] })).toBeVisible();
      await expect(draft.getByRole('button', { name: L.activate[lang] })).toBeVisible();
      await expect(draft.getByRole('link', { name: L.manage[lang] })).toHaveCount(0);

      const active = card(page, 'Активний квіз');
      await expect(active.getByRole('link', { name: L.manage[lang] })).toBeVisible();
      await expect(active.getByRole('button', { name: L.deactivate[lang] })).toBeVisible();
      await expect(active.getByRole('link', { name: L.edit[lang] })).toHaveCount(0);

      const live = card(page, 'Квіз наживо');
      await expect(live.getByRole('link', { name: L.manage[lang] })).toBeVisible();
      await expect(live.getByRole('link', { name: L.leaderboard[lang] })).toBeVisible();
      await expect(live.getByRole('button', { name: /Activate|Активувати|Deactivate|Деактивувати/ })).toHaveCount(0);

      const closed = card(page, 'Закритий квіз');
      await expect(closed.getByRole('link', { name: L.preview[lang] })).toBeVisible();
      await expect(closed.getByRole('link', { name: L.manage[lang] })).toHaveCount(0);

      expect(calls(mock, 'GET', `/clubs/${CLUB}/quizzes`)).toHaveLength(1);
      expect(errors).toEqual([]);
    });

    test('member: only Take on active/live quizzes, Leaderboard on live, no organizer controls', async ({ page }) => {
      const mock = await open(page, 'member', base, {}, lang);
      await expect(card(page, 'Активний квіз')).toBeVisible();
      await expect(page.getByRole('link', { name: L.createBtn[lang] })).toHaveCount(0);
      await expect(page.getByText(L.takeQuiz[lang])).toHaveCount(3); // active, live, empty (active)
      await expect(card(page, 'Чернетка про Місто').getByText(L.takeQuiz[lang])).toHaveCount(0);
      await expect(card(page, 'Закритий квіз').getByText(L.takeQuiz[lang])).toHaveCount(0);
      await expect(card(page, 'Квіз наживо').getByRole('link', { name: L.leaderboard[lang] })).toBeVisible();
      await expect(page.getByRole('link', { name: L.manage[lang] })).toHaveCount(0);
      await expect(page.getByRole('button', { name: L.activate[lang] })).toHaveCount(0);
      // one answer to "am I an organizer": Next asks /clubs/:id/my-membership + /clubs/:id, Angular uses the global role
      test.info().annotations.push({ type: 'har', description: `member list: ${mock.log.map((r) => `${r.method} ${r.path}`).join(', ')}` });
    });

    test('empty state per role', async ({ page }) => {
      await open(page, 'member', base, { quizzes: [] }, lang);
      await expect(page.getByText(L.noQuizzesMember[lang])).toBeVisible();
      await page.unroute('**/api/v1/**');
      await open(page, 'owner', base, { quizzes: [] }, lang);
      await expect(page.getByText(L.noQuizzesOrg[lang])).toBeVisible();
    });
  });
}

test.describe('list actions', () => {
  test('Activate flips the button: one PATCH /quizzes/:id/active {isActive:true}', async ({ page }) => {
    const mock = await open(page, 'owner', base);
    await card(page, 'Чернетка про Місто').getByRole('button', { name: L.activate.uk }).click();
    await expect(card(page, 'Чернетка про Місто').getByRole('button', { name: L.deactivate.uk })).toBeVisible();
    const patches = calls(mock, 'PATCH', `/quizzes/${QZ.draft}/active`);
    expect(patches).toHaveLength(1);
    expect(JSON.parse(patches[0]!.body!)).toEqual({ isActive: true });
  });

  test('a failed toggle keeps the old button and does not hang', async ({ page }) => {
    await open(page, 'owner', base, { fail: { 'PATCH /quizzes/:id/active': 500 } });
    const btn = card(page, 'Чернетка про Місто').getByRole('button', { name: L.activate.uk });
    await btn.click();
    await expect(btn).toBeEnabled();
    await expect(card(page, 'Чернетка про Місто').getByRole('button', { name: L.deactivate.uk })).toHaveCount(0);
  });

  test('a double click on Activate sends one PATCH', async ({ page }) => {
    const mock = await open(page, 'owner', base, { latency: { 'PATCH /quizzes/:id/active': 500 } });
    const btn = card(page, 'Чернетка про Місто').getByRole('button', { name: L.activate.uk });
    await btn.dblclick();
    await page.waitForTimeout(900);
    onceOnNext(calls(mock, 'PATCH', `/quizzes/${QZ.draft}/active`).length);
  });

  test('a failing list request is an error state, not a blank page', async ({ page }) => {
    await open(page, 'member', base, { fail: { 'GET /clubs/:id/quizzes': 500 } });
    await expect(heading(page)).toBeVisible();
    await expect(page.getByText(L.takeQuiz.uk)).toHaveCount(0);
    if (isNext()) await expect(page.getByRole('button', { name: /Спробувати|Retry|Try again|Повторити/i }).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// create / publish
// ---------------------------------------------------------------------------------------------------------------------
async function addQuestion(page: Page, lang: Lang, text: string, correct: number): Promise<void> {
  await page.locator('input[type=radio]').first().waitFor(); // step 2 is rendered (step 1 also has a textarea)
  await page.locator('main textarea').fill(text);
  await page.getByLabel(L.optionA).fill(`${text} A`);
  await page.getByLabel(L.optionB).fill(`${text} B`);
  await page.getByLabel(L.optionC).fill(`${text} C`);
  await page.getByLabel(L.optionD).fill(`${text} D`);
  await page.locator('input[type=radio]').nth(correct).check();
  await page.getByRole('button', { name: L.addQuestion[lang] }).click();
}

async function details(page: Page, lang: Lang, title: string, description = ''): Promise<void> {
  await page.locator('#quiz-title').fill(title);
  if (description) await page.locator('main textarea').first().fill(description);
  await page.getByRole('button', { name: L.continue[lang] }).click();
}

for (const lang of ['uk', 'en'] as const) {
  test.describe(`create ${lang}`, () => {
    test('step 1 validation: required, minimum, no step change while invalid', async ({ page }) => {
      await open(page, 'owner', `${base}/create`, {}, lang);
      const title = page.locator('#quiz-title');
      await title.focus();
      await title.blur();
      await expect(page.getByText(L.titleRequired[lang])).toBeVisible();
      await title.fill('ab');
      await title.blur();
      await expect(page.getByText(L.titleMin[lang])).toBeVisible();
      await expect(page.getByRole('button', { name: L.publish[lang] })).toHaveCount(0);
      await title.fill('Назва квізу');
      await expect(page.getByText(L.titleMin[lang])).toHaveCount(0);
    });

    test('step 2 validation: question minimum, nothing added while invalid', async ({ page }) => {
      await open(page, 'owner', `${base}/create`, {}, lang);
      await details(page, lang, 'Назва квізу');
      const q = page.getByPlaceholder(L.qPlaceholder[lang]);
      await q.fill('abc');
      await q.blur();
      await expect(page.getByText(L.questionMin[lang])).toBeVisible();
      await expect(page.getByRole('button', { name: L.publish[lang] })).toBeDisabled();
    });

    test('publish: POST quiz, one POST per question in order, PATCH active, back on the list', async ({ page }) => {
      const mock = await open(page, 'owner', `${base}/create`, {}, lang);
      await details(page, lang, '  Квіз про Київ  ', 'Опис квізу');
      await addQuestion(page, lang, 'Перше питання', 2);
      await addQuestion(page, lang, 'Друге питання', 0);
      await expect(page.getByText('Перше питання').first()).toBeVisible();
      await expect(page.getByText('Друге питання').first()).toBeVisible();
      await page.getByRole('button', { name: L.publish[lang] }).click();
      await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
      await expect(card(page, 'Квіз про Київ')).toBeVisible();

      const created = calls(mock, 'POST', `/clubs/${CLUB}/quizzes`);
      expect(created).toHaveLength(1);
      expect(JSON.parse(created[0]!.body!)).toEqual({ title: 'Квіз про Київ', description: 'Опис квізу' });
      const posts = calls(mock, 'POST', /\/quizzes\/[0-9a-f-]{36}\/questions$/);
      expect(posts.map((r) => JSON.parse(r.body!))).toEqual([
        { question: 'Перше питання', options: ['Перше питання A', 'Перше питання B', 'Перше питання C', 'Перше питання D'], correctIndex: 2 },
        { question: 'Друге питання', options: ['Друге питання A', 'Друге питання B', 'Друге питання C', 'Друге питання D'], correctIndex: 0 },
      ]);
      const active = calls(mock, 'PATCH', /\/active$/);
      expect(active).toHaveLength(1);
      expect(JSON.parse(active[0]!.body!)).toEqual({ isActive: true });
      // order: create, questions, activate
      const order = mock.log.filter((r) => r.method !== 'GET' && /\/quizzes/.test(r.path)).map((r) => `${r.method} ${r.path.replace(/[0-9a-f-]{36}/g, ':id')}`);
      expect(order).toEqual(['POST /clubs/:id/quizzes', 'POST /quizzes/:id/questions', 'POST /quizzes/:id/questions', 'PATCH /quizzes/:id/active']);
    });
  });
}

test.describe('create failure and retry', () => {
  test('a failure on the 2nd question shows an alert; the retry reuses the quiz on Next, creates a second one on Angular (D-6)', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/create`, {
      failNth: { 'POST /quizzes/:id/questions': { n: 2, status: 500 } },
    }, 'en');
    await details(page, 'en', 'Retry quiz');
    await addQuestion(page, 'en', 'First question', 0);
    await addQuestion(page, 'en', 'Second question', 1);
    const publish = page.getByRole('button', { name: L.publish.en });
    await publish.click();
    await expect(page.getByText(/Could not save the quiz|forced failure|Internal|error/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/quizzes\/create$/);
    await expect(publish).toBeEnabled();
    await publish.click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
    const creates = calls(mock, 'POST', `/clubs/${CLUB}/quizzes`).length;
    if (isNext()) {
      expect(creates, 'Next resumes on the quiz it already created').toBe(1);
      expect(calls(mock, 'PATCH', /\/quizzes\/[0-9a-f-]{36}$/)).toHaveLength(1);
    } else {
      expect(creates, 'Angular creates a second quiz on retry (orphan)').toBe(2);
    }
    test.info().annotations.push({ type: 'har', description: `POST quizzes x${creates}, POST questions x${calls(mock, 'POST', /\/questions$/).length}` });
  });

  test('a double click on publish creates one quiz', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/create`, { latency: { 'POST /clubs/:id/quizzes': 600 } });
    await details(page, 'uk', 'Подвійний клік');
    await addQuestion(page, 'uk', 'Єдине питання', 0);
    const publish = page.getByRole('button', { name: L.publish.uk });
    await publish.dblclick();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
    onceOnNext(calls(mock, 'POST', `/clubs/${CLUB}/quizzes`).length);
  });

  test('publish needs at least one question', async ({ page }) => {
    await open(page, 'owner', `${base}/create`);
    await details(page, 'uk', 'Без питань');
    await expect(page.getByRole('button', { name: L.publish.uk })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// edit
// ---------------------------------------------------------------------------------------------------------------------
test.describe('edit', () => {
  test('loads the draft: title, then its two saved questions', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/${QZ.draft}/edit`, {}, 'en');
    await expect(page.locator('#quiz-title')).toHaveValue('Чернетка про Місто');
    await page.getByRole('button', { name: L.continue.en }).click();
    await expect(page.getByText('Перше питання чернетки').first()).toBeVisible();
    await expect(page.getByText('Друге питання чернетки').first()).toBeVisible();
    // the organizer sees the stored answer
    await expect(page.getByText(/Варіант-1-B/).first()).toBeVisible();
    expect(calls(mock, 'GET', `/quizzes/${QZ.draft}`).length).toBeGreaterThanOrEqual(1);
  });

  test('save: PATCH quiz, DELETE the removed question, POST the new one, back on the list', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/${QZ.draft}/edit`, {}, 'en');
    await expect(page.locator('#quiz-title')).toHaveValue('Чернетка про Місто');
    await page.locator('#quiz-title').fill('Нова назва');
    await page.getByRole('button', { name: L.continue.en }).click();
    await page.locator('button:has-text("✕")').first().click(); // removes the first saved question
    await addQuestion(page, 'en', 'Нове питання', 3);
    await page.getByRole('button', { name: L.save.en }).click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));

    const patch = calls(mock, 'PATCH', `/quizzes/${QZ.draft}`);
    expect(patch).toHaveLength(1);
    expect(JSON.parse(patch[0]!.body!)).toMatchObject({ title: 'Нова назва' });
    expect(calls(mock, 'DELETE', /\/questions\/b2000000-0000-4000-8000-000000000001$/)).toHaveLength(1);
    const added = calls(mock, 'POST', /\/questions$/);
    expect(added).toHaveLength(1);
    expect(JSON.parse(added[0]!.body!)).toMatchObject({ question: 'Нове питання', correctIndex: 3 });
    // the unchanged saved question: Angular re-PATCHes every saved question, Next only sends what changed (D-7)
    const updates = calls(mock, 'PATCH', /\/questions\/[0-9a-f-]{36}$/).length;
    expect(updates).toBe(isNext() ? 0 : 1);
  });

  test('a non-draft quiz is read-only on Next (locked notice, no save); Angular only disables the details form (D-8)', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/${QZ.active}/edit`, {}, 'en');
    await expect(heading(page)).toBeVisible();
    if (isNext()) {
      await expect(page.getByRole('alert').filter({ hasText: /cannot be edited/ })).toBeVisible();
      await expect(page.locator('#quiz-title')).toBeDisabled();
      await page.getByRole('button', { name: /^Continue →$/ }).click({ trial: true }).catch(() => undefined);
    } else {
      await expect(page.locator('#quiz-title')).toBeDisabled();
    }
    expect(calls(mock, 'PATCH', /\/quizzes\//)).toEqual([]);
  });

  test('a failing save shows the error and leaves the page', async ({ page }) => {
    await open(page, 'owner', `${base}/${QZ.draft}/edit`, { fail: { 'PATCH /quizzes/:id': 500 } }, 'en');
    await expect(page.locator('#quiz-title')).toHaveValue('Чернетка про Місто');
    await page.getByRole('button', { name: L.continue.en }).click();
    await page.getByRole('button', { name: L.save.en }).click();
    await expect(page.getByText(/Could not save the quiz|forced failure|error/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/edit$/);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// preview
// ---------------------------------------------------------------------------------------------------------------------
test.describe('preview', () => {
  for (const lang of ['uk', 'en'] as const) {
    test(`organizer sees the banner, the marked correct answer and walks the questions ${lang}`, async ({ page }) => {
      const mock = await open(page, 'owner', `${base}/${QZ.draft}/preview`, {}, lang);
      await expect(page.getByText(L.previewBanner[lang])).toBeVisible();
      await expect(page.getByText('Перше питання чернетки')).toBeVisible();
      await expect(page.getByText(L.correctAnswer[lang]).first()).toBeVisible();
      await page.getByRole('button', { name: L.next[lang] }).click();
      await expect(page.getByText('Друге питання чернетки')).toBeVisible();
      await page.getByRole('button', { name: L.prev[lang] }).click();
      await expect(page.getByText('Перше питання чернетки')).toBeVisible();
      expect(calls(mock, 'PATCH', /\/active$/)).toEqual([]);
    });
  }

  test('activate on the last question: one PATCH active, back on the list', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/${QZ.draft}/preview`);
    await page.getByRole('button', { name: L.next.uk }).click();
    await page.getByRole('button', { name: /Активувати квіз|Activate Quiz/ }).click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
    const patches = calls(mock, 'PATCH', `/quizzes/${QZ.draft}/active`);
    expect(patches).toHaveLength(1);
    expect(JSON.parse(patches[0]!.body!)).toEqual({ isActive: true });
  });

  test('a quiz without questions says so and links to the editor', async ({ page }) => {
    await open(page, 'owner', `${base}/${QZ.empty}/preview`);
    await expect(page.getByText(/Питань ще немає|No questions yet/)).toBeVisible();
    await expect(page.locator(`a[href$="/${QZ.empty}/edit"]`)).toBeVisible();
  });

  test('an activate failure keeps the page and re-enables the button', async ({ page }) => {
    await open(page, 'owner', `${base}/${QZ.draft}/preview`, { fail: { 'PATCH /quizzes/:id/active': 500 } });
    await page.getByRole('button', { name: L.next.uk }).click();
    const activate = page.getByRole('button', { name: /Активувати квіз|Activate Quiz/ });
    await activate.click();
    await expect(activate).toBeEnabled();
    await expect(page).toHaveURL(/\/preview$/);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// session (organizer)
// ---------------------------------------------------------------------------------------------------------------------
test.describe('session', () => {
  for (const lang of ['uk', 'en'] as const) {
    test(`running session ${lang}: live badge, participants, podium + rest table, refresh = one more GET`, async ({ page }) => {
      const mock = await open(page, 'owner', `${base}/${QZ.live}/session`, {}, lang);
      await expect(page.getByText(/👥\s*7\b/)).toBeVisible();
      await expect(page.getByText('Гравець 1').first()).toBeVisible();
      await expect(page.getByText('Гравець 3').first()).toBeVisible();
      await expect(page.getByText('Гравець 5').first()).toBeVisible();
      await expect(page.locator('table tbody tr')).toHaveCount(2);
      await expect.poll(() => boardCalls(mock)).toBe(1);
      expect(calls(mock, 'GET', `/quizzes/${QZ.live}/sessions/active`).length).toBe(1);
      await page.getByRole('button', { name: L.refresh[lang] }).click();
      await expect.poll(() => boardCalls(mock)).toBe(2);
    });
  }

  test('no session: starter lists the club events, Start is disabled until one is chosen, POST sessions {eventId}', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/${QZ.active}/session`);
    const start = page.getByRole('button', { name: L.startSession.uk });
    await expect(start).toBeDisabled();
    const select = page.locator('#event-select');
    await expect(select.locator('option')).not.toHaveCount(1);
    await select.selectOption({ index: 1 });
    await expect(start).toBeEnabled();
    await start.click();
    await expect(page.getByText(/👥\s*0\b/)).toBeVisible();
    const posts = calls(mock, 'POST', `/quizzes/${QZ.active}/sessions`);
    expect(posts).toHaveLength(1);
    expect(JSON.parse(posts[0]!.body!)).toEqual({ eventId: EVENT_ID });
    expect(calls(mock, 'GET', `/clubs/${CLUB}/events`).length).toBeGreaterThanOrEqual(1);
  });

  test('no events: the hint is shown and Start stays disabled', async ({ page }) => {
    await open(page, 'owner', `${base}/${QZ.active}/session`, { noEvents: true });
    await expect(page.getByText(L.noEvents.uk)).toBeVisible();
    await expect(page.getByRole('button', { name: L.startSession.uk })).toBeDisabled();
  });

  test('end session: PATCH close, then the quiz list', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/${QZ.live}/session`);
    await page.getByRole('button', { name: L.endSession.uk }).click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
    expect(calls(mock, 'PATCH', `/quizzes/${QZ.live}/sessions/${SESSION_ID}/close`)).toHaveLength(1);
  });

  test('a failing end keeps the session on screen and the button usable', async ({ page }) => {
    await open(page, 'owner', `${base}/${QZ.live}/session`, { fail: { 'PATCH /quizzes/:id/sessions/:id/close': 500 } });
    const end = page.getByRole('button', { name: L.endSession.uk });
    await end.click();
    await expect(end).toBeEnabled();
    await expect(page).toHaveURL(/\/session$/);
  });

  test('an empty leaderboard says nobody has joined', async ({ page }) => {
    await open(page, 'owner', `${base}/${QZ.live}/session`, { leaderboard: [] });
    await expect(page.getByText(L.noParticipants.uk)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// take (member)
// ---------------------------------------------------------------------------------------------------------------------
test.describe('take', () => {
  for (const lang of ['uk', 'en'] as const) {
    test(`member answers three questions and submits once ${lang}`, async ({ page }) => {
      const errors = watchConsole(page);
      const mock = await open(page, 'member', `${base}/${QZ.active}`, {}, lang);
      await expect(page.getByText('Хто автор Міста?')).toBeVisible();
      await expect(page.getByText(L.questionOf[lang])).toBeVisible();
      const next = page.getByRole('button', { name: L.next[lang] });
      await expect(next).toBeDisabled();
      await choose(page, /Варіант-11-B/);
      await next.click();
      await expect(page.getByText('Де відбувається дія?')).toBeVisible();
      await page.getByRole('button', { name: L.prev[lang] }).click();
      await expect(page.getByText('Хто автор Міста?')).toBeVisible();
      await page.getByRole('button', { name: L.next[lang] }).click();
      await choose(page, /Варіант-12-A/);
      await page.getByRole('button', { name: L.next[lang] }).click();
      const submit = page.getByRole('button', { name: L.submit[lang] });
      await expect(submit).toBeDisabled();
      await choose(page, /Варіант-13-C/); // wrong on purpose (correct is D)
      await submit.click();
      await expect(page.getByText(/(^|\s)2\s*\/\s*3(\s|$)/).first()).toBeVisible();
      await expect(page.getByText(L.result[lang])).toBeVisible();
      const posts = calls(mock, 'POST', `/quizzes/${QZ.active}/attempts`);
      expect(posts).toHaveLength(1);
      expect(JSON.parse(posts[0]!.body!)).toEqual({ answers: [1, 0, 2] });
      expect(errors).toEqual([]);
    });
  }

  test('hidden correctIndex for a member: Next shows neutral results, Angular marks every answer wrong (D-3)', async ({ page }) => {
    await open(page, 'member', `${base}/${QZ.active}`, {}, 'en');
    for (const pick of [/Варіант-11-B/, /Варіант-12-A/, /Варіант-13-C/]) {
      await choose(page, pick);
      const next = page.getByRole('button', { name: L.next.en });
      if (await next.isVisible().catch(() => false)) await next.click();
    }
    await page.getByRole('button', { name: L.submit.en }).click();
    await expect(page.getByText(L.result.en)).toBeVisible();
    // the server score still counts (2 of 3); only the per-question reveal differs
    await expect(page.getByText(/(^|\s)2\s*\/\s*3(\s|$)/).first()).toBeVisible();
    const review = page.locator('body');
    if (isNext()) {
      await expect(review).not.toContainText('✅');
      await expect(review).not.toContainText('❌');
      await expect(page.getByText(/^Correct$/)).toHaveCount(0);
    } else {
      await expect(review).toContainText('❌');
      await expect(page.getByText('❌')).toHaveCount(3);
      await expect(review).not.toContainText('✅');
    }
  });

  test('an organizer viewing the same quiz sees correctness marks on both targets', async ({ page }) => {
    await open(page, 'owner', `${base}/${QZ.active}`, {}, 'en');
    for (const pick of [/Варіант-11-B/, /Варіант-12-A/, /Варіант-13-C/]) {
      await choose(page, pick);
      const next = page.getByRole('button', { name: L.next.en });
      if (await next.isVisible().catch(() => false)) await next.click();
    }
    await page.getByRole('button', { name: L.submit.en }).click();
    await expect(page.getByText(L.result.en)).toBeVisible();
    await expect(page.getByText('✅')).toHaveCount(2);
    await expect(page.getByText('❌')).toHaveCount(1);
  });

  test('a failing submit keeps the answers and allows a second try (Next) / shows the error (Angular)', async ({ page }) => {
    const mock = await open(page, 'member', `${base}/${QZ.live}`, { failNth: { 'POST /quizzes/:id/attempts': { n: 1, status: 500 } } });
    await choose(page, /Варіант-21-A/);
    await page.getByRole('button', { name: L.submit.uk }).click();
    await expect.poll(() => calls(mock, 'POST', /\/attempts$/).length).toBe(1);
    if (isNext()) {
      await expect(page.getByRole('button', { name: L.submit.uk })).toBeEnabled();
      await page.getByRole('button', { name: L.submit.uk }).click();
      await expect(page.getByText(L.result.uk)).toBeVisible();
      expect(calls(mock, 'POST', /\/attempts$/)).toHaveLength(2);
    } else {
      // Angular turns a failed submit into a terminal error state with a return link
      await expect(page.getByText(/forced failure|error/i).first()).toBeVisible();
    }
  });

  test('a double click on Submit posts one attempt', async ({ page }) => {
    const mock = await open(page, 'member', `${base}/${QZ.live}`, { latency: { 'POST /quizzes/:id/attempts': 600 } });
    await choose(page, /Варіант-21-C/);
    await page.getByRole('button', { name: L.submit.uk }).dblclick();
    await page.waitForTimeout(900);
    onceOnNext(calls(mock, 'POST', /\/attempts$/).length);
  });

  test('a quiz without questions', async ({ page }) => {
    await open(page, 'member', `${base}/${QZ.empty}`);
    await expect(page.getByText(L.noQuestions)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// leaderboard + polling
// ---------------------------------------------------------------------------------------------------------------------
const hide = (page: Page, state: 'hidden' | 'visible') =>
  page.evaluate((s) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => s });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => s === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
  }, state);

test.describe('leaderboard', () => {
  for (const lang of ['uk', 'en'] as const) {
    test(`podium for ranks 1-3, table for 4-5, one board GET ${lang}`, async ({ page }) => {
      const mock = await open(page, 'member', `${base}/${QZ.live}/leaderboard`, {}, lang);
      await expect(heading(page)).toBeVisible();
      for (const n of [1, 2, 3, 4, 5]) await expect(page.getByText(`Гравець ${n}`).first()).toBeVisible();
      await expect(page.locator('table tbody tr')).toHaveCount(2);
      await expect.poll(() => boardCalls(mock)).toBe(1);
      expect(calls(mock, 'GET', `/quizzes/${QZ.live}/sessions/active`)).toHaveLength(1);
    });
  }

  test('no active session shows the empty message and never asks for a board', async ({ page }) => {
    const mock = await open(page, 'member', `${base}/${QZ.live}/leaderboard`, { session: null });
    await expect(page.getByText(L.noActiveSession.uk)).toBeVisible();
    await page.waitForTimeout(500);
    expect(boardCalls(mock)).toBe(0);
  });

  test('session with no participants', async ({ page }) => {
    await open(page, 'member', `${base}/${QZ.live}/leaderboard`, { leaderboard: [] });
    await expect(page.getByText(/Учасників ще немає/)).toBeVisible();
  });

  test('a failing board request is an error state, not a blank page', async ({ page }) => {
    await open(page, 'member', `${base}/${QZ.live}/leaderboard`, { fail: { 'GET /quizzes/:id/sessions/:id/leaderboard': 500 } });
    await expect(heading(page)).toBeVisible();
    await expect(page.getByText('Гравець 1')).toHaveCount(0);
  });

  test('a new rank shows up at the next poll (30 s)', async ({ page }) => {
    await page.clock.install();
    const mock = await open(page, 'member', `${base}/${QZ.live}/leaderboard`);
    await expect(page.getByText('Гравець 1').first()).toBeVisible();
    mock.leaderboard = [entry(1, { displayName: 'Новий лідер' }), ...mock.leaderboard.slice(0, 4)];
    await page.clock.runFor(30_000);
    await expect(page.getByText('Новий лідер').first()).toBeVisible();
  });
});

test.describe('polling (P2): one request per period, none while the tab is hidden', () => {
  for (const [name, path, period, viewer] of [
    ['leaderboard', `${base}/${QZ.live}/leaderboard`, 30_000, 'member'],
    ['session', `${base}/${QZ.live}/session`, 15_000, 'owner'],
  ] as const) {
    test(`${name}: ${period / 1000} s period`, async ({ page }, ti) => {
      await page.clock.install();
      const mock = await open(page, viewer, path);
      await expect(page.getByText('Гравець 1').first()).toBeVisible();
      await expect.poll(() => boardCalls(mock)).toBe(1);
      const sessionGets = calls(mock, 'GET', `/quizzes/${QZ.live}/sessions/active`).length;

      // visible: exactly one board GET per period, nothing else polled
      await page.clock.runFor(period);
      await expect.poll(() => boardCalls(mock)).toBe(2);
      await page.clock.runFor(period);
      await expect.poll(() => boardCalls(mock)).toBe(3);
      await page.waitForTimeout(300);
      expect(boardCalls(mock), 'no duplicate request inside a period').toBe(3);
      expect(calls(mock, 'GET', `/quizzes/${QZ.live}/sessions/active`).length, 'the session is not re-polled').toBe(sessionGets);

      // hidden: five periods pass
      await hide(page, 'hidden');
      await page.clock.runFor(period * 5);
      await page.waitForTimeout(300);
      const whileHidden = boardCalls(mock);
      ti.annotations.push({ type: 'har', description: `${name}: board GETs while hidden over 5 periods = ${whileHidden - 3}` });
      if (isNext()) expect(whileHidden, 'a hidden tab does not poll').toBe(3);
      else expect(whileHidden, 'Angular setInterval keeps polling in a hidden tab (D-4)').toBeGreaterThan(3);

      // back in view: at most one catch-up request, then the normal rhythm
      await hide(page, 'visible');
      await page.waitForTimeout(500);
      const afterShow = boardCalls(mock);
      if (isNext()) expect(afterShow - whileHidden, 'one refetch when the tab returns').toBeLessThanOrEqual(1);
      await page.clock.runFor(period);
      await expect.poll(() => boardCalls(mock)).toBeGreaterThan(afterShow);
    });
  }

  test('leaving the page stops the polling (no request after navigation)', async ({ page }) => {
    await page.clock.install();
    const mock = await open(page, 'member', `${base}/${QZ.live}/leaderboard`);
    await expect(page.getByText('Гравець 1').first()).toBeVisible();
    await page.getByRole('link', { name: /До квізів|Back to Quizzes/ }).first().click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
    const before = boardCalls(mock);
    await page.clock.runFor(120_000);
    await page.waitForTimeout(300);
    expect(boardCalls(mock)).toBe(before);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// P1: invalid UUID, clubId mismatch, case
// ---------------------------------------------------------------------------------------------------------------------
test.describe('URLs (P1)', () => {
  const BAD = 'not-a-uuid';
  const bad: [string, string][] = [
    ['list with a bad club id', `/clubs/${BAD}/quizzes`],
    ['create with a bad club id', `/clubs/${BAD}/quizzes/create`],
    ['take with a bad quiz id', `${base}/${BAD}`],
    ['edit with a bad quiz id', `${base}/${BAD}/edit`],
    ['preview with a bad quiz id', `${base}/${BAD}/preview`],
    ['session with a bad quiz id', `${base}/${BAD}/session`],
    ['leaderboard with a bad quiz id', `${base}/${BAD}/leaderboard`],
  ];
  for (const [name, path] of bad) {
    test(`${name}: Next answers a real 404 and makes no quiz call (Angular: SPA shell, see D-5)`, async ({ page }, ti) => {
      const mock = await installQuizMock(page, 'owner');
      await page.context().addCookies(LANG_COOKIE(ti.project.use.baseURL!, 'uk', 'light'));
      const response = await page.goto(path);
      if (isNext()) {
        expect(response?.status()).toBe(404);
        await page.waitForTimeout(400);
        expect(quizCalls(mock).filter((r) => !/\/clubs\/[^/]+$/.test(r.path))).toEqual([]);
      } else {
        // the deployed Angular serves index.html (200) and the route component runs with the bad id
        expect(response?.status()).toBe(200);
        await page.waitForTimeout(800);
        ti.annotations.push({ type: 'har', description: `${name}: ${mock.log.map((r) => `${r.method} ${r.path}`).join(', ')}` });
      }
    });
  }

  test('a 404 quiz (valid UUID) reads as not found on both targets', async ({ page }) => {
    await open(page, 'member', `${base}/${QZ.missing}`);
    await expect(page.getByText(L.notFound).first()).toBeVisible();
  });

  test('a 404 quiz on the leaderboard/session: no crash, a message or an empty state', async ({ page }) => {
    const errors = watchConsole(page);
    await open(page, 'member', `${base}/${QZ.missing}/leaderboard`);
    await page.waitForTimeout(800);
    if (isNext()) await expect(page.getByText(L.notFound).first()).toBeVisible();
    expect(errors.filter((e) => /pageerror/.test(e))).toEqual([]);
  });

  test('clubId mismatch: a quiz of another club under this club is not found on Next, rendered on Angular (D-9)', async ({ page }) => {
    const mock = await open(page, 'member', `${base}/${QZ.foreign}`);
    if (isNext()) {
      await expect(page.getByText(L.notFound).first()).toBeVisible();
      await expect(page.getByText('Чуже питання')).toHaveCount(0);
    } else {
      await expect(page.getByText('Чуже питання')).toBeVisible();
    }
    expect(calls(mock, 'POST', /\/attempts$/)).toEqual([]);
  });

  test('clubId mismatch on the organizer screens (Next only guards): not found, nothing editable', async ({ page }) => {
    test.skip(!isNext(), 'Angular does not compare the quiz club with the URL (D-9)');
    await open(page, 'owner', `${base}/${QZ.foreign}/edit`);
    await expect(page.getByText(L.notFound).first()).toBeVisible();
    await expect(page.locator('#quiz-title')).toHaveCount(0);
  });

  test('an upper-case UUID in the URL: Next lower-cases it for the API, Angular passes it through (D-10)', async ({ page }) => {
    const mock = await open(page, 'member', `/clubs/${CLUB.toUpperCase()}/quizzes`);
    await expect(heading(page)).toBeVisible();
    await page.waitForTimeout(500);
    const list = mock.log.find((r) => /\/clubs\/[^/]+\/quizzes$/.test(r.path));
    expect(list, 'the list was requested').toBeTruthy();
    if (isNext()) expect(list!.path).toBe(`/clubs/${CLUB}/quizzes`);
    test.info().annotations.push({ type: 'har', description: `requested ${list?.path}` });
  });

  test('a trailing slash resolves to the same page on Next', async ({ page }) => {
    test.skip(!isNext(), 'Angular router ignores trailing slashes by default; nothing to compare');
    const mock = await open(page, 'member', `${base}/`);
    await expect(heading(page)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes/?$`));
    expect(calls(mock, 'GET', `/clubs/${CLUB}/quizzes`)).toHaveLength(1);
  });

  test('an unknown literal sibling (/quizzes/create is not a quiz id) never calls GET /quizzes/create', async ({ page }) => {
    const mock = await open(page, 'owner', `${base}/create`);
    await expect(heading(page)).toBeVisible();
    expect(mock.log.filter((r) => r.path === '/quizzes/create')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// P7 axe, P8 screenshots
// ---------------------------------------------------------------------------------------------------------------------
const PAGES: [string, Viewer, string, (p: Page) => Locator][] = [
  ['list-owner', 'owner', base, (p) => card(p, 'Чернетка про Місто')],
  ['list-member', 'member', base, (p) => card(p, 'Активний квіз')],
  ['take', 'member', `${base}/${QZ.active}`, (p) => p.getByText('Хто автор Міста?')],
  ['leaderboard', 'member', `${base}/${QZ.live}/leaderboard`, (p) => p.getByText('Гравець 1').first()],
  ['session', 'owner', `${base}/${QZ.live}/session`, (p) => p.getByText('Гравець 1').first()],
  ['preview', 'owner', `${base}/${QZ.draft}/preview`, (p) => p.getByText('Перше питання чернетки')],
  ['create', 'owner', `${base}/create`, (p) => p.locator('#quiz-title')],
];

const STRICT_CONTRAST = process.env['PARITY_STRICT_CONTRAST'] !== '0';

for (const lang of ['uk', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    for (const [name, viewer, path, ready] of PAGES) {
      test(`axe ${name} ${lang} ${theme}`, async ({ page }, ti) => {
        await open(page, viewer, path, {}, lang, theme);
        await expect(ready(page)).toBeVisible();
        await page.waitForLoadState('networkidle');
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
        const summary = results.violations.map(
          (v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ').slice(-60)).join(' | ')}`,
        );
        console.log(`[axe ${ti.project.name} ${name} ${lang} ${theme}] ${summary.length ? summary.join('\n  ') : 'no violations'}`);
        const bad = results.violations.filter((v) => (v.impact === 'serious' || v.impact === 'critical') && (STRICT_CONTRAST || v.id !== 'color-contrast'));
        // Angular is the frozen reference: its violations are recorded, the gate is for Next
        if (isNext()) expect(bad.map((v) => v.id)).toEqual([]);
        else ti.annotations.push({ type: 'axe', description: bad.map((v) => v.id).join(',') || 'none' });
      });
    }
  }
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [375, 768, 1280] as const) {
    for (const [name, viewer, path, ready] of PAGES) {
      test(`shot ${name} ${width} ${theme}`, async ({ page }, ti) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, viewer, path, {}, 'uk', theme);
        await expect(ready(page)).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SHOTS}/${ti.project.name}-${name}-${width}-${theme}.png`, fullPage: true });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, 'horizontal page scroll').toBeLessThanOrEqual(0);
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// P2 request journeys, written to playwright-report/parity/r11/har-<target>-<journey>.txt
// ---------------------------------------------------------------------------------------------------------------------
const dump = (name: string, mock: QuizMock, ti: { project: { name: string } }) =>
  writeFileSync(
    `${SHOTS}/har-${ti.project.name}-${name}.txt`,
    mock.log.map((r) => `${r.method} ${r.path.replace(/[0-9a-f-]{36}/g, ':id')}${r.query} ${r.method === 'GET' ? '' : (r.body ?? '')}`).join('\n') + '\n',
  );

test.describe('P2 request journeys', () => {
  test('member: list, take, submit, leaderboard', async ({ page }, ti) => {
    const mock = await open(page, 'member', base);
    await expect(card(page, 'Квіз наживо')).toBeVisible();
    await card(page, 'Квіз наживо').getByText(L.takeQuiz.uk).click();
    await choose(page, /Варіант-21-C/);
    await page.getByRole('button', { name: L.submit.uk }).click();
    await expect(page.getByText(L.result.uk)).toBeVisible();
    await page.goto(`${base}/${QZ.live}/leaderboard`);
    await expect(page.getByText('Гравець 1').first()).toBeVisible();
    await page.waitForTimeout(800);
    dump('member', mock, ti);
  });

  test('owner: list, preview, activate, session', async ({ page }, ti) => {
    const mock = await open(page, 'owner', base);
    await expect(card(page, 'Чернетка про Місто')).toBeVisible();
    await card(page, 'Чернетка про Місто').getByRole('link', { name: L.preview.uk }).click();
    await page.getByRole('button', { name: L.next.uk }).click();
    await page.getByRole('button', { name: /Активувати квіз|Activate Quiz/ }).click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
    await page.goto(`${base}/${QZ.live}/session`);
    await expect(page.getByText('Гравець 1').first()).toBeVisible();
    await page.waitForTimeout(800);
    dump('owner', mock, ti);
  });

  test('organizer: create and publish', async ({ page }, ti) => {
    const mock = await open(page, 'owner', `${base}/create`);
    await details(page, 'uk', 'Журнал запитів');
    await addQuestion(page, 'uk', 'Питання журналу', 1);
    await page.getByRole('button', { name: L.publish.uk }).click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${CLUB}/quizzes$`));
    await page.waitForTimeout(800);
    dump('create', mock, ti);
  });
});

// keep the unused fixture exports referenced so a rename shows up here
void OTHER_CLUB;
void liveSession;
