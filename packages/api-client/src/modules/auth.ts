import {
  authResponse,
  authTokens,
  registerResponse,
  sessionResponse,
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
  /** Web variants: the cookies carry the session, and the parsed result holds the user only (token fields are stripped); register may instead answer 202 `EMAIL_CONFIRMATION_REQUIRED`. */
  loginSession: (body: LoginRequest) => c.post('/auth/login', sessionResponse, body, publicCall),
  registerSession: (body: RegisterRequest) => c.post('/auth/register', registerResponse, body, publicCall),
  exchangeOAuthSession: (code: string, codeVerifier?: string) =>
    c.post('/auth/oauth/exchange', z.object({}), { code, code_verifier: codeVerifier }, publicCall),
  refresh: () => c.post('/auth/refresh', authTokens, {}, publicCall),
  exchangeOAuthCode: (code: string, codeVerifier?: string) =>
    c.post('/auth/oauth/exchange', authTokens, { code, code_verifier: codeVerifier }, publicCall),
  logout: () => c.post('/auth/logout', z.void()),
  me: (options?: { skipAuthRedirect?: boolean }) => c.get('/auth/me', userProfile, options),
  sessionStatus: () => c.get('/auth/session-status', sessionStatus, publicCall),
  wsTicket: (options?: { skipAuthRedirect?: boolean; suppressErrorToast?: boolean }) => c.post('/auth/ws-ticket', wsTicket, {}, options),
});
