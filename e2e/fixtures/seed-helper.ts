import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import path from 'node:path';
import type { APIRequestContext } from '@playwright/test';
import type { RunContext } from '../global-setup';
import { newApiContext } from './api-client';

const RUN_CONTEXT_PATH = path.join(__dirname, '..', '.auth', 'run-context.json');

// Loads the shared baseline (personas + seeded club/event/quiz IDs) written
// by global-setup.ts. Every spec reads from this instead of re-registering
// users or re-creating entities, which would burn the /auth rate limits and
// duplicate work across files.
export function loadRunContext(): RunContext {
  return JSON.parse(readFileSync(RUN_CONTEXT_PATH, 'utf-8')) as RunContext;
}

// Decodes a JWT payload without verifying the signature — only used to read
// `exp` so we know whether it's worth refreshing before a request, not for
// any security-relevant decision.
function decodeJwtExpiry(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json = Buffer.from(payload, 'base64url').toString('utf-8');
    const { exp } = JSON.parse(json) as { exp?: number };
    return exp ?? null;
  } catch {
    return null;
  }
}

// Returns the persona's access token, verifying it still has enough runway
// left in its TTL to last the rest of the suite.
//
// Deliberately does NOT call /auth/refresh here even though that would seem
// like the obvious fix for a stale token: refreshing rotates the refresh
// token, and the *storageState* files primed in global-setup.ts (member.json/
// organizer.json) are a frozen snapshot of localStorage — they aren't updated
// when this function mutates run-context.json. A silent refresh here would
// desync the two, and any UI spec that runs afterward would silently fail to
// restore its session (Angular's AuthService.init() would refresh with a now-
// invalidated token and land the "authenticated" test on /login). Access
// tokens are minted once in global setup with a 1h TTL and the full-audit
// suite runs for ~10 minutes, so staleness here means something is
// unexpectedly slow — fail loudly instead of masking it.
export async function getFreshAccessToken(role: 'member' | 'organizer'): Promise<string> {
  const runContext = loadRunContext();
  const persona = runContext[role];
  const exp = decodeJwtExpiry(persona.accessToken);
  const isStale = exp !== null && exp * 1000 - Date.now() < 60_000;
  if (isStale) {
    throw new Error(
      `[seed-helper] ${role}'s access token is within 60s of expiry — the full-audit run is taking ` +
        'much longer than expected. Refreshing here would desync run-context.json from the .auth/*.json ' +
        'storageState files used by UI specs, so this fails loudly instead: re-run the suite, or investigate ' +
        'why it is running long (Render cold start? a hung test?).',
    );
  }
  return persona.accessToken;
}

export async function apiContextFor(role: 'member' | 'organizer'): Promise<APIRequestContext> {
  const token = await getFreshAccessToken(role);
  return newApiContext({ extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
}

// Registers a brand-new, disposable organizer account and returns an
// authenticated context for it. The backend enforces one club per organizer
// (`ORGANIZER_ALREADY_HAS_CLUB`, 409 — confirmed in app/services/club_service.py),
// and the shared `organizer` persona from global-setup.ts already owns the
// seeded baseline club. Any test that needs to create/pause/cancel/delete a
// club of its own (rather than read/patch the shared one) needs its own
// organizer identity for exactly this reason — using the shared organizerApi
// fixture for a second `POST /clubs` call 409s every time.
export async function registerDisposableOrganizer(): Promise<APIRequestContext> {
  const anon = await newApiContext();
  // randomInt (CSPRNG), not Math.random(), since this feeds a password below.
  const suffix = `${Date.now()}${randomInt(0, 1000)}`;
  const resp = await anon.post('/auth/register', {
    data: {
      email: `pw.audit.probe.${suffix}.organizer@gmail.com`,
      password: `PwAuditProbe-${suffix}!`,
      displayName: `PW Audit Probe Organizer ${suffix}`,
      role: 'organizer',
    },
  });
  // Read the body BEFORE disposing `anon` — disposing an APIRequestContext
  // frees the response bodies it produced, so `resp.json()`/`resp.text()`
  // called afterward throws "Response has been disposed".
  const status = resp.status();
  const bodyText = await resp.text();
  await anon.dispose();
  if (status !== 201) {
    throw new Error(`[seed-helper] disposable organizer registration failed: ${status} ${bodyText}`);
  }
  const auth = JSON.parse(bodyText) as { accessToken: string };
  return newApiContext({ extraHTTPHeaders: { Authorization: `Bearer ${auth.accessToken}` } });
}

// Ad hoc entity creation for specs that need a variant beyond the shared
// baseline seeded in global-setup.ts (e.g. a second club, or a paused club).
// Kept thin — specs decide field values, this just does the POST + status check.

export async function createClub(
  api: APIRequestContext,
  data: { name: string; description?: string; isPublic?: boolean; tags?: string[] },
): Promise<{ id: string; [key: string]: unknown }> {
  const resp = await api.post('/clubs', { data });
  if (resp.status() !== 201) {
    throw new Error(`[seed-helper] POST /clubs failed: ${resp.status()} ${await resp.text()}`);
  }
  return resp.json();
}

export async function createEvent(
  api: APIRequestContext,
  clubId: string,
  data: { title: string; date: string; city: string; [key: string]: unknown },
): Promise<{ id: string; [key: string]: unknown }> {
  const resp = await api.post(`/clubs/${clubId}/events`, { data });
  if (resp.status() !== 201) {
    throw new Error(`[seed-helper] POST /clubs/${clubId}/events failed: ${resp.status()} ${await resp.text()}`);
  }
  return resp.json();
}

export async function createQuiz(
  api: APIRequestContext,
  clubId: string,
  data: { title: string; description?: string },
): Promise<{ id: string; [key: string]: unknown }> {
  const resp = await api.post(`/clubs/${clubId}/quizzes`, { data });
  if (resp.status() !== 201) {
    throw new Error(`[seed-helper] POST /clubs/${clubId}/quizzes failed: ${resp.status()} ${await resp.text()}`);
  }
  return resp.json();
}

export async function addQuizQuestion(
  api: APIRequestContext,
  quizId: string,
  data: { question: string; options: string[]; correctIndex: number },
): Promise<{ id: string; [key: string]: unknown }> {
  const resp = await api.post(`/quizzes/${quizId}/questions`, { data });
  if (resp.status() !== 201) {
    throw new Error(`[seed-helper] POST /quizzes/${quizId}/questions failed: ${resp.status()} ${await resp.text()}`);
  }
  return resp.json();
}
