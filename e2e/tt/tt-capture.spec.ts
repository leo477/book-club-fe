// Records Trusted Types violations (Content-Security-Policy-Report-Only) per Next flow via `securitypolicyviolation`; no endpoint needed.
// Fails on any violation not listed in known-violations.json, which doubles as the to-do list for tightening the allowlist.
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { LANG_COOKIE } from '../parity/r6/helpers';
import type { Role } from '../parity/r6/fixtures';
import { IDS } from '../parity/r6/fixtures';
import { EVENT_IDS, installEventsMock } from '../parity/r7/fixtures';
import { installProfileMock } from '../parity/r8/fixtures';

interface Violation {
  directive: string;
  blocked: string;
  sample: string;
  disposition: string;
  file: string;
  line: number;
}
interface Flow {
  name: string;
  path: string;
  role?: Role;
  lang?: 'uk' | 'en';
  theme?: 'light' | 'dark' | 'system';
  maps?: boolean;
}
declare global {
  interface Window {
    __tt?: Violation[];
    __ttPolicies?: string[];
  }
}

const OUT = 'test-results/tt';
const TT_CONSOLE = /TrustedType|TrustedHTML|TrustedScript/;
const MAPS_URL = 'https://maps.googleapis.com/maps/api/js';

const flows: Flow[] = [
  { name: 'events-member-uk-light', path: '/events', role: 'member' },
  { name: 'events-guest-redirect', path: '/events', role: 'guest' },
  {
    name: 'event-venue-map-member',
    path: `/events/${EVENT_IDS.withMap}`,
    role: 'member',
    maps: true,
  },
  {
    name: 'event-no-venue-member',
    path: `/events/${EVENT_IDS.soon}`,
    role: 'member',
  },
  {
    name: 'event-missing-404',
    path: `/events/${EVENT_IDS.missing}`,
    role: 'member',
  },
  { name: 'clubs-guest', path: '/clubs' },
  { name: 'clubs-member', path: '/clubs', role: 'member' },
  { name: 'club-detail-guest', path: `/clubs/${IDS.public}` },
  { name: 'club-detail-member', path: `/clubs/${IDS.public}`, role: 'member' },
  { name: 'login-guest', path: '/login' },
  { name: 'profile-member', path: '/profile', role: 'member' },
  { name: 'privacy-guest', path: '/privacy' },
  { name: 'not-found-guest', path: '/definitely-not-a-page' },
  { name: 'clubs-guest-dark', path: '/clubs', theme: 'dark' },
  { name: 'clubs-guest-system', path: '/clubs', theme: 'system' },
  { name: 'clubs-member-en', path: '/clubs', role: 'member', lang: 'en' },
  { name: 'login-guest-en-dark', path: '/login', lang: 'en', theme: 'dark' },
];

const known: { key: string; reason: string }[] = JSON.parse(
  readFileSync('e2e/tt/known-violations.json', 'utf8'),
);
const knownKeys = new Set(known.map((k) => k.key));
// the sample is "<sink>|<value>"; only the sink is stable across runs
// chunk URLs carry build hashes, so a Next chunk collapses to a wildcard; other script URLs stay (they identify a third-party loader)
const keyOf = (v: Violation): string => {
  const [sink = '', value = ''] = v.sample.split('|');
  const src = sink.endsWith(' src')
    ? ` ${value.replace(/^\/_next\/static\/chunks\/.*/, '/_next/static/chunks/*')}`
    : '';
  return `${v.directive} | ${sink.split('.')[0]}${src} | ${v.blocked}`;
};

const seen = new Map<string, { v: Violation; flows: Set<string> }>();
let mapsReachable = true;
const policiesSeen = new Set<string>();

test.beforeAll(async () => {
  mapsReachable = await fetch(MAPS_URL, {
    signal: AbortSignal.timeout(5_000),
  }).then(
    () => true,
    () => false,
  );
  mkdirSync(OUT, { recursive: true });
});

async function install(page: Page, f: Flow): Promise<void> {
  const role = f.role ?? 'guest';
  if (f.path === '/profile') await installProfileMock(page, role);
  else
    await installEventsMock(page, role, { mapsKey: f.maps ? 'key' : 'none' });
  // the cover host is not intercepted here: a blocked image is irrelevant to Trusted Types
  await page.context().addCookies([
    ...LANG_COOKIE(
      test.info().project.use.baseURL!,
      f.lang ?? 'uk',
      'light',
    ).filter((c) => c.name === 'lang'),
    {
      name: 'theme',
      value: f.theme ?? 'light',
      url: test.info().project.use.baseURL!,
    },
  ]);
  if (f.theme === 'system') await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    window.__tt = [];
    window.__ttPolicies = [];
    const tt = (
      window as unknown as {
        trustedTypes?: { createPolicy: (n: string, r?: unknown) => unknown };
      }
    ).trustedTypes;
    if (tt) {
      const create = tt.createPolicy.bind(tt);
      // observe which allowlisted policy names the app really creates
      tt.createPolicy = (name: string, rules?: unknown) => (
        window.__ttPolicies!.push(name),
        create(name, rules)
      );
    }
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__tt!.push({
        directive: e.effectiveDirective,
        blocked: e.blockedURI,
        sample: e.sample,
        disposition: e.disposition,
        file: e.sourceFile,
        line: e.lineNumber,
      });
    });
  });
}

for (const f of flows) {
  test(f.name, async ({ page }) => {
    if (f.maps && !mapsReachable) {
      writeFileSync(
        `${OUT}/${f.name}.json`,
        JSON.stringify(
          {
            flow: f.name,
            skipped: 'maps.googleapis.com unreachable',
            violations: [],
          },
          null,
          2,
        ),
      );
      console.log(
        `[tt] SKIPPED ${f.name}: maps.googleapis.com is unreachable, the Maps-dependent step did not run`,
      );
      test.skip(true, 'maps.googleapis.com unreachable');
    }
    const consoleTT: Violation[] = [];
    page.on('console', (m) => {
      if (TT_CONSOLE.test(m.text()))
        consoleTT.push({
          directive: 'console',
          blocked: '',
          sample: m.text().slice(0, 200),
          disposition: m.type(),
          file: m.location().url,
          line: m.location().lineNumber,
        });
    });
    await install(page, f);
    await page.goto(f.path);
    await page.waitForLoadState('networkidle');
    // a map that never renders (bad fake key, offline) must show up in the output instead of silently proving nothing
    const mapRendered = f.maps
      ? await page
          .locator('.gm-style, .gm-err-container')
          .waitFor({ timeout: 15_000 })
          .then(
            () => true,
            () => false,
          )
      : undefined;
    await page.waitForTimeout(500);
    const violations = [
      ...(await page.evaluate(() => window.__tt ?? [])),
      ...consoleTT,
    ];
    const policies = await page.evaluate(() => window.__ttPolicies ?? []);
    for (const n of policies) policiesSeen.add(n);
    writeFileSync(
      `${OUT}/${f.name}.json`,
      JSON.stringify(
        { flow: f.name, url: page.url(), mapRendered, policies, violations },
        null,
        2,
      ),
    );
    if (f.maps)
      console.log(
        `[tt] ${f.name}: Maps script ran, container rendered=${mapRendered}`,
      );
    for (const v of violations) {
      const k = keyOf(v);
      const e = seen.get(k) ?? { v, flows: new Set<string>() };
      e.flows.add(f.name);
      seen.set(k, e);
    }
  });
}

test.afterAll(() => {
  const rows = [...seen.entries()].map(([key, e]) => ({ key, ...e }));
  console.log(
    '\n[tt] directive | sink / sample | blocked | disposition | flows',
  );
  for (const r of rows)
    console.log(
      `${r.v.directive} | ${r.v.sample.slice(0, 80)} | ${r.v.blocked} | ${r.v.disposition} | ${[...r.flows].join(', ')}`,
    );
  if (!rows.length) console.log('(no violations)');
  console.log(
    `[tt] Trusted Types policies created: ${[...policiesSeen].join(', ') || '(none)'}`,
  );
  const unknown = rows.filter((r) => !knownKeys.has(r.key));
  writeFileSync(
    `${OUT}/_summary.json`,
    JSON.stringify(
      {
        mapsReachable,
        policies: [...policiesSeen],
        rows: rows.map((r) => ({ key: r.key, ...r.v, flows: [...r.flows] })),
        unknown: unknown.map((r) => r.key),
      },
      null,
      2,
    ),
  );
  expect(
    unknown.map((r) => r.key),
    'violations missing from e2e/tt/known-violations.json',
  ).toEqual([]);
});
