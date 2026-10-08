import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { StranglerProvider } from '@/strangler/context';
import { CreateSubmission } from './create-submission';

const nav = vi.hoisted(() => ({ push: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => {
  nav.push.mockReset();
  nav.hard.mockReset();
  nav.toast.mockReset();
});

const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");

const title = () => screen.getByTestId('submission-title-input');
const body = () => screen.getByTestId('submission-body-input');
const type = () => screen.getByTestId('submission-type-select');
const submit = () => screen.getByTestId('submission-submit');

function mockCreate(status = 201) {
  const calls: unknown[] = [];
  server.use(
    http.post(`${API}/support`, async ({ request }) => {
      calls.push(await request.json());
      if (status !== 201) return HttpResponse.json({ detail: 'Nope' }, { status });
      return HttpResponse.json(
        { id: 's9', authorId: 'u1', type: 'comment', title: 'T', body: 'B', status: 'pending', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', likeCount: 0, likedByMe: false },
        { status },
      );
    }),
  );
  return calls;
}

const renderForm = () =>
  renderWithProviders(
    <StranglerProvider value={['/support']}>
      <CreateSubmission />
    </StranglerProvider>,
  );

describe('CreateSubmission', () => {
  it('renders the form with Suggestion preselected and the three types', () => {
    renderForm();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('SUPPORT.create_title'));
    expect(type()).toHaveValue('suggestion');
    expect(Array.from((type() as HTMLSelectElement).options).map((o) => o.value)).toEqual(['complaint', 'suggestion', 'comment']);
    expect(screen.getByLabelText(new RegExp(t('SUPPORT.title_label')))).toBe(title());
    expect(screen.getByLabelText(new RegExp(t('SUPPORT.body_label')))).toBe(body());
    expect(submit()).toBeEnabled();
    expect(title()).not.toHaveAttribute('aria-invalid');
  });

  it('blocks an empty submit, shows both required errors and sends nothing', async () => {
    const calls = mockCreate();
    const user = userEvent.setup();
    renderForm();
    await user.click(submit());
    expect(await screen.findByText(t('SUPPORT.title_required'))).toBeInTheDocument();
    expect(screen.getByText(t('SUPPORT.body_required'))).toBeInTheDocument();
    expect(title()).toHaveAttribute('aria-invalid', 'true');
    expect(body()).toHaveAttribute('aria-invalid', 'true');
    expect(title().getAttribute('aria-describedby')).toBe(screen.getByText(t('SUPPORT.title_required')).id);
    expect(calls).toEqual([]);
    expect(nav.push).not.toHaveBeenCalled();
    expect(submit()).toBeEnabled();
  });

  it.each([
    ['title', 'ab', 'SUPPORT.title_min'],
    ['title', 'x'.repeat(121), 'SUPPORT.title_max'],
    ['body', 'too short', 'SUPPORT.body_min'],
    ['body', 'x'.repeat(2001), 'SUPPORT.body_max'],
  ] as const)('reports the %s limit (%s) with %s on blur', async (field, value, key) => {
    const user = userEvent.setup();
    renderForm();
    const input = field === 'title' ? title() : body();
    await user.click(input);
    await user.paste(value);
    await user.tab();
    expect(await screen.findByText(t(key))).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the error once the value becomes valid', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(title(), 'ab');
    await user.tab();
    expect(await screen.findByText(t('SUPPORT.title_min'))).toBeInTheDocument();
    await user.type(title(), 'c');
    await waitFor(() => expect(title()).not.toHaveAttribute('aria-invalid'));
    expect(screen.queryByText(t('SUPPORT.title_min'))).not.toBeInTheDocument();
  });

  it('submits the trimmed values, toasts, and goes back to the board', async () => {
    const calls = mockCreate();
    const user = userEvent.setup();
    renderForm();
    await user.selectOptions(type(), 'comment');
    await user.type(title(), '  Great app  ');
    await user.type(body(), '  Really enjoying the club features.  ');
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/support'));
    expect(calls).toEqual([{ type: 'comment', title: 'Great app', body: 'Really enjoying the club features.' }]);
    expect(nav.toast).toHaveBeenCalledWith('success', t('SUPPORT.submit_success'));
  });

  it('shows the submitting state, disables the button, and keeps it disabled while navigating', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.post(`${API}/support`, async () => {
        await gate;
        return HttpResponse.json({ id: 's9', type: 'suggestion', title: 'T', body: 'B', status: 'pending', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', likeCount: 0, likedByMe: false }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(title(), 'Valid title');
    await user.type(body(), 'A body that is long enough');
    await user.click(submit());
    await waitFor(() => expect(submit()).toBeDisabled());
    expect(submit()).toHaveTextContent(t('SUPPORT.submitting'));
    expect(screen.getByRole('status')).toBeInTheDocument();
    release();
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/support'));
    expect(submit()).toBeDisabled();
  });

  it('shows the backend message in an alert on failure and lets the user retry', async () => {
    mockCreate(422);
    const user = userEvent.setup();
    renderForm();
    await user.type(title(), 'Valid title');
    await user.type(body(), 'A body that is long enough');
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent('Nope');
    expect(nav.push).not.toHaveBeenCalled();
    expect(nav.toast).not.toHaveBeenCalled();
    expect(submit()).toBeEnabled();
    expect(submit()).toHaveTextContent(t('SUPPORT.submit'));
    expect(title()).toHaveValue('Valid title');
  });

  it('cancel goes back to the board without calling the API', async () => {
    const calls = mockCreate();
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: t('SUPPORT.cancel') }));
    expect(nav.push).toHaveBeenCalledWith('/support');
    expect(calls).toEqual([]);
  });

  it('leaves the router for a legacy-owned board', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateSubmission />);
    await user.click(screen.getByRole('button', { name: t('SUPPORT.cancel') }));
    expect(nav.hard).toHaveBeenCalledWith('/support');
    expect(nav.push).not.toHaveBeenCalled();
  });

  it('toasts before a hard navigation to a legacy-owned board (the toast cannot outlive the page load)', async () => {
    mockCreate();
    const user = userEvent.setup();
    renderWithProviders(<CreateSubmission />);
    await user.type(title(), 'Valid title');
    await user.type(body(), 'A body that is long enough');
    await user.click(submit());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/support'));
    expect(nav.toast).toHaveBeenCalledWith('success', t('SUPPORT.submit_success'));
    expect(nav.toast.mock.invocationCallOrder[0]).toBeLessThan(nav.hard.mock.invocationCallOrder[0]!);
    expect(nav.push).not.toHaveBeenCalled();
  });

  it('renders in English', () => {
    renderWithProviders(<CreateSubmission />, 'en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(messages.en['SUPPORT.create_title']!);
  });
});
