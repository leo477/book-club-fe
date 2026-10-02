import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nest } from '@/i18n/locale';
import { resetAnalyticsState } from '@/lib/analytics';
import { messages } from '@/test/harness';
import GlobalError from './global-error';
import RouteError from './error';

const fetchMock = vi.fn();

const boom = Object.assign(new Error('secret db password in stack'), { digest: 'abc' });

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);
  resetAnalyticsState();
});

describe('app/error.tsx', () => {
  it.each(['uk', 'en'] as const)('shows the localized message and retry without leaking the error (%s)', async (locale) => {
    const reset = vi.fn();
    render(
      <NextIntlClientProvider locale={locale} messages={nest(messages[locale])}>
        <RouteError error={boom} reset={reset} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(messages[locale]['ERRORS.unexpected']!);
    expect(document.body.textContent).not.toContain('secret');
    await userEvent.click(screen.getByRole('button', { name: messages[locale]['ERRORS.retry']! }));
    expect(reset).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toMatchObject({ app: 'next', name: 'js_error', kind: 'boundary' });
  });
});

describe('app/global-error.tsx', () => {
  it('renders the localized copy from the cookie locale with a working retry, no leak', async () => {
    document.cookie = 'lang=en; path=/';
    const reset = vi.fn();
    // html/body inside a container: jsdom drops them, the content is what matters
    render(<GlobalError error={boom} reset={reset} />, { container: document.documentElement });
    expect(await screen.findByText(messages.en['ERRORS.unexpected']!)).toBeInTheDocument();
    expect(document.documentElement.textContent).not.toContain('secret');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
    document.cookie = 'lang=; path=/; max-age=0';
  });
});
