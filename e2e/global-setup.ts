import { chromium, type APIRequestContext, type FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import path from 'node:path';
import { apiBaseURL } from '../playwright.full-audit.config';
import { newApiContext } from './fixtures/api-client';

// Runs once before the full-audit suite:
//  1. Warms up the (possibly sleeping) live backend.
//  2. Registers two throwaway test users (member + organizer) via the real
//     /auth/register endpoint — no pre-existing accounts required.
//  3. Primes a Playwright storageState per persona so specs can start
//     "already logged in" without ever hitting the rate-limited /auth/login.
//  4. Seeds one club (with the member joined), one event and one quiz
//     (with a question) so dynamic `:id` routes have something real to load.
//  5. Writes everything specs need into e2e/.auth/run-context.json.

const AUTH_DIR = path.join(__dirname, '.auth');

interface Persona {
  role: 'user' | 'organizer';
  email: string;
  password: string;
  displayName: string;
}

interface AuthResponse {
  user: { id: string };
  accessToken: string;
  refreshToken: string;
}

export interface RunContext {
  runId: string;
  apiBaseURL: string;
  member: { userId: string; email: string; accessToken: string; refreshToken: string; storageStatePath: string };
  organizer: { userId: string; email: string; accessToken: string; refreshToken: string; storageStatePath: string };
  clubId: string;
  eventId: string;
  quizId: string;
  questionId: string;
}

async function registerPersona(apiRequest: APIRequestContext, persona: Persona): Promise<AuthResponse> {
  const resp = await apiRequest.post('/auth/register', {
    data: {
      email: persona.email,
      password: persona.password,
      displayName: persona.displayName,
      role: persona.role,
    },
  });
  if (resp.status() !== 201) {
    const body = await resp.text();
    throw new Error(
      `[global-setup] /auth/register for ${persona.email} returned ${resp.status()} (expected 201). ` +
        `If this is 202, Supabase email-confirmation is enabled for this project and the register-then-use-token ` +
        `approach cannot work as-is — see plan §Крок 0 for fallback options. Body: ${body}`,
    );
  }
  return resp.json();
}

async function primeStorageState(
  baseURL: string,
  auth: AuthResponse,
  storageStatePath: string,
): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.evaluate(
    ([refreshToken]) => {
      localStorage.setItem('bc_has_session', '1');
      localStorage.setItem('bc_refresh_token', refreshToken);
    },
    [auth.refreshToken],
  );
  await context.storageState({ path: storageStatePath });
  await browser.close();
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  mkdirSync(AUTH_DIR, { recursive: true });

  const project = config.projects[0];
  const baseURL = project.use.baseURL ?? 'http://localhost:4200';

  const apiRequest = await newApiContext({ timeout: 60_000 });

  // Warm up a possibly-sleeping Render instance before burning rate-limited
  // auth calls on a slow first request.
  await apiRequest.get('/health', { timeout: 60_000 }).catch(() => undefined);

  // randomInt (CSPRNG), not Math.random(), since this feeds the throwaway
  // test accounts' passwords below.
  const runId = `${Date.now()}${randomInt(0, 1000)}`;
  // email-validator on the backend rejects fake TLDs like .test/.example
  // (confirmed: registering with a .test address returns 422), so namespaced
  // addresses use a real, deliverable-looking domain instead.
  const memberPersona: Persona = {
    role: 'user',
    email: `pw.audit.${runId}.member@gmail.com`,
    password: `PwAudit-${runId}!`,
    displayName: `PW Audit Member ${runId}`,
  };
  const organizerPersona: Persona = {
    role: 'organizer',
    email: `pw.audit.${runId}.organizer@gmail.com`,
    password: `PwAudit-${runId}!`,
    displayName: `PW Audit Organizer ${runId}`,
  };

  const memberAuth = await registerPersona(apiRequest, memberPersona);
  const organizerAuth = await registerPersona(apiRequest, organizerPersona);

  const memberStorageStatePath = path.join(AUTH_DIR, 'member.json');
  const organizerStorageStatePath = path.join(AUTH_DIR, 'organizer.json');
  await primeStorageState(baseURL, memberAuth, memberStorageStatePath);
  await primeStorageState(baseURL, organizerAuth, organizerStorageStatePath);

  const organizerApi = await newApiContext({
    extraHTTPHeaders: { Authorization: `Bearer ${organizerAuth.accessToken}` },
  });
  const memberApi = await newApiContext({
    extraHTTPHeaders: { Authorization: `Bearer ${memberAuth.accessToken}` },
  });

  const clubResp = await organizerApi.post('/clubs', {
    data: { name: `PW Audit Club ${runId}`, description: 'Seeded by Playwright full-audit global setup', isPublic: true },
  });
  if (clubResp.status() !== 201) {
    throw new Error(`[global-setup] POST /clubs failed: ${clubResp.status()} ${await clubResp.text()}`);
  }
  const club = await clubResp.json();
  const clubId: string = club.id;

  const joinResp = await memberApi.post(`/clubs/${clubId}/join`);
  if (![200, 201, 204].includes(joinResp.status())) {
    throw new Error(`[global-setup] POST /clubs/${clubId}/join failed: ${joinResp.status()} ${await joinResp.text()}`);
  }

  // Joining always creates a *pending* join request (app/services/club_service.py's
  // request_join_club_service — there's no auto-approval, even for isPublic clubs),
  // so the member isn't an actual club_members row yet. Approve it as the
  // organizer so specs that assert "the member is really in this club"
  // (GET /members, the club detail leave-button, etc.) see a real membership.
  const memberId = memberAuth.user.id;
  const approveResp = await organizerApi.post(`/clubs/${clubId}/join-requests/${memberId}/approve`);
  if (approveResp.status() !== 200) {
    throw new Error(
      `[global-setup] POST /clubs/${clubId}/join-requests/${memberId}/approve failed: ` +
        `${approveResp.status()} ${await approveResp.text()}`,
    );
  }

  const eventResp = await organizerApi.post(`/clubs/${clubId}/events`, {
    data: {
      title: `PW Audit Event ${runId}`,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      city: 'Kyiv',
    },
  });
  if (eventResp.status() !== 201) {
    throw new Error(`[global-setup] POST /clubs/${clubId}/events failed: ${eventResp.status()} ${await eventResp.text()}`);
  }
  const event = await eventResp.json();
  const eventId: string = event.id;

  const quizResp = await organizerApi.post(`/clubs/${clubId}/quizzes`, {
    data: { title: `PW Audit Quiz ${runId}`, description: 'Seeded quiz' },
  });
  if (quizResp.status() !== 201) {
    throw new Error(`[global-setup] POST /clubs/${clubId}/quizzes failed: ${quizResp.status()} ${await quizResp.text()}`);
  }
  const quiz = await quizResp.json();
  const quizId: string = quiz.id;

  const questionResp = await organizerApi.post(`/quizzes/${quizId}/questions`, {
    data: {
      question: 'What is the capital of the book club universe?',
      options: ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv'],
      correctIndex: 0,
    },
  });
  if (questionResp.status() !== 201) {
    throw new Error(`[global-setup] POST /quizzes/${quizId}/questions failed: ${questionResp.status()} ${await questionResp.text()}`);
  }
  const question = await questionResp.json();
  const questionId: string = question.id;

  const runContext: RunContext = {
    runId,
    apiBaseURL,
    member: {
      userId: memberAuth.user.id,
      email: memberPersona.email,
      accessToken: memberAuth.accessToken,
      refreshToken: memberAuth.refreshToken,
      storageStatePath: memberStorageStatePath,
    },
    organizer: {
      userId: organizerAuth.user.id,
      email: organizerPersona.email,
      accessToken: organizerAuth.accessToken,
      refreshToken: organizerAuth.refreshToken,
      storageStatePath: organizerStorageStatePath,
    },
    clubId,
    eventId,
    quizId,
    questionId,
  };
  writeFileSync(path.join(AUTH_DIR, 'run-context.json'), JSON.stringify(runContext, null, 2));

  await organizerApi.dispose();
  await memberApi.dispose();
  await apiRequest.dispose();
}
