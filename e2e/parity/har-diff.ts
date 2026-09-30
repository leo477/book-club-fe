import { chromium, type BrowserContext, type Page } from '@playwright/test';
import { closeSync, fstatSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { addBypass } from './bypass.ts';
import { isSeedAllowed } from '../seed-guard.ts';
import { diff, signatures, type AllowEntry, type HarEntry } from './har-signature.ts';

export { diff, normalizePath, shape, signatures, type AllowEntry } from './har-signature.ts';

interface Journey {
  auth?: 'member';
  steps: (page: Page) => Promise<void>;
}

const visit = (...routes: string[]) => async (page: Page) => {
  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
  }
};

export const journeys: Record<string, Journey> = {
  'guest-browse': { steps: visit('/events', '/clubs') },
  'guest-auth-pages': { steps: visit('/login', '/register') },
  'member-browse': { auth: 'member', steps: visit('/clubs', '/events', '/profile') },
};

const targets: Record<string, string> = {
  legacy: process.env['PARITY_LEGACY_URL'] ?? 'http://localhost:4200',
  next: process.env['PARITY_NEXT_URL'] ?? 'http://localhost:3000',
};

const ROOT = path.join(import.meta.dirname, '..', '..');
const ALLOWLIST_DIR = path.join(import.meta.dirname, 'allowlists');
const OUT_DIR = path.join(ROOT, 'playwright-report', 'parity');
const AUTH_STATE = path.join(ROOT, 'e2e', '.auth', 'member.json');

function loadAllowlist(journey: string): AllowEntry[] {
  const file = path.join(ALLOWLIST_DIR, `${journey}.json`);
  let raw: string;
  try {
    raw = readFileSync(file, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  const parsed = JSON.parse(raw) as { ignore?: AllowEntry[] };
  for (const item of parsed.ignore ?? []) {
    if (!item.signature || !item.reason) throw new Error(`${file}: every allowlist entry needs signature and reason`);
  }
  return parsed.ignore ?? [];
}

function storageStateFor(origin: string): string {
  const hint = 'run `AUDIT_API_BASE_URL=<local api> npm run parity:setup-member` (plus ALLOW_PROD_SEED=<hostname> for a non-local API)';
  let stateRaw: string;
  let stateMtimeMs: number;
  let fd: number;
  try {
    fd = openSync(AUTH_STATE, 'r');
  } catch {
    throw new Error(`e2e/.auth/member.json is missing: ${hint}`);
  }
  try {
    stateMtimeMs = fstatSync(fd).mtimeMs;
    stateRaw = readFileSync(fd, 'utf-8');
  } finally {
    closeSync(fd);
  }
  const metaFile = path.join(path.dirname(AUTH_STATE), 'member.meta.json');
  let backend: string | undefined;
  try {
    backend = (JSON.parse(readFileSync(metaFile, 'utf-8')) as { apiBaseURL?: string }).apiBaseURL;
  } catch {
    backend = undefined;
  }
  if (!backend) {
    throw new Error(`e2e/.auth/member.json has no recorded backend (legacy file): regenerate it via npm run parity:setup-member (${hint})`);
  }
  if (!isSeedAllowed(backend)) {
    throw new Error(`e2e/.auth/member.json was created against non-local backend ${backend}; set ALLOW_PROD_SEED=${new URL(backend).hostname} to use it, or regenerate against a local API.`);
  }
  const maxAgeH = Number(process.env['PARITY_AUTH_MAX_AGE_H'] ?? 12);
  const ageH = (Date.now() - stateMtimeMs) / 3_600_000;
  if (ageH > maxAgeH) {
    throw new Error(`e2e/.auth/member.json is ${ageH.toFixed(1)}h old (max ${maxAgeH}h): ${hint}`);
  }
  const state = JSON.parse(stateRaw) as { origins: { origin: string }[] };
  for (const o of state.origins) o.origin = origin;
  const file = path.join(OUT_DIR, `member-${new URL(origin).port || 'default'}.json`);
  writeFileSync(file, JSON.stringify(state));
  return file;
}

async function record(name: string, target: string, journeyName: string, journey: Journey): Promise<string[]> {
  const browser = await chromium.launch();
  const harPath = path.join(OUT_DIR, `${journeyName}.${name}.har`);
  const context: BrowserContext = await browser.newContext({
    baseURL: target,
    bypassCSP: name === 'legacy' && process.env['PARITY_LEGACY_BYPASS_CSP'] === '1',
    recordHar: { path: harPath, content: 'omit' },
    storageState: journey.auth ? storageStateFor(new URL(target).origin) : undefined,
  });
  if (name === 'next') await addBypass(context, new URL(target).origin, process.env['PARITY_NEXT_BYPASS']);
  await context.addInitScript(() => localStorage.setItem('lang', 'uk'));
  const page = await context.newPage();
  await journey.steps(page);
  await context.close();
  await browser.close();
  const har = JSON.parse(readFileSync(harPath, 'utf-8')) as { log: { entries: HarEntry[] } };
  return signatures(har.log.entries, new URL(target).origin);
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  const wanted = process.env['PARITY_JOURNEY'];
  const names = wanted ? wanted.split(',') : Object.keys(journeys);
  let failed = false;
  for (const name of names) {
    const journey = journeys[name];
    if (!journey) throw new Error(`Unknown journey "${name}". Known: ${Object.keys(journeys).join(', ')}`);
    const legacy = await record('legacy', targets['legacy'], name, journey);
    const next = await record('next', targets['next'], name, journey);
    const stale: string[] = [];
    const problems = diff(legacy, next, loadAllowlist(name), stale);
    if (stale.length) {
      console.warn(`WARN ${name}: ${stale.length} stale allowlist entr${stale.length === 1 ? 'y' : 'ies'} never matched\n  ${stale.join('\n  ')}`);
      if (process.env['PARITY_STRICT'] === '1') failed = true;
    }
    if (problems.length) {
      failed = true;
      console.error(`FAIL ${name}: ${problems.length} difference(s)\n  ${problems.join('\n  ')}`);
    } else {
      console.log(`PASS ${name}: ${legacy.length} legacy / ${next.length} next requests`);
    }
  }
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) void main();
