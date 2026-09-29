import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { club as clubSchema } from '@book-club/contracts';
import uk from '@book-club/i18n/uk.icu.json';
import en from '@book-club/i18n/en.icu.json';
import { nest } from '@/i18n/locale';
import { resetSessionHint } from '@/lib/session-hint';

export const ORIGIN = 'http://localhost:3000';
export const API = `${ORIGIN}/api/v1`;
export const server = setupServer();

export const messages = { uk: uk as Record<string, string>, en: en as Record<string, string> };

/** Registers the MSW server and resolves the client's relative `/api/v1` URLs against the jsdom origin. */
export function setupApiServer() {
  beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
  beforeEach(() => {
    resetSessionHint();
    const mswFetch = globalThis.fetch;
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      mswFetch(typeof input === 'string' ? new URL(input, ORIGIN) : input, init),
    );
  });
  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllGlobals();
  });
  afterAll(() => server.close());
}

export function renderWithProviders(ui: ReactElement, locale: 'uk' | 'en' = 'uk') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } });
  return {
    queryClient,
    ...render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={nest(messages[locale])}>
        {ui}
      </NextIntlClientProvider>
    </QueryClientProvider>,
    ),
  };
}

export const userJson = (overrides: Record<string, unknown> = {}) => ({
  id: 'u1',
  email: 'u@example.com',
  displayName: 'Ada Lovelace',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  socialsPublic: false,
  socials: {},
  ...overrides,
});

export const clubJson = (overrides: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'Alpha Readers',
  description: 'Reads classics',
  coverUrl: null,
  organizerId: 'o1',
  isPublic: true,
  memberCount: 3,
  memberPreviews: [],
  createdAt: '2024-02-03T10:00:00Z',
  city: 'Kyiv',
  ...overrides,
});

export const parsedClub = (overrides: Record<string, unknown> = {}) => clubSchema.parse(clubJson(overrides));
