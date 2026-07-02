import { memberTest, organizerTest, expect } from '../fixtures/auth.fixture';
import { loadRunContext } from '../fixtures/seed-helper';

const runContext = loadRunContext();

organizerTest.describe('quizzes — organizer', () => {
  organizerTest('quiz list renders for the seeded club', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  organizerTest('create-quiz wizard creates a quiz with one question and publishes it', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes/create`);
    await page.getByTestId('quiz-title-input').fill(`PW Audit Quiz ${Date.now()}`);
    await page.getByTestId('next-button').click();

    await page.locator('#q-text').fill('Which city hosts this audit?');
    await page.getByLabel('Option A').fill('Kyiv');
    await page.getByLabel('Option B').fill('Lviv');
    await page.getByLabel('Option C').fill('Odesa');
    await page.getByLabel('Option D').fill('Kharkiv');
    // quiz-create.component.html binds the radio's value via `[value]="idx"`
    // (an Angular property binding), which never reflects back as the `value`
    // HTML attribute — so a `[value="0"]` CSS attribute selector matches
    // nothing. Option A is rendered first, so `.first()` is correctIndex 0.
    await page.locator('input[type="radio"]').first().check();
    await page.locator('form button[type="submit"]:not([data-testid])').first().click();

    await page.getByRole('button', { name: /publish|опубл/i }).click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${runContext.clubId}/quizzes$`), { timeout: 15_000 });
  });

  organizerTest('edit-quiz page renders the seeded quiz', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/edit`);
    await expect(page.locator('#quiz-title')).toBeVisible();
  });

  organizerTest('preview page renders the seeded question', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/preview`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('capital of the book club universe')).toBeVisible();
  });

  organizerTest('session page renders the start-session controls', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/session`);
    await expect(page.locator('#event-select')).toBeVisible();
  });
});

memberTest.describe('quizzes — member', () => {
  memberTest('member cannot reach the quiz create wizard — redirected away', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes/create`);
    await expect(page).toHaveURL(/\/clubs$/, { timeout: 10_000 });
  });

  memberTest('take-quiz flow answers the seeded question and shows a score', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes/${runContext.quizId}`);
    await page.getByRole('button', { name: 'Kyiv' }).click();
    await page.getByRole('button', { name: /submit|відправити/i }).click();
    await expect(page.getByText(/\d+\/\d+/)).toBeVisible({ timeout: 15_000 });
  });

  memberTest('leaderboard page renders', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/quizzes/${runContext.quizId}/leaderboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
