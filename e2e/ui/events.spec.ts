import { memberTest, organizerTest, expect } from '../fixtures/auth.fixture';
import { loadRunContext } from '../fixtures/seed-helper';

const runContext = loadRunContext();

memberTest.describe('events — member', () => {
  memberTest('events feed renders', async ({ page }) => {
    await page.goto('/events');
    await expect(page.getByTestId('event-card').first()).toBeVisible();
  });

  memberTest('event detail page renders the seeded event', async ({ page }) => {
    await page.goto(`/events/${runContext.eventId}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  memberTest('RSVP button toggles between join and attending state', async ({ page }) => {
    await page.goto(`/events/${runContext.eventId}`);
    const rsvpButton = page.locator('app-event-rsvp-button button');
    const initialText = await rsvpButton.textContent();
    await rsvpButton.click();
    await expect(rsvpButton).not.toHaveText(initialText ?? '', { timeout: 10_000 });
  });

  memberTest('member is redirected away from editing an event they do not organize', async ({ page }) => {
    await page.goto(`/events/${runContext.eventId}/edit`);
    await expect(page).toHaveURL(/\/events$/, { timeout: 10_000 });
  });
});

organizerTest.describe('events — organizer', () => {
  organizerTest('create-event flow from within the club creates a new event', async ({ page }) => {
    await page.goto(`/clubs/${runContext.clubId}/events/create`);
    const title = `PW Audit Event ${Date.now()}`;
    await page.getByTestId('event-title-input').fill(title);
    await page.getByTestId('date-input').fill('2027-01-15T18:00');
    // The backend requires `city` (app/schemas/events.py's CreateEventRequest),
    // but the form has no plain city field — city is only populated as a
    // side effect of picking a suggestion from <app-address-autocomplete>
    // (create-event.component.ts's onAddressSelect), which round-trips through
    // the live /geocode/autocomplete endpoint. Filling title+date alone (the
    // original version of this test) always 422s.
    await page.locator('app-address-autocomplete input').fill('Kyiv');
    await page.getByRole('option').first().click({ timeout: 15_000 });
    await page.locator('form button[type="submit"]').click();
    await expect(page).not.toHaveURL(/\/events\/create$/, { timeout: 15_000 });
  });

  organizerTest('edit-event form saves changes to the seeded event', async ({ page }) => {
    await page.goto(`/events/${runContext.eventId}/edit`);
    const updatedTitle = `PW Audit Event (edited ${Date.now()})`;
    await page.locator('#title').fill(updatedTitle);
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(`/events/${runContext.eventId}$`), { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();
  });
});
