import { ERROR_KEYS, translationKeyForStatus } from '@book-club/api-client';
import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { nest } from '@/i18n/locale';
import { api, setErrorTranslator } from '@/lib/api';
import { API, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { ErrorToasts } from './error-toasts';

const toasts = vi.hoisted(() => [] as [string, string][]);
vi.mock('@/lib/toast', () => ({ showToast: (kind: string, message: string) => toasts.push([kind, message]) }));

setupApiServer();

const keys = [...new Set([...Object.values(ERROR_KEYS), translationKeyForStatus(0), translationKeyForStatus(400), translationKeyForStatus(503)])];

describe('ErrorToasts', () => {
  it.each(['uk', 'en'] as const)('has a %s message for every translation key the api client can report', (locale) => {
    const errors = nest(messages[locale])['ERRORS'] as Record<string, string>;
    for (const key of keys) {
      expect(key.startsWith('ERRORS.')).toBe(true);
      expect(errors[key.slice('ERRORS.'.length)], key).toEqual(expect.any(String));
    }
  });

  it('toasts the localized message, not the raw key, for a 5xx', async () => {
    server.use(http.get(`${API}/clubs`, () => HttpResponse.json({}, { status: 500 })));
    renderWithProviders(<ErrorToasts />);
    await expect(api.clubs.list()).rejects.toMatchObject({ status: 500 });
    await waitFor(() => expect(toasts).toEqual([['error', messages.uk['ERRORS.serverError']]]));
    setErrorTranslator((key) => key);
  });
});
