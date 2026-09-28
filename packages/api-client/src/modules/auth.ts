import {
  authResponse,
  authTokens,
  sessionStatus,
  userProfile,
  wsTicket,
  type LoginRequest,
  type RegisterRequest,
} from '@book-club/contracts';
import { z } from 'zod';
import type { ApiClient } from '../client';

const publicCall = { skipAuthRedirect: true, suppressErrorToast: true } as const;

export const authApi = (c: ApiClient) => ({
  login: (body: LoginRequest) => c.post('/auth/login', authResponse, body, publicCall),
  register: (body: RegisterRequest) => c.post('/auth/register', authResponse, body, publicCall),
  refresh: () => c.post('/auth/refresh', authTokens, {}, publicCall),
  exchangeOAuthCode: (code: string) => c.post('/auth/oauth/exchange', authTokens, { code }, publicCall),
  logout: () => c.post('/auth/logout', z.void()),
  me: () => c.get('/auth/me', userProfile),
  sessionStatus: () => c.get('/auth/session-status', sessionStatus, publicCall),
  wsTicket: () => c.post('/auth/ws-ticket', wsTicket, {}),
});
