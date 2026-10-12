import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gate, t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { QuizCreate } from './quiz-create';
import { CLUB, QUIZ, questionJson, quizJson } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));

type User = ReturnType<typeof userEvent.setup>;

const setup = () =>
  renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <QuizCreate clubId={CLUB} />
    </StranglerProvider>,
  );

async function fill(user: User, field: HTMLElement, text: string) {
  await user.click(field);
  await user.paste(text);
}

const OPTION_LABEL = ['A', 'B', 'C', 'D'];
const option = (i: number) => screen.getByLabelText(`Варіант ${OPTION_LABEL[i]}`);

async function toStepTwo(user: User, title = '  Dune quiz  ', description = '') {
  await fill(user, screen.getByTestId('quiz-title-input'), title);
  if (description) await fill(user, screen.getByLabelText(t('QUIZ.create_desc_label')), description);
  await user.click(screen.getByTestId('next-button'));
  await screen.findByRole('heading', { level: 2, name: t('QUIZ.create_first_question') });
}

async function addQuestion(user: User, question: string, answers: string[], correct = 1) {
  await fill(user, screen.getByLabelText(/^Запитання/), question);
  for (const [i, text] of answers.entries()) await fill(user, option(i), text);
  await user.click(screen.getByRole('radio', { name: `Правильна відповідь ${OPTION_LABEL[correct]}` }));
  await user.click(screen.getByRole('button', { name: t('QUIZ.create_add_question') }));
}

const ANSWERS = ['Harkonnen', 'Atreides', 'Corrino', 'Fremen'];

function mockApi(overrides: { addQuestion?: () => Response | Promise<Response> } = {}) {
  const calls: [string, unknown][] = [];
  server.use(
    http.post(`${API}/clubs/${CLUB}/quizzes`, async ({ request }) => {
      calls.push(['create', await request.json()]);
      return HttpResponse.json(quizJson(), { status: 201 });
    }),
    http.post(`${API}/quizzes/${QUIZ}/questions`, async ({ request }) => {
      calls.push(['question', await request.json()]);
      return overrides.addQuestion ? overrides.addQuestion() : HttpResponse.json(questionJson(), { status: 201 });
    }),
    http.patch(`${API}/quizzes/${QUIZ}/active`, async ({ request }) => {
      calls.push(['active', await request.json()]);
      return HttpResponse.json(quizJson({ isActive: true, status: 'active' }));
    }),
  );
  return calls;
}

describe('QuizCreate', () => {
  it('starts on the details step with a way back and one level-1 heading', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('QUIZ.create_heading'));
    expect(screen.getByRole('link', { name: t('QUIZ.create_cancel') })).toHaveAttribute('href', `/clubs/${CLUB}/quizzes`);
    expect(screen.getByText(/Крок 1 з 2/)).toBeInTheDocument();
  });

  it('keeps the viewer on step one with the required, too-short and too-long messages', async () => {
    const user = userEvent.setup();
    setup();
    const title = screen.getByTestId('quiz-title-input');
    await user.click(screen.getByTestId('next-button'));
    expect(await screen.findByText(t('QUIZ.create_title_required'))).toBeInTheDocument();
    expect(title).toHaveAttribute('aria-invalid', 'true');
    await fill(user, title, '  a ');
    await user.click(screen.getByTestId('next-button'));
    expect(await screen.findByText(t('QUIZ.create_title_min'))).toBeInTheDocument();
    await user.clear(title);
    await fill(user, title, 'x'.repeat(101));
    await user.click(screen.getByTestId('next-button'));
    expect(await screen.findByText(t('QUIZ.create_title_max'))).toBeInTheDocument();
    await user.clear(title);
    await fill(user, title, 'Fine');
    await fill(user, screen.getByLabelText(t('QUIZ.create_desc_label')), 'd'.repeat(501));
    await user.click(screen.getByTestId('next-button'));
    expect(await screen.findByText(t('QUIZ.create_desc_max'))).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: t('QUIZ.create_first_question') })).not.toBeInTheDocument();
  });

  it('validates a question, adds it to the list and lets it be removed', async () => {
    const user = userEvent.setup();
    setup();
    await toStepTwo(user);
    await user.click(screen.getByRole('button', { name: t('QUIZ.create_add_question') }));
    expect(await screen.findByText(t('QUIZ.create_question_required'))).toBeInTheDocument();
    expect(option(0)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByText(t('FORM_ERRORS.required'))).toHaveLength(4);
    expect(screen.getByRole('button', { name: t('QUIZ.create_save_draft') })).toBeDisabled();

    await fill(user, screen.getByLabelText(/^Запитання/), 'abc');
    await user.click(screen.getByRole('button', { name: t('QUIZ.create_add_question') }));
    expect(await screen.findByText(t('QUIZ.create_question_min'))).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^Запитання/));
    await addQuestion(user, '  Who rules Arrakis?  ', ANSWERS);
    const item = await screen.findByRole('listitem');
    expect(item).toHaveTextContent('Who rules Arrakis?');
    expect(item).toHaveTextContent('Atreides');
    expect(screen.getByRole('heading', { level: 2, name: t('QUIZ.create_another_question') })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Запитання/)).toHaveValue('');
    expect(screen.getByRole('radio', { name: 'Правильна відповідь A' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Видалити питання 1' }));
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('QUIZ.create_save_draft') })).toBeDisabled();
  });

  it('keeps the entered details when going back and forth between the steps', async () => {
    const user = userEvent.setup();
    setup();
    await toStepTwo(user, 'Dune quiz', 'About sand');
    await user.click(screen.getByRole('button', { name: t('QUIZ.create_back') }));
    expect(screen.getByTestId('quiz-title-input')).toHaveValue('Dune quiz');
    expect(screen.getByLabelText(t('QUIZ.create_desc_label'))).toHaveValue('About sand');
  });

  it('creates the quiz, adds every question in order, activates it and returns to the list', async () => {
    const user = userEvent.setup();
    const calls = mockApi();
    setup();
    await toStepTwo(user, '  Dune quiz  ', 'About sand');
    await addQuestion(user, 'Who rules Arrakis?', ANSWERS, 1);
    await addQuestion(user, 'What is spice?', ['Salt', 'Melange', 'Water', 'Sand'], 3);
    expect(screen.getByRole('button', { name: new RegExp(`^${t('QUIZ.create_save_draft')}`) })).toHaveTextContent('(2 запитання)');
    await user.click(screen.getByRole('button', { name: new RegExp(`^${t('QUIZ.create_save_draft')}`) }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${CLUB}/quizzes`));
    expect(calls).toEqual([
      ['create', { title: 'Dune quiz', description: 'About sand' }],
      ['question', { question: 'Who rules Arrakis?', options: ANSWERS, correctIndex: 1 }],
      ['question', { question: 'What is spice?', options: ['Salt', 'Melange', 'Water', 'Sand'], correctIndex: 3 }],
      ['active', { isActive: true }],
    ]);
  });

  it('sends a blank description as null', async () => {
    const user = userEvent.setup();
    const calls = mockApi();
    setup();
    await toStepTwo(user);
    await addQuestion(user, 'Who rules Arrakis?', ANSWERS);
    await user.click(screen.getByRole('button', { name: new RegExp(`^${t('QUIZ.create_save_draft')}`) }));
    await waitFor(() => expect(nav.push).toHaveBeenCalled());
    expect(calls[0]).toEqual(['create', { title: 'Dune quiz', description: null }]);
  });

  it('publishes once for a double click', async () => {
    const user = userEvent.setup();
    const calls = mockApi();
    const hold = gate();
    server.use(
      http.post(`${API}/clubs/${CLUB}/quizzes`, async () => {
        calls.push(['create', null]);
        await hold.open;
        return HttpResponse.json(quizJson(), { status: 201 });
      }),
    );
    setup();
    await toStepTwo(user);
    await addQuestion(user, 'Who rules Arrakis?', ANSWERS);
    await user.dblClick(screen.getByRole('button', { name: new RegExp(`^${t('QUIZ.create_save_draft')}`) }));
    hold.release();
    await waitFor(() => expect(nav.push).toHaveBeenCalledTimes(1));
    expect(calls.filter(([name]) => name === 'create')).toHaveLength(1);
  });

  it('resumes on the quiz it already created instead of creating a second one', async () => {
    const user = userEvent.setup();
    let fail = true;
    const calls = mockApi({ addQuestion: () => (fail ? HttpResponse.json({ detail: 'Nope' }, { status: 400 }) : HttpResponse.json(questionJson(), { status: 201 })) });
    setup();
    await toStepTwo(user);
    await addQuestion(user, 'Who rules Arrakis?', ANSWERS);
    const publish = () => screen.getByRole('button', { name: new RegExp(`^${t('QUIZ.create_save_draft')}`) });
    await user.click(publish());
    expect(await screen.findByRole('alert')).toHaveTextContent(t('QUIZ.save_error'));
    expect(nav.push).not.toHaveBeenCalled();
    fail = false;
    await waitFor(() => expect(publish()).toBeEnabled());
    await user.click(publish());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${CLUB}/quizzes`));
    expect(calls.map(([name]) => name)).toEqual(['create', 'question', 'question', 'active']);
  });
});
