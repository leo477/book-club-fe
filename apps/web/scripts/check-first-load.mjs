// Reports gzip -9 first-load JS (every module <script src> in the served HTML) for the production build.
// Usage: npm run build && npm run size [-- --budget 200 --routes /clubs,/privacy]
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { createServer as createTcpServer } from 'node:net';
import { gzipSync } from 'node:zlib';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const budgetKb = Number(opt('budget', process.env.FIRST_LOAD_BUDGET_KB ?? '200'));
const routes = opt('routes', '/clubs,/privacy').split(',');
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
const flags = { version: 1, enabled: true, routes: Object.fromEntries(routes.map((r) => [r, { target: 'next', percent: 100 }])) };
const edge = createServer((req, res) => {
  res.setHeader('content-type', 'application/json');
  res.end(req.url?.includes('/item/strangler') ? JSON.stringify(flags) : 'null');
});
await new Promise((resolve) => edge.listen(0, '127.0.0.1', resolve));
const edgeUrl = `http://127.0.0.1:${edge.address().port}/ecfg_local?token=local`;

const next = spawn('npx', ['next', 'start', '-p', String(port)], {
  env: { ...process.env, EDGE_CONFIG: edgeUrl, LEGACY_ORIGIN: process.env.LEGACY_ORIGIN ?? 'https://legacy.invalid' },
  stdio: ['ignore', 'ignore', 'inherit'],
});
next.on('exit', (code) => {
  if (code) {
    console.error(`next start exited with ${code}`);
    process.exit(2);
  }
});
const stop = () => {
  next.kill();
  edge.close();
};
process.on('exit', stop);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(130));

const base = `http://127.0.0.1:${port}`;
const get = (path) => fetch(`${base}${path}`, { headers: { cookie: 'bc_bucket=0', 'accept-encoding': 'identity' } });

for (let i = 0; ; i++) {
  try {
    if ((await get('/privacy')).status < 500) break;
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
for (const route of routes) {
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
  const over = gz > budgetKb * 1024;
  failed ||= over;
  console.log(`${route}: ${files.length} scripts, raw ${kb(raw)} KB, gzip-9 ${kb(gz)} KB (budget ${budgetKb} KB) ${over ? 'OVER' : 'ok'}`);
  if (args.includes('--verbose')) for (const f of files) console.log(`  ${kb(f.gz).padStart(7)} KB  ${f.src}`);
}
stop();
process.exit(failed ? 1 : 0);
