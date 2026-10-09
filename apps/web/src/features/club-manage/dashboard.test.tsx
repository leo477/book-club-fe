import { screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { Dashboard } from './dashboard';
import { ID, mockManageReads, statsJson, t } from './test-support';

setupApiServer();

describe('Dashboard', () => {
  it('shows the headline numbers, charts and leaderboards', async () => {
    mockManageReads();
    renderWithProviders(<Dashboard clubId={ID} />);
    expect(await screen.findByText('340')).toBeInTheDocument();
    expect(screen.getByText(t('CLUB_MANAGE.stat_upcoming'))).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.getByTitle('2099-02: 6')).toHaveStyle({ height: '100%' });
    expect(screen.getByTitle('2099-01: 3')).toHaveStyle({ height: '50%' });
    expect(screen.getByTitle('Dune night: 8')).toHaveStyle({ height: '100%' });
    expect(screen.getByTitle('Emma talk: 4')).toHaveStyle({ height: '50%' });
    expect(screen.getByText(new RegExp(t('CLUB_MANAGE.banned_users')))).toBeInTheDocument();
  });

  it('omits empty sections and the banned counter at zero', async () => {
    mockManageReads({ stats: statsJson({ memberGrowth: [], eventFrequency: [], recentAttendance: [], topActive: [], topWinners: [], bannedUsersCount: 0 }) });
    renderWithProviders(<Dashboard clubId={ID} />);
    expect(await screen.findByText('340')).toBeInTheDocument();
    for (const key of ['CLUB_MANAGE.member_growth', 'CLUB_MANAGE.event_frequency', 'ORGANIZER.attendance', 'ORGANIZER.top_active', 'ORGANIZER.top_winners', 'CLUB_MANAGE.banned_users']) {
      expect(screen.queryByText(new RegExp(t(key)))).not.toBeInTheDocument();
    }
  });

  it('renders user text as text, never as markup', async () => {
    mockManageReads({ stats: statsJson({ topActive: [{ userId: 'x', displayName: '<img src=x onerror=alert(1)>', avatarUrl: null, count: 1 }] }) });
    renderWithProviders(<Dashboard clubId={ID} />);
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('says there are no statistics when the request fails', async () => {
    server.use(http.get(`${API}/clubs/${ID}/stats`, () => HttpResponse.json({ detail: 'x' }, { status: 404 })));
    renderWithProviders(<Dashboard clubId={ID} />);
    expect(await screen.findByText(t('CLUB_MANAGE.no_stats'))).toBeInTheDocument();
  });
});
