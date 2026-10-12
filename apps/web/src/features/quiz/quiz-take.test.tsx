import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gate, t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { QuizTake } from './quiz-take';
import { CLUB, QUIZ, questionJson, quizJson } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));

// a member never receives the answers
const hidden = (overrides: Record<string, unknown> = {}) => questionJson({ ...overrides, correctIndex: null });
const two = (reveal = false) => {
  const make = reveal ? questionJson : hidden;
  return [make({ id: 'q1', question: 'First?', correctIndex: 1 }), make({ id: 'q2', question: 'Second?', options: ['Salt', 'Melange', 'Water', 'Sand'], correctIndex: 2 })];
};

function setup(list: unknown[] = two(), quiz: Record<string, unknown> = quizJson({ status: 'active', isActive: true })) {
  server.use(
    http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json(quiz)),
    http.get(`${API}/quizzes/${QUIZ}/questions`, () => HttpResponse.json(list)),
  );
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <QuizTake clubId={CLUB} quizId={QUIZ} />
    </StranglerProvider>,
  );
}

const next = () => screen.getByRole('button', { name: t('QUIZ.next') });
const submit = () => screen.getByRole('button', { name: t('QUIZ.submit_quiz') });

describe('QuizTake', () => {
  it('shows one question at a time with a labelled group of options and progress', async () => {
    const user = userEvent.setup();
    setup();
    const group = await screen.findByRole('group', { name: 'First?' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dune quiz');
    expect(within(group).getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('link', { name: t('QUIZ.back_to_quizzes') })).toHaveAttribute('href', `/clubs/${CLUB}/quizzes`);
    expect(next()).toBeDisabled();
    expect(screen.getByRole('button', { name: t('QUIZ.prev') })).toBeDisabled();
    await user.click(within(group).getByRole('radio', { name: /Atreides/ }));
    expect(next()).toBeEnabled();
    await user.click(next());
    expect(await screen.findByRole('group', { name: 'Second?' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('QUIZ.next') })).not.toBeInTheDocument();
    expect(submit()).toBeDisabled();
  });

  it('remembers an answer when going back', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(await screen.findByRole('radio', { name: /Corrino/ }));
    await user.click(next());
    await user.click(screen.getByRole('button', { name: t('QUIZ.prev') }));
    expect(screen.getByRole('radio', { name: /Corrino/ })).toBeChecked();
  });

  it('submits every answer once and shows the score with a review that never claims a right or wrong answer it cannot know', async () => {
    const user = userEvent.setup();
    const hold = gate();
    const bodies: unknown[] = [];
    server.use(
      http.post(`${API}/quizzes/${QUIZ}/attempts`, async ({ request }) => {
        bodies.push(await request.json());
        await hold.open;
        return HttpResponse.json({ id: 'a1', quizId: QUIZ, userId: 'u1', score: 1, total: 2, answers: [1, 3] }, { status: 201 });
      }),
    );
    setup();
    await user.click(await screen.findByRole('radio', { name: /Atreides/ }));
    await user.click(next());
    await user.click(await screen.findByRole('radio', { name: /Sand/ }));
    await user.dblClick(submit());
    await waitFor(() => expect(screen.getByRole('button', { name: t('QUIZ.submitting_quiz') })).toBeDisabled());
    expect(screen.getByRole('radio', { name: /Sand/ })).toBeDisabled();
    hold.release();
    expect(await screen.findByRole('status')).toHaveTextContent('1/2');
    expect(bodies).toEqual([{ answers: [1, 3] }]);
    expect(screen.getByRole('status')).toHaveTextContent('50%');
    expect(screen.getByRole('heading', { level: 2, name: t('QUIZ.result_review_title') })).toBeInTheDocument();
    expect(screen.getAllByText(t('QUIZ.result_your_answer'))).toHaveLength(2);
    expect(screen.queryByText(t('QUIZ.result_correct'))).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('QUIZ.back_to_quizzes') })).toHaveAttribute('href', `/clubs/${CLUB}/quizzes`);
  });

  it('marks right and wrong answers in the review when the questions carry them', async () => {
    const user = userEvent.setup();
    server.use(http.post(`${API}/quizzes/${QUIZ}/attempts`, () => HttpResponse.json({ id: 'a1', quizId: QUIZ, userId: 'u1', score: 1, total: 2, answers: [1, 3] }, { status: 201 })));
    setup(two(true));
    await user.click(await screen.findByRole('radio', { name: /Atreides/ }));
    await user.click(next());
    await user.click(await screen.findByRole('radio', { name: /Sand/ }));
    await user.click(submit());
    await screen.findByRole('status');
    const items = screen.getAllByRole('listitem').filter((li) => li.querySelector('ul'));
    expect(within(items[0]!).getByText(`${t('QUIZ.result_correct')}:`)).toBeInTheDocument();
    expect(within(items[1]!).getByText(`${t('QUIZ.result_incorrect')}:`)).toBeInTheDocument();
    expect(within(items[1]!).getByText('Water').closest('li')).toHaveTextContent(t('QUIZ.result_correct'));
    expect(within(items[1]!).getByText('Sand').closest('li')).toHaveTextContent(t('QUIZ.result_your_answer'));
  });

  it.each([
    [10, 10, 'QUIZ.result_perfect'],
    [8, 10, 'QUIZ.result_great'],
    [6, 10, 'QUIZ.result_good'],
    [4, 10, 'QUIZ.result_keep_reading'],
    [1, 10, 'QUIZ.result_try_again'],
  ])('encourages a score of %i/%i', async (score, total, key) => {
    const user = userEvent.setup();
    server.use(http.post(`${API}/quizzes/${QUIZ}/attempts`, () => HttpResponse.json({ id: 'a1', quizId: QUIZ, userId: 'u1', score, total, answers: [0] }, { status: 201 })));
    setup([hidden()]);
    await user.click(await screen.findByRole('radio', { name: /Harkonnen/ }));
    await user.click(submit());
    expect(await screen.findByRole('status')).toHaveTextContent(t(key));
  });

  it('keeps the answers and says why when the submission is refused, so it can be tried again', async () => {
    const user = userEvent.setup();
    let refuse = true;
    server.use(
      http.post(`${API}/quizzes/${QUIZ}/attempts`, () =>
        refuse ? HttpResponse.json({ detail: 'Already attempted' }, { status: 400 }) : HttpResponse.json({ id: 'a1', quizId: QUIZ, userId: 'u1', score: 0, total: 1, answers: [0] }, { status: 201 }),
      ),
    );
    setup([hidden()]);
    await user.click(await screen.findByRole('radio', { name: /Harkonnen/ }));
    await user.click(submit());
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', 'Already attempted'));
    expect(screen.getByRole('radio', { name: /Harkonnen/ })).toBeChecked();
    refuse = false;
    await user.click(submit());
    expect(await screen.findByRole('status')).toHaveTextContent('0/1');
  });

  it('keeps the answers when a background refetch fails, and starts over when the question set changes', async () => {
    const user = userEvent.setup();
    let mode: 'ok' | 'fail' | 'three' = 'ok';
    server.use(
      http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json(quizJson({ status: 'active', isActive: true }))),
      http.get(`${API}/quizzes/${QUIZ}/questions`, () => {
        if (mode === 'fail') return new HttpResponse(null, { status: 500 });
        return HttpResponse.json(mode === 'three' ? [...two(), hidden({ id: 'q3', question: 'Third?' })] : two());
      }),
    );
    const { queryClient } = renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <QuizTake clubId={CLUB} quizId={QUIZ} />
      </StranglerProvider>,
    );
    await user.click(await screen.findByRole('radio', { name: /Harkonnen/ }));
    mode = 'fail';
    await queryClient.refetchQueries({ queryKey: ['quiz', QUIZ, 'questions'] });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Harkonnen/ })).toBeChecked();
    mode = 'three';
    await queryClient.refetchQueries({ queryKey: ['quiz', QUIZ, 'questions'] });
    expect(await screen.findByText(/1 з 3/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Harkonnen/ })).not.toBeChecked();
  });

  it('says so when the quiz has no questions, and when it belongs to another club', async () => {
    const first = setup([]);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('QUIZ.error_no_questions'));
    expect(screen.getByRole('link', { name: new RegExp(t('QUIZ.error_return')) })).toHaveAttribute('href', `/clubs/${CLUB}/quizzes`);
    first.unmount();
    setup(two(), quizJson({ clubId: 'elsewhere' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t('QUIZ.error_not_found'));
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
