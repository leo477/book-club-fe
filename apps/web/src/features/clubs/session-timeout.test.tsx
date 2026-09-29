import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PROBE_TIMEOUT_MS, resetSessionHint } from '@/lib/session-hint';
import { parsedClub, renderWithProviders } from '@/test/harness';
import { ClubsListClient } from './clubs-list-client';

beforeEach(() => {
  resetSessionHint();
  vi.useFakeTimers();
  // the probe never answers: a cold or unreachable backend
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('a hung session-status probe', () => {
  it('shows no CTA while pending, then the guest CTAs once the timeout resolves the session to guest', async () => {
    renderWithProviders(<ClubsListClient initialClubs={[parsedClub()]} />);
    expect(screen.queryByTestId('login-to-join')).toBeNull();

    await act(() => vi.advanceTimersByTimeAsync(PROBE_TIMEOUT_MS + 10));
    expect(screen.getByTestId('login-to-join')).toHaveAttribute('href', '/login');
    expect(screen.queryByTestId('card-actions-pending')).toBeNull();
  });
});
