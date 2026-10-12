// Local stand-in for Vercel Edge Config so `shell.chatWidget` can be switched on in `next dev` without touching app code.
// @vercel/edge-config accepts an "external" connection string (any URL with /ecfg_* and ?token=), so:
//   node e2e/parity/r12/edge-config-server.mjs &            (port 9944)
//   EDGE_CONFIG='http://localhost:9944/ecfg_parity?token=t' ... next dev
// Every manifest route goes to Next at 100 %; the flag is on for bucket < 50. Parity specs pin the bucket cookie (10 = on, 90 = off).
import { createServer } from 'node:http';

const routes = Object.fromEntries(
  ['/__strangler-probe', '/privacy', '/terms', '/clubs', '/clubs/:id', '/', '/events', '/events/:id', '/profile', '/support', '/support/new', '/clubs/create', '/clubs/:id/edit',
    '/clubs/:id/events/create', '/events/:id/edit', '/clubs/:id/manage', '/clubs/:id/randomizer', '/clubs/:id/quizzes', '/clubs/:id/quizzes/create', '/clubs/:id/quizzes/:quizId',
    '/clubs/:id/quizzes/:quizId/edit', '/clubs/:id/quizzes/:quizId/preview', '/clubs/:id/quizzes/:quizId/session', '/clubs/:id/quizzes/:quizId/leaderboard', '/chats', '/login',
    '/register', '/auth/callback'].map((p) => [p, { target: 'next', percent: 100 }]),
);
routes['shell.chatWidget'] = { target: 'next', percent: Number(process.env.CHAT_WIDGET_PERCENT ?? 50) };
const items = { strangler: { version: 1, enabled: true, routes } };

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  res.setHeader('content-type', 'application/json');
  if (url.pathname.endsWith('/items')) return void res.end(JSON.stringify(items));
  const m = url.pathname.match(/\/item\/([^/]+)$/);
  if (m) return void res.end(JSON.stringify(items[m[1]] ?? null));
  res.statusCode = 404;
  res.end('{}');
}).listen(Number(process.env.PORT ?? 9944), () => console.log('edge-config stub on', process.env.PORT ?? 9944));
