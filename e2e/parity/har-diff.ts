import { chromium, type BrowserContext, type Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

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

const IGNORED_PATH = /^\/(_next|_vercel|@vite|@fs|__vite)(\/|$)/;
const STATIC_EXT = /\.(js|mjs|css|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|json5?|txt|xml|webmanifest)$/i;

interface HarEntry {
  request: { method: string; url: string; postData?: { text?: string; mimeType?: string } };
}

export function normalizePath(p: string): string {
  return p
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, ':ts')
    .replace(/(?<=\/)[0-9a-f]{16,}(?=\/|$)/gi, ':hash')
    .replace(/(?<=\/)\d{6,}(?=\/|$)/g, ':n');
}

export function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.length ? [shape(value[0])] : [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, shape(v)]),
    );
  }
  return value === null ? 'null' : typeof value;
}

function bodyShape(post: HarEntry['request']['postData']): string {
  if (!post?.text) return '-';
  try {
    return JSON.stringify(shape(JSON.parse(post.text)));
  } catch {
    const keys = [...new URLSearchParams(post.text).keys()].sort();
    return keys.length ? `form:${keys.join(',')}` : 'raw';
  }
}

export function signatures(entries: HarEntry[], selfOrigin: string): string[] {
  const out: string[] = [];
  for (const { request } of entries) {
    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol)) continue;
    const self = url.origin === selfOrigin;
    if (self && IGNORED_PATH.test(url.pathname)) continue;
    if (request.method === 'GET' && STATIC_EXT.test(url.pathname)) continue;
    const keys = [...new Set(url.searchParams.keys())].sort().join(',');
    out.push(
      `${request.method} ${self ? 'self' : url.host} ${normalizePath(url.pathname)}?${keys} body=${bodyShape(request.postData)}`,
    );
  }
  return out;
}

function count(list: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of list) m.set(s, (m.get(s) ?? 0) + 1);
  return m;
}

export function diff(legacy: string[], next: string[], allowed: Set<string>): string[] {
  const a = count(legacy);
  const b = count(next);
  const problems: string[] = [];
  for (const sig of new Set([...a.keys(), ...b.keys()])) {
    if (allowed.has(sig)) continue;
    const x = a.get(sig) ?? 0;
    const y = b.get(sig) ?? 0;
    if (x !== y) problems.push(`${sig}  legacy=${x} next=${y}`);
  }
  return problems.sort();
}

function loadAllowlist(journey: string): Set<string> {
  const file = path.join(ALLOWLIST_DIR, `${journey}.json`);
  if (!existsSync(file)) return new Set();
  const parsed = JSON.parse(readFileSync(file, 'utf-8')) as { ignore?: { signature: string; reason: string }[] };
  for (const item of parsed.ignore ?? []) {
    if (!item.signature || !item.reason) throw new Error(`${file}: every allowlist entry needs signature and reason`);
  }
  return new Set((parsed.ignore ?? []).map((i) => i.signature));
}

function storageStateFor(origin: string): string {
  if (!existsSync(AUTH_STATE)) throw new Error('e2e/.auth/member.json missing; run the parity config global setup first');
  const state = JSON.parse(readFileSync(AUTH_STATE, 'utf-8')) as { origins: { origin: string }[] };
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
    recordHar: { path: harPath, content: 'omit' },
    storageState: journey.auth ? storageStateFor(new URL(target).origin) : undefined,
  });
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
    const problems = diff(legacy, next, loadAllowlist(name));
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
