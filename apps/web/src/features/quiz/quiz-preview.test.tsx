import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { QuizPreview } from './quiz-preview';
import { CLUB, QUIZ, questionJson, quizJson } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));

const two = () => [questionJson({ id: 'q1', question: 'First?' }), questionJson({ id: 'q2', question: 'Second?', correctIndex: 2 })];

function setup(quiz: Record<string, unknown> = quizJson(), list: unknown[] = two()) {
  server.use(
    http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json(quiz)),
    http.get(`${API}/quizzes/${QUIZ}/questions`, () => HttpResponse.json(list)),
  );
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <QuizPreview clubId={CLUB} quizId={QUIZ} />
    </StranglerProvider>,
  );
}

describe('QuizPreview', () => {
  it('walks through the questions and marks the correct answer of each', async () => {
    const user = userEvent.setup();
    setup();
    expect(await screen.findByRole('heading', { level: 2, name: 'First?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('QUIZ.preview_heading'));
    expect(screen.getByText('Dune quiz')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('button', { name: t('QUIZ.prev') })).toBeDisabled();
    expect(screen.getAllByText(t('QUIZ.preview_correct_answer'))).toHaveLength(1);
    expect(screen.getByText('Atreides').closest('li')).toHaveTextContent(t('QUIZ.preview_correct_answer'));
    expect(screen.queryByRole('button', { name: t('QUIZ.preview_activate') })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: t('QUIZ.next') }));
    expect(screen.getByRole('heading', { level: 2, name: 'Second?' })).toBeInTheDocument();
    expect(screen.getByText('Corrino').closest('li')).toHaveTextContent(t('QUIZ.preview_correct_answer'));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.queryByRole('button', { name: t('QUIZ.next') })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: t('QUIZ.prev') }));
    expect(screen.getByRole('heading', { level: 2, name: 'First?' })).toBeInTheDocument();
  });

  it('activates a draft from the last question and returns to the list', async () => {
    const user = userEvent.setup();
    const patched: unknown[] = [];
    server.use(
      http.patch(`${API}/quizzes/${QUIZ}/active`, async ({ request }) => {
        patched.push(await request.json());
        return HttpResponse.json(quizJson({ isActive: true, status: 'active' }));
      }),
    );
    setup();
    await screen.findByRole('heading', { level: 2, name: 'First?' });
    await user.click(screen.getByRole('button', { name: t('QUIZ.next') }));
    await user.click(screen.getByRole('button', { name: t('QUIZ.preview_activate') }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${CLUB}/quizzes`));
    expect(patched).toEqual([{ isActive: true }]);
  });

  it('keeps the viewer on the page and says why when activation is refused', async () => {
    const user = userEvent.setup();
    server.use(http.patch(`${API}/quizzes/${QUIZ}/active`, () => HttpResponse.json({ detail: 'Not allowed' }, { status: 400 })));
    setup(quizJson(), [questionJson()]);
    await user.click(await screen.findByRole('button', { name: t('QUIZ.preview_activate') }));
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', 'Not allowed'));
    expect(nav.push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: t('QUIZ.preview_activate') })).toBeEnabled();
  });

  it('offers no activation for a live quiz and says it is live', async () => {
    setup(quizJson({ status: 'live', isActive: true }), [questionJson()]);
    expect(await screen.findByText(t('QUIZ.preview_live_banner'))).toHaveAttribute('role', 'status');
    expect(screen.queryByRole('button', { name: t('QUIZ.preview_activate') })).not.toBeInTheDocument();
  });

  it('points to the editor when the quiz has no questions', async () => {
    setup(quizJson(), []);
    expect(await screen.findByText(t('QUIZ.preview_no_questions'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('QUIZ.preview_no_questions_link') })).toHaveAttribute('href', `/clubs/${CLUB}/quizzes/${QUIZ}/edit`);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
