// Production-config stand-in for the Vercel deployment of the Angular app: serves dist/book-club-fe/browser with the vercel.json
// rewrites (SPA fallback for extension-less paths, /api proxied to LEGACY_API_ORIGIN) and the vercel.json response headers.
//   LEGACY_API_ORIGIN=https://localhost:9922 NODE_EXTRA_CA_CERTS=<mock cert> PORT=4200 node e2e/parity/legacy-server.mjs
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import path from 'node:path';

const root = path.resolve(process.env.LEGACY_DIST ?? 'dist/book-club-fe/browser');
const apiOrigin = new URL(process.env.LEGACY_API_ORIGIN ?? 'https://localhost:9922');
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const headerRules = config.headers.map((rule) => ({
  pattern: new RegExp(`^${rule.source.split('(.*)').map(escapeRegex).join('.*')}$`),
  headers: rule.headers,
}));
const hopByHop = new Set(['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'te', 'trailer']);
const forwardable = (headers) => Object.fromEntries(Object.entries(headers).filter(([name]) => !hopByHop.has(name) && !name.startsWith('proxy-')));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

function applyHeaders(res, pathname) {
  for (const rule of headerRules) if (rule.pattern.test(pathname)) for (const h of rule.headers) res.setHeader(h.key, h.value);
}

function proxy(req, res) {
  const send = apiOrigin.protocol === 'https:' ? httpsRequest : httpRequest;
  const upstream = send({ host: apiOrigin.hostname, port: apiOrigin.port, path: req.url, method: req.method, headers: { ...forwardable(req.headers), host: apiOrigin.host } }, (up) => {
    res.writeHead(up.statusCode ?? 502, forwardable(up.headers));
    up.pipe(res);
  });
  upstream.on('error', () => {
    if (res.headersSent) res.destroy();
    else {
      res.statusCode = 502;
      res.end();
    }
  });
  res.on('close', () => upstream.destroy());
  req.pipe(upstream);
}

function serve(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname.startsWith('/api/')) return proxy(req, res);
  let decoded;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    res.statusCode = 400;
    return void res.end();
  }
  let file = path.resolve(root, `.${decoded}`);
  const isFile = (file === root || file.startsWith(root + path.sep)) && existsSync(file) && statSync(file).isFile();
  if (!isFile) file = /\.[a-zA-Z0-9]+$/.test(decoded) ? '' : path.join(root, 'index.html');
  applyHeaders(res, url.pathname);
  if (!file) {
    res.statusCode = 404;
    return void res.end();
  }
  if (!res.hasHeader('content-type')) res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  try {
    serve(req, res);
  } catch {
    if (res.headersSent) res.destroy();
    else {
      res.statusCode = 500;
      res.end();
    }
  }
}).listen(Number(process.env.PORT ?? 4200), () => console.log('legacy server on', process.env.PORT ?? 4200));
