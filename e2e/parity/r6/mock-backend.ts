// Anonymous mock backend for the Next server (SSR/ISR fetches). Usage:
// `POST /__mutate` {id, patch} edits a club (revalidation test).
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON e2e/parity/r6/mock-backend.ts [port=9922]
// It speaks https with a throwaway self-signed certificate because `next build`/`next start` refuse an http BACKEND_ORIGIN.
// Start Next with BACKEND_ORIGIN=https://localhost:<port> and NODE_TLS_REJECT_UNAUTHORIZED=0 (rewrites + server fetches).
// `GET /__requests` returns the paths the server was asked for (proves guests cause no browser-side calls and how often ISR refetches).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { CLUBS, handleApi, newState } from './fixtures.ts';

const port = Number(process.argv[2] ?? 9922);
const dir = mkdtempSync(path.join(tmpdir(), 'r6-mock-'));
const key = path.join(dir, 'key.pem');
const cert = path.join(dir, 'cert.pem');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-subj', '/CN=localhost', '-days', '2', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });

const seen: string[] = [];
const state = newState('guest');

createServer({ key: readFileSync(key), cert: readFileSync(cert) }, (req, res) => {
  const url = new URL(req.url ?? '/', 'https://localhost');
  if (url.pathname === '/__requests') {
    res.setHeader('content-type', 'application/json');
    return void res.end(JSON.stringify(seen));
  }
  if (url.pathname === '/__mutate' && req.method === 'POST') {
    // test hook: { id, patch } edits a club so ISR/revalidation behaviour can be observed
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const { id, patch } = JSON.parse(raw) as { id: string; patch: Record<string, unknown> };
      Object.assign(CLUBS[id] ?? {}, patch);
      res.statusCode = 204;
      res.end();
    });
    return;
  }
  const rel = url.pathname.replace(/^\/api\/v1/, '');
  seen.push(`${req.method} ${rel}${url.search}`);
  const reply = handleApi(state, req.method ?? 'GET', rel, url.search);
  res.statusCode = reply.status;
  res.setHeader('content-type', 'application/json');
  res.end(reply.body === undefined ? '' : JSON.stringify(reply.body));
}).listen(port, '127.0.0.1', () => console.log(`r6 mock backend on https://localhost:${port}`));
