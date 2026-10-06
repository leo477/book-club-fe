// Reports gzip -9 first-load JS (every module <script src> in the served HTML) for the production build.
// Usage: npm run build && npm run size [-- --budget 200 --ceiling 250 --routes /clubs,/privacy,/clubs/:id=/clubs/<uuid>]
// A route may be written `pattern=path` when the served path differs from the manifest pattern (dynamic segments).
// --budget is the target (warns above it); --ceiling is the failing threshold (env FIRST_LOAD_CEILING_KB, default 250).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer as createTcpServer } from 'node:net';
import { gzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const budgetKb = Number(opt('budget', process.env.FIRST_LOAD_BUDGET_KB ?? '200'));
const ceilingKb = Number(opt('ceiling', process.env.FIRST_LOAD_CEILING_KB ?? '250'));
if (!(ceilingKb >= budgetKb)) {
  console.error(`--ceiling (${ceilingKb} KB) must be >= --budget (${budgetKb} KB)`);
  process.exit(2);
}
const routes = opt('routes', '/clubs,/privacy')
  .split(',')
  .map((spec) => {
    const [pattern, path = pattern] = spec.split('=');
    return { pattern, path };
  });
const port = Number(
  opt('port', '') ||
    (await new Promise((resolve) => {
      const probe = createTcpServer().listen(0, () => {
        const { port: free } = probe.address();
        probe.close(() => resolve(free));
      });
    })),
);

if (!existsSync('.next/BUILD_ID')) {
  console.error('No production build found: run `npm run build` first.');
  process.exit(2);
}

// Serves the strangler flags so the proxy hands the routes to Next instead of rewriting to the legacy app.
const flags = { version: 1, enabled: true, routes: Object.fromEntries(routes.map((r) => [r.pattern, { target: 'next', percent: 100 }])) };
// @vercel/edge-config only accepts https://edge-config.vercel.com/<id> connection strings, so a local http stub is rejected, the proxy
// then reads "no config" and rewrites every route to the (unreachable) legacy origin. Intercept that one host in the child instead.
const preload = join(mkdtempSync(join(tmpdir(), 'size-')), 'edge-preload.cjs');
writeFileSync(
  preload,
  `const real = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' ? input : (input.url ?? String(input)));
  if (url.host !== 'edge-config.vercel.com') return real(input, init);
  return Promise.resolve(new Response(${JSON.stringify(JSON.stringify(flags))}, { status: 200, headers: { 'content-type': 'application/json', etag: '"1"' } }));
};`,
);
const next = spawn('npx', ['next', 'start', '-p', String(port)], {
  detached: true, // own process group: killing only the npx wrapper leaves next-server holding the inherited stderr pipe open
  env: {
    ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --require ${preload}`.trim(),
    EDGE_CONFIG: 'https://edge-config.vercel.com/ecfg_local?token=local',
    LEGACY_ORIGIN: process.env.LEGACY_ORIGIN ?? 'https://legacy.invalid',
  },
  stdio: ['ignore', 'ignore', 'inherit'],
});
next.on('exit', (code) => {
  if (code) {
    console.error(`next start exited with ${code}`);
    process.exit(2);
  }
});
const stop = () => {
  try {
    process.kill(-next.pid, 'SIGTERM');
  } catch {
    // already gone
  }
};
process.on('exit', stop);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(130));

const base = `http://127.0.0.1:${port}`;
const get = (path) => fetch(`${base}${path}`, { signal: AbortSignal.timeout(10_000), headers: { cookie: 'bc_bucket=0', 'accept-encoding': 'identity' } });

for (let i = 0; ; i++) {
  try {
    if ((await get(routes[0].path)).status < 500) break;
  } catch {
    // not listening yet
  }
  if (i > 60) {
    console.error('next start did not become ready');
    process.exit(2);
  }
  await new Promise((r) => setTimeout(r, 500));
}

const kb = (n) => (n / 1024).toFixed(1);
let failed = false;
for (const { path: route } of routes) {
  const res = await get(route);
  const html = await res.text();
  if (!res.ok || !html.includes('/_next/')) {
    console.error(`${route}: HTTP ${res.status}, not served by Next (strangler flag off?)`);
    failed = true;
    continue;
  }
  const srcs = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].filter(([tag]) => !/\bnomodule\b/i.test(tag)).map(([, src]) => src);
  const files = [];
  for (const src of [...new Set(srcs)]) {
    const body = Buffer.from(await (await get(src)).arrayBuffer());
    files.push({ src, raw: body.length, gz: gzipSync(body, { level: 9 }).length });
  }
  const gz = files.reduce((n, f) => n + f.gz, 0);
  const raw = files.reduce((n, f) => n + f.raw, 0);
  const failing = gz > ceilingKb * 1024;
  const warning = !failing && gz > budgetKb * 1024;
  failed ||= failing;
  const verdict = failing ? `OVER CEILING ${ceilingKb} KB (fail)` : warning ? `WARNING: over the ${budgetKb} KB target, under the ${ceilingKb} KB ceiling` : 'ok';
  console.log(`${route}: ${files.length} scripts, raw ${kb(raw)} KB, gzip-9 ${kb(gz)} KB (target ${budgetKb} KB, ceiling ${ceilingKb} KB) ${verdict}`);
  if (args.includes('--verbose')) for (const f of files) console.log(`  ${kb(f.gz).padStart(7)} KB  ${f.src}`);
}
stop();
process.exit(failed ? 1 : 0);
