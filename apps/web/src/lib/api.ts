import 'client-only';
import { cookieTransport, createApi, createApiClient } from '@book-club/api-client';
import { hasSessionHint } from './session-hint';

export const api = createApi(
  createApiClient({
    baseUrl: '/api/v1',
    transport: cookieTransport({ hasSession: () => hasSessionHint() }),
    onUnauthenticated: () => {
      // hard navigation: /login is still owned by the legacy app
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    },
  }),
);
