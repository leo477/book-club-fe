import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gate, t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { QuizList } from './quiz-list';
import { CLUB, QUIZ, count, mockViewer, quizJson } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));

const OTHER = '11111111-2222-4333-8444-555555555555';
const base = `/clubs/${CLUB}/quizzes`;

const quizzes = () => [
  quizJson({ id: QUIZ, title: 'Draft one', status: 'draft', isActive: false }),
  quizJson({ id: OTHER, title: 'Active one', status: 'active', isActive: true, description: null }),
  quizJson({ id: 'c1', title: 'Live one', status: 'live', isActive: true }),
  quizJson({ id: 'c2', title: 'Closed one', status: 'closed', isActive: false }),
];

function setup(viewer: Parameters<typeof mockViewer>[0], list: unknown[] = quizzes()) {
  mockViewer(viewer);
  server.use(http.get(`${API}/clubs/${CLUB}/quizzes`, () => HttpResponse.json(list)));
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <QuizList clubId={CLUB} />
    </StranglerProvider>,
  );
}

const card = (title: string) => screen.getByRole('heading', { level: 2, name: title }).closest('li') as HTMLElement;
const links = (el: HTMLElement) => within(el).queryAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')]);

describe('QuizList', () => {
  it('shows a member only what they can take or view, and no organizer actions', async () => {
    setup('member');
    await screen.findByRole('heading', { level: 2, name: 'Draft one' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('QUIZ.title'));
    await waitFor(() => expect(links(card('Active one'))).toEqual([[t('QUIZ.take_btn'), `${base}/${OTHER}`]]));
    expect(links(card('Live one'))).toEqual([
      [t('QUIZ.take_btn'), `${base}/c1`],
      [t('QUIZ.leaderboard'), `${base}/c1/leaderboard`],
    ]);
    expect(links(card('Draft one'))).toEqual([]);
    expect(links(card('Closed one'))).toEqual([]);
    expect(screen.queryByRole('link', { name: t('QUIZ.create_btn') })).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('QUIZ.back_to_club_short') })).toHaveAttribute('href', `/clubs/${CLUB}`);
  });

  it.each([['owner'], ['co-organizer']] as const)('gives a club %s the create link and per-status actions', async (viewer) => {
    setup(viewer);
    await screen.findByRole('link', { name: t('QUIZ.create_btn') });
    expect(screen.getByRole('link', { name: t('QUIZ.create_btn') })).toHaveAttribute('href', `${base}/create`);
    await waitFor(() => expect(links(card('Draft one'))).toEqual([[t('QUIZ.preview'), `${base}/${QUIZ}/preview`], [t('QUIZ.edit'), `${base}/${QUIZ}/edit`]]));
    expect(links(card('Active one'))).toEqual([[t('QUIZ.preview'), `${base}/${OTHER}/preview`], [t('QUIZ.manage_session'), `${base}/${OTHER}/session`]]);
    expect(links(card('Live one'))).toEqual([
      [t('QUIZ.preview'), `${base}/c1/preview`],
      [t('QUIZ.manage_session'), `${base}/c1/session`],
      [t('QUIZ.leaderboard'), `${base}/c1/leaderboard`],
    ]);
    expect(links(card('Closed one'))).toEqual([[t('QUIZ.preview'), `${base}/c2/preview`]]);
    expect(within(card('Draft one')).getByRole('button', { name: t('QUIZ.activate') })).toBeInTheDocument();
    expect(within(card('Active one')).getByRole('button', { name: t('QUIZ.deactivate') })).toBeInTheDocument();
    expect(within(card('Live one')).queryByRole('button')).not.toBeInTheDocument();
    expect(within(card('Closed one')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('treats a global organizer who is not in the club as a plain reader', async () => {
    mockViewer('outsider', 'organizer');
    server.use(http.get(`${API}/clubs/${CLUB}/quizzes`, () => HttpResponse.json(quizzes())));
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <QuizList clubId={CLUB} />
      </StranglerProvider>,
    );
    await screen.findByRole('heading', { level: 2, name: 'Draft one' });
    await waitFor(() => expect(links(card('Active one'))).toEqual([[t('QUIZ.take_btn'), `${base}/${OTHER}`]]));
    expect(screen.queryByRole('link', { name: t('QUIZ.create_btn') })).not.toBeInTheDocument();
  });

  it('never asks for the membership of the club owner', async () => {
    const hits = count(`/clubs/${CLUB}/my-membership`, () => HttpResponse.json({ isMember: true, role: 'organizer', joinRequestStatus: 'none' }));
    setup('owner');
    await screen.findByRole('link', { name: t('QUIZ.create_btn') });
    expect(hits.n).toBe(0);
  });

  it('activates a draft through the API and shows the status the server answers with', async () => {
    const user = userEvent.setup();
    setup('owner');
    const patched: unknown[] = [];
    server.use(
      http.patch(`${API}/quizzes/${QUIZ}/active`, async ({ request }) => {
        patched.push(await request.json());
        const updated = quizJson({ title: 'Draft one', status: 'active', isActive: true });
        // the list is refetched after the toggle, so the server's next answer must agree with it
        server.use(http.get(`${API}/clubs/${CLUB}/quizzes`, () => HttpResponse.json([updated, ...quizzes().slice(1)])));
        return HttpResponse.json(updated);
      }),
    );
    await user.click(await within(await screen.findByRole('heading', { level: 2, name: 'Draft one' }).then((h) => h.closest('li') as HTMLElement)).findByRole('button', { name: t('QUIZ.activate') }));
    await waitFor(() => expect(within(card('Draft one')).getByRole('button', { name: t('QUIZ.deactivate') })).toBeInTheDocument());
    expect(patched).toEqual([{ isActive: true }]);
    expect(within(card('Draft one')).getByText(t('QUIZ.status_active'))).toBeInTheDocument();
    expect(links(card('Draft one')).map(([label]) => label)).toContain(t('QUIZ.manage_session'));
  });

  it('sends one toggle for a double click and disables the button meanwhile', async () => {
    const user = userEvent.setup();
    setup('owner');
    const hold = gate();
    let calls = 0;
    server.use(
      http.patch(`${API}/quizzes/${QUIZ}/active`, async () => {
        calls += 1;
        await hold.open;
        return HttpResponse.json(quizJson({ status: 'active', isActive: true }));
      }),
    );
    const button = await within((await screen.findByRole('heading', { level: 2, name: 'Draft one' })).closest('li') as HTMLElement).findByRole('button', { name: t('QUIZ.activate') });
    await user.dblClick(button);
    await waitFor(() => expect(button).toBeDisabled());
    expect(calls).toBe(1);
    hold.release();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('reports a refused toggle with the backend message and leaves the quiz as it was', async () => {
    const user = userEvent.setup();
    setup('owner');
    server.use(http.patch(`${API}/quizzes/${QUIZ}/active`, () => HttpResponse.json({ detail: 'Add questions first' }, { status: 400 })));
    await user.click(await within((await screen.findByRole('heading', { level: 2, name: 'Draft one' })).closest('li') as HTMLElement).findByRole('button', { name: t('QUIZ.activate') }));
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', 'Add questions first'));
    expect(within(card('Draft one')).getByRole('button', { name: t('QUIZ.activate') })).toBeEnabled();
  });

  it.each([
    ['organizer', 'owner', 'QUIZ.no_quizzes_organizer'],
    ['member', 'member', 'QUIZ.no_quizzes_member'],
  ] as const)('shows the empty state for a %s', async (_label, viewer, hint) => {
    setup(viewer, []);
    expect(await screen.findByRole('heading', { level: 2, name: t('QUIZ.no_quizzes') })).toBeInTheDocument();
    await screen.findByText(t(hint));
  });

  it('marks the loading state busy and offers a retry when the list fails', async () => {
    const user = userEvent.setup();
    mockViewer('member');
    let failing = true;
    server.use(http.get(`${API}/clubs/${CLUB}/quizzes`, () => (failing ? new HttpResponse(null, { status: 404 }) : HttpResponse.json(quizzes()))));
    const { container } = renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <QuizList clubId={CLUB} />
      </StranglerProvider>,
    );
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    await screen.findByRole('alert');
    failing = false;
    await user.click(screen.getByRole('button', { name: t('ERRORS.retry') }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Draft one' })).toBeInTheDocument();
  });

  it('does not show a list from an earlier visit as current', async () => {
    mockViewer('member');
    let title = 'First';
    server.use(http.get(`${API}/clubs/${CLUB}/quizzes`, () => HttpResponse.json([quizJson({ title })])));
    const first = renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <QuizList clubId={CLUB} />
      </StranglerProvider>,
    );
    await screen.findByRole('heading', { level: 2, name: 'First' });
    first.unmount();
    title = 'Second';
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <QuizList clubId={CLUB} />
      </StranglerProvider>,
    );
    expect(screen.queryByRole('heading', { level: 2, name: 'First' })).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Second' })).toBeInTheDocument();
  });
});
