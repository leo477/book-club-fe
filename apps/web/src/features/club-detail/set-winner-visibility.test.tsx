import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { API, clubJson, eventJson, memberJson, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { ClubEventsInteractive } from './club-events';

vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn() }));

setupApiServer();

const club = { id: 'c1', organizerId: 'o1' };
const winnerLabel = new RegExp(messages.uk['EVENT.set_winner'] ?? '');
const historyTab = messages.uk['CLUB_DETAIL.events_tab_history'] ?? '';

function mockApi(user: string, role: 'organizer' | 'member') {
  let memberFetches = 0;
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ id: user }))),
    http.get(`${API}/clubs/my`, () => HttpResponse.json([clubJson({ id: 'c1' })])),
    http.get(`${API}/clubs/c1/events`, () => HttpResponse.json([eventJson({ date: '2020-01-01T10:00:00Z', hasWinner: true, winnerId: null })])),
    http.get(`${API}/clubs/c1/my-membership`, () => HttpResponse.json({ isMember: true, role, joinRequestStatus: 'none' })),
    http.get(`${API}/clubs/c1/members`, () => {
      memberFetches += 1;
      return HttpResponse.json([memberJson()]);
    }),
  );
  return () => memberFetches;
}

async function openHistory() {
  renderWithProviders(<ClubEventsInteractive club={club} initialEvents={[]} />);
  await userEvent.setup().click(await screen.findByRole('tab', { name: historyTab }));
  await screen.findByText('Dune night');
}

describe('set-winner control', () => {
  it('is shown to a co-organizer, who also gets the member picker', async () => {
    const fetches = mockApi('u1', 'organizer');
    await openHistory();
    expect(await screen.findByRole('button', { name: winnerLabel })).toBeInTheDocument();
    await waitFor(() => expect(fetches()).toBe(1));
  });

  it('is shown to the owner', async () => {
    mockApi('o1', 'organizer');
    await openHistory();
    expect(await screen.findByRole('button', { name: winnerLabel })).toBeInTheDocument();
  });

  it('is hidden from a plain member, without fetching the member list', async () => {
    const fetches = mockApi('u1', 'member');
    await openHistory();
    await new Promise((r) => setTimeout(r, 200));
    expect(screen.queryByRole('button', { name: winnerLabel })).toBeNull();
    expect(fetches()).toBe(0);
  });
});
