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
const headerRules = config.headers.map((rule) => ({ pattern: new RegExp(`^${rule.source.replace('(.*)', '.*')}$`), headers: rule.headers }));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

function applyHeaders(res, pathname) {
  for (const rule of headerRules) if (rule.pattern.test(pathname)) for (const h of rule.headers) res.setHeader(h.key, h.value);
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const send = apiOrigin.protocol === 'https:' ? httpsRequest : httpRequest;
    const upstream = send({ host: apiOrigin.hostname, port: apiOrigin.port, path: req.url, method: req.method, headers: { ...req.headers, host: apiOrigin.host } }, (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    });
    upstream.on('error', () => {
      res.statusCode = 502;
      res.end();
    });
    return void req.pipe(upstream);
  }
  let file = path.join(root, decodeURIComponent(url.pathname));
  const isFile = file.startsWith(root) && existsSync(file) && statSync(file).isFile();
  if (!isFile) file = /\.[a-zA-Z0-9]+$/.test(url.pathname) ? '' : path.join(root, 'index.html');
  applyHeaders(res, url.pathname);
  if (!file) {
    res.statusCode = 404;
    return void res.end();
  }
  res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT ?? 4200), () => console.log('legacy server on', process.env.PORT ?? 4200));
