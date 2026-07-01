import { memberTest, organizerTest, expect } from '../fixtures/auth.fixture';
import { loadRunContext } from '../fixtures/seed-helper';

const runContext = loadRunContext();

organizerTest.describe('clubs — organizer', () => {
  organizerTest('clubs list renders', async ({ page }) => {
    await page.goto('/clubs');
    await expect(page.getByTestId('club-card').first()).toBeVisible();
  });

  // The backend allows one club per organizer (409 ORGANIZER_ALREADY_HAS_CLUB
  // — app/services/club_service.py) and the seeded `organizer` persona already
  // owns the baseline club, so submitting this form for that persona always
  // hits the conflict. That's real product behavior worth covering — but note
  // ClubService.createClub() (core/services/club.service.ts) doesn't unwrap
  // the backend's structured error body, so create-club.component.ts's catch
  // block falls through to its generic 'Failed to create club' fallback
  // (`err instanceof Error` is false for an HttpErrorResponse) rather than
  // showing "You already own a club" — a minor UX gap, not something to
  // paper over in the test. A from-scratch "successful creation" flow is
  // exercised instead by the API suite's disposable-organizer club lifecycle test.
  organizerTest('create-club form surfaces an error when the organizer already owns a club', async ({ page }) => {
    await page.goto('/clubs/create');
    await page.getByTestId('club-name-input').fill(`PW Audit Created Club ${Date.now()}`);
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Failed to create club')).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL('/clubs/create');
  });

  organizerTest('club detail page renders the seeded club', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}`);
    await expect(page.getByTestId('club-name')).toBeVisible();
  });

  organizerTest('edit-club form saves changes', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/edit`);
    const updatedName = `PW Audit Club (edited ${Date.now()})`;
    await page.getByTestId('club-name-input').fill(updatedName);
    await page.getByTestId('save-button').click();
    await expect(page).toHaveURL(new RegExp(`/clubs/${runContext.clubId}$`), { timeout: 15_000 });
    await expect(page.getByTestId('club-name')).toHaveText(updatedName);
  });

  organizerTest('manage page renders for the club organizer', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/manage`);
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  organizerTest('randomizer spin control is visible', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/randomizer`);
    await expect(page.getByTestId('spin-button')).toBeVisible();
  });
});

memberTest.describe('clubs — member', () => {
  memberTest('clubs list renders for a regular member', async ({ page }) => {
    await page.goto('/clubs');
    await expect(page.getByTestId('club-card').first()).toBeVisible();
  });

  memberTest('member already joined the seeded club sees a leave button, not join', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}`);
    await expect(page.getByTestId('club-name')).toBeVisible();
    await expect(page.getByTestId('leave-button')).toBeVisible();
  });

  memberTest('member cannot reach /clubs/create — redirected away', async ({ page }) => {
    await page.goto('/clubs/create');
    await expect(page).toHaveURL(/\/clubs$/, { timeout: 10_000 });
  });

  memberTest('member cannot reach the club manage page — redirected away', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/manage`);
    await expect(page).toHaveURL(/\/clubs$/, { timeout: 10_000 });
  });

  memberTest('member cannot reach the randomizer — redirected away', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/randomizer`);
    await expect(page).toHaveURL(/\/clubs$/, { timeout: 10_000 });
  });
});
