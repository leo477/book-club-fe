import 'client-only';
import { cookieTransport, createApi, createApiClient } from '@book-club/api-client';
import { translateError } from './error-translator';
import { hardNavigate } from './navigate';
import { hasSessionHint } from './session-hint';
import { showToast } from './toast';

export const api = createApi(
  createApiClient({
    baseUrl: '/api/v1',
    transport: cookieTransport({ hasSession: () => hasSessionHint() }),
    onUnauthenticated: () => hardNavigate('/login'),
    onForbidden: () => {
      if (window.location.pathname !== '/clubs') hardNavigate('/clubs');
    },
    onError: (error, { suppress }) => {
      if (!suppress) showToast('error', translateError(error.translationKey));
    },
  }),
);
