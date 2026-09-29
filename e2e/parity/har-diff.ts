import { chromium, type BrowserContext, type Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { addBypass } from './bypass.ts';
import { isSeedAllowed } from '../seed-guard.ts';

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

const VALUE_KEYS = new Set(['limit', 'offset', 'page', 'page_size', 'sort', 'order', 'q', 'search']);
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
    const keys = [...new Set(url.searchParams.keys())]
      .sort()
      .map((k) => (VALUE_KEYS.has(k) ? `${k}=${url.searchParams.getAll(k).sort().join('|')}` : k))
      .join(',');
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

export interface AllowEntry {
  signature: string;
  reason: string;
  legacy?: number;
  next?: number;
}

export function diff(legacy: string[], next: string[], allowed: AllowEntry[] = [], stale: string[] = []): string[] {
  const a = count(legacy);
  const b = count(next);
  const rules = new Map(allowed.map((e) => [e.signature, e]));
  const matched = new Set<string>();
  const problems: string[] = [];
  for (const sig of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(sig) ?? 0;
    const y = b.get(sig) ?? 0;
    const rule = rules.get(sig);
    if (rule) {
      matched.add(sig);
      const legacyOk = rule.legacy === undefined || rule.legacy === x;
      const nextOk = rule.next === undefined || rule.next === y;
      if (legacyOk && nextOk) continue;
      problems.push(`${sig}  legacy=${x} next=${y}  (allowlist expects legacy=${rule.legacy ?? '*'} next=${rule.next ?? '*'})`);
      continue;
    }
    if (x !== y) problems.push(`${sig}  legacy=${x} next=${y}`);
  }
  for (const e of allowed) if (!matched.has(e.signature)) stale.push(e.signature);
  return problems.sort();
}

function loadAllowlist(journey: string): AllowEntry[] {
  const file = path.join(ALLOWLIST_DIR, `${journey}.json`);
  if (!existsSync(file)) return [];
  const parsed = JSON.parse(readFileSync(file, 'utf-8')) as { ignore?: AllowEntry[] };
  for (const item of parsed.ignore ?? []) {
    if (!item.signature || !item.reason) throw new Error(`${file}: every allowlist entry needs signature and reason`);
  }
  return parsed.ignore ?? [];
}

function storageStateFor(origin: string): string {
  const hint = 'run `AUDIT_API_BASE_URL=<local api> npm run parity:setup-member` (plus ALLOW_PROD_SEED=<hostname> for a non-local API)';
  if (!existsSync(AUTH_STATE)) throw new Error(`e2e/.auth/member.json is missing: ${hint}`);
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
  const ageH = (Date.now() - statSync(AUTH_STATE).mtimeMs) / 3_600_000;
  if (ageH > maxAgeH) {
    throw new Error(`e2e/.auth/member.json is ${ageH.toFixed(1)}h old (max ${maxAgeH}h): ${hint}`);
  }
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
