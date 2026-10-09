import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { Dashboard, heightOf } from './dashboard';
import { ID, mockManageReads, statsJson, t } from './test-support';

setupApiServer();

const list = (items: string[]) => new Intl.ListFormat('uk').format(items);

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

  it('shows a retryable error, not the empty message, when the request fails', async () => {
    let fail = true;
    server.use(http.get(`${API}/clubs/${ID}/stats`, () => (fail ? HttpResponse.json({ detail: 'x' }, { status: 500 }) : HttpResponse.json(statsJson()))));
    const user = userEvent.setup();
    renderWithProviders(<Dashboard clubId={ID} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.unexpected'));
    expect(screen.queryByText(t('CLUB_MANAGE.no_stats'))).not.toBeInTheDocument();
    fail = false;
    await user.click(screen.getByRole('button', { name: t('ERRORS.retry') }));
    expect(await screen.findByText('340')).toBeInTheDocument();
  });

  it('scales attendance by the largest value, not the newest', async () => {
    const at = (n: number, attendeeCount: number) => ({ eventId: `e${n}`, title: `Event ${n}`, date: '2099-01-01T00:00:00Z', attendeeCount });
    mockManageReads({ stats: statsJson({ recentAttendance: [at(3, 2), at(2, 20), at(1, 10)] }) });
    renderWithProviders(<Dashboard clubId={ID} />);
    expect(await screen.findByTitle('Event 2: 20')).toHaveStyle({ height: '100%' });
    expect(screen.getByTitle('Event 1: 10')).toHaveStyle({ height: '50%' });
    expect(screen.getByTitle('Event 3: 2')).toHaveStyle({ height: '10%' });
  });

  it('gives each chart a text alternative with its values', async () => {
    mockManageReads();
    renderWithProviders(<Dashboard clubId={ID} />);
    await screen.findByText('340');
    expect(screen.getByRole('img', { name: `${t('CLUB_MANAGE.member_growth')}: ${list(['2099-01: 3', '2099-02: 6'])}` })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `${t('ORGANIZER.attendance')}: ${list(['Emma talk: 4', 'Dune night: 8'])}` })).toBeInTheDocument();
  });

  it('keeps a title ending in a digit or holding a comma unambiguous in the chart summary', async () => {
    mockManageReads({ stats: statsJson({ recentAttendance: [{ eventId: 'e1', title: 'Club 7, part 2', date: '2099-01-01T00:00:00Z', attendeeCount: 1200 }] }) });
    renderWithProviders(<Dashboard clubId={ID} />);
    await screen.findByText('340');
    const name = screen.getByTitle(/Club 7, part 2/).parentElement!.getAttribute('aria-label')!;
    expect(name).toBe(`${t('ORGANIZER.attendance')}: ${screen.getByTitle(/Club 7, part 2/).getAttribute('title')}`);
    expect(name).toMatch(/Club 7, part 2: 1.200$/);
  });

  it('draws zero height for a negative count in a rendered chart', async () => {
    const at = (n: number, attendeeCount: number) => ({ eventId: `e${n}`, title: `Event ${n}`, date: '2099-01-01T00:00:00Z', attendeeCount });
    mockManageReads({ stats: statsJson({ recentAttendance: [at(2, -5), at(1, 10)] }) });
    renderWithProviders(<Dashboard clubId={ID} />);
    await screen.findByText('340');
    expect(screen.getByTitle(/Event 1/)).toHaveStyle({ height: '100%' });
    expect(screen.getByTitle(/Event 2/)).toHaveStyle({ height: '0%' });
  });

  it('heightOf never produces NaN or negative sizes', () => {
    expect(heightOf(Number.NaN, 10)).toBe('0%');
    expect(heightOf(-3, 10)).toBe('0%');
    expect(heightOf(Number.POSITIVE_INFINITY, 10)).toBe('0%');
    expect(heightOf(5, Number.NaN)).toBe('100%');
    expect(heightOf(5, -1)).toBe('100%');
    expect(heightOf(5, Number.POSITIVE_INFINITY)).toBe('100%');
  });
});
