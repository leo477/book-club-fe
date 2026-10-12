import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { QuizEdit } from './quiz-edit';
import { CLUB, QUIZ, questionJson, quizJson } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));

const questions = () => [
  questionJson({ id: 'q1', question: 'Who rules Arrakis?' }),
  questionJson({ id: 'q2', question: 'What is spice?', options: ['Salt', 'Melange', 'Water', 'Sand'], correctIndex: 1 }),
];

function setup(quiz: Record<string, unknown> = quizJson(), list: unknown[] = questions()) {
  server.use(
    http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json(quiz)),
    http.get(`${API}/quizzes/${QUIZ}/questions`, () => HttpResponse.json(list)),
  );
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <QuizEdit clubId={CLUB} quizId={QUIZ} />
    </StranglerProvider>,
  );
}

const title = () => screen.findByTestId('quiz-title-input');

describe('QuizEdit', () => {
  it('prefills the details of a draft and lists its questions as saved', async () => {
    const user = userEvent.setup();
    setup();
    expect(await title()).toHaveValue('Dune quiz');
    expect(screen.getByLabelText(t('QUIZ.create_desc_label'))).toHaveValue('About Arrakis');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('QUIZ.edit_title'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('next-button'));
    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByText(t('QUIZ.question_saved'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(`^${t('QUIZ.edit_save')}`) })).toBeEnabled();
  });

  it('saves the details, removals, changes and additions in that order, then returns to the list', async () => {
    const user = userEvent.setup();
    const calls: [string, string, unknown][] = [];
    server.use(
      http.patch(`${API}/quizzes/${QUIZ}`, async ({ request }) => {
        calls.push(['patch', 'quiz', await request.json()]);
        return HttpResponse.json(quizJson());
      }),
      http.delete(`${API}/quizzes/${QUIZ}/questions/q1`, () => {
        calls.push(['delete', 'q1', null]);
        return new HttpResponse(null, { status: 204 });
      }),
      http.patch(`${API}/quizzes/${QUIZ}/questions/q2`, async ({ request }) => {
        calls.push(['patch', 'q2', await request.json()]);
        return HttpResponse.json(questionJson({ id: 'q2' }));
      }),
      http.post(`${API}/quizzes/${QUIZ}/questions`, async ({ request }) => {
        calls.push(['post', 'new', await request.json()]);
        return HttpResponse.json(questionJson({ id: 'q3' }), { status: 201 });
      }),
    );
    setup();
    const field = await title();
    await user.clear(field);
    await user.click(field);
    await user.paste('  Renamed  ');
    await user.click(screen.getByTestId('next-button'));
    await user.click(await screen.findByRole('button', { name: 'Видалити питання 1' }));
    await user.click(screen.getByLabelText(/^Запитання/));
    await user.paste('Added later?');
    for (const [i, label] of ['A', 'B', 'C', 'D'].entries()) {
      await user.click(screen.getByLabelText(`Варіант ${label}`));
      await user.paste(`o${i}`);
    }
    await user.click(screen.getByRole('button', { name: t('QUIZ.create_add_question') }));
    await screen.findByText('Added later?');
    await user.click(screen.getByRole('button', { name: new RegExp(`^${t('QUIZ.edit_save')}`) }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${CLUB}/quizzes`));
    expect(calls).toEqual([
      ['patch', 'quiz', { title: 'Renamed', description: 'About Arrakis' }],
      ['delete', 'q1', null],
      ['patch', 'q2', { question: 'What is spice?', options: ['Salt', 'Melange', 'Water', 'Sand'], correctIndex: 1 }],
      ['post', 'new', { question: 'Added later?', options: ['o0', 'o1', 'o2', 'o3'], correctIndex: 0 }],
    ]);
  });

  it('shows the failure and lets the save be retried', async () => {
    const user = userEvent.setup();
    let fail = true;
    server.use(http.patch(`${API}/quizzes/${QUIZ}`, () => (fail ? HttpResponse.json({ detail: 'Nope' }, { status: 400 }) : HttpResponse.json(quizJson()))));
    server.use(http.patch(`${API}/quizzes/${QUIZ}/questions/:id`, () => HttpResponse.json(questionJson())));
    setup();
    await title();
    await user.click(screen.getByTestId('next-button'));
    const save = await screen.findByRole('button', { name: new RegExp(`^${t('QUIZ.edit_save')}`) });
    await user.click(save);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('QUIZ.save_error'));
    fail = false;
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);
    await waitFor(() => expect(nav.push).toHaveBeenCalledTimes(1));
  });

  it.each([['live'], ['active'], ['closed']])('is read-only for a %s quiz', async (status) => {
    const user = userEvent.setup();
    setup(quizJson({ status, isActive: status !== 'closed' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t('QUIZ.edit_active_warning'));
    expect(await title()).toBeDisabled();
    expect(screen.getByTestId('next-button')).toBeDisabled();
    await user.click(screen.getByTestId('next-button'));
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('says not found for a quiz of another club and for a 404, and retries a server error', async () => {
    const user = userEvent.setup();
    const first = setup(quizJson({ clubId: 'a-different-club' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t('QUIZ.error_not_found'));
    expect(screen.queryByTestId('quiz-title-input')).not.toBeInTheDocument();
    first.unmount();

    server.use(http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })));
    const second = renderWithProviders(<QuizEdit clubId={CLUB} quizId={QUIZ} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('QUIZ.error_not_found'));
    second.unmount();

    let failing = true;
    server.use(
      http.get(`${API}/quizzes/${QUIZ}`, () => (failing ? new HttpResponse(null, { status: 500 }) : HttpResponse.json(quizJson()))),
      http.get(`${API}/quizzes/${QUIZ}/questions`, () => HttpResponse.json(questions())),
    );
    renderWithProviders(<QuizEdit clubId={CLUB} quizId={QUIZ} />);
    await screen.findByRole('button', { name: t('ERRORS.retry') });
    failing = false;
    await user.click(screen.getByRole('button', { name: t('ERRORS.retry') }));
    expect(await title()).toHaveValue('Dune quiz');
  });
});
