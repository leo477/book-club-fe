import { HttpResponse, http } from 'msw';
import { API, server, userJson } from '@/test/harness';

/** Routes the strangler serves from Next, so in-app navigation stays in the router. */
export const NEXT_ROUTES = ['/clubs', '/clubs/:id', '/events', '/events/:id', '/clubs/create', '/clubs/:id/edit', '/clubs/:id/events/create', '/events/:id/edit'];

export function mockSession(user: Record<string, unknown> | null) {
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: user !== null })),
    http.get(`${API}/auth/me`, () => (user ? HttpResponse.json(userJson(user)) : new HttpResponse(null, { status: 401 }))),
  );
}

/** Captures every JSON body sent with the given method to `path`, answering with `respond`. */
export function capture(method: 'post' | 'patch', path: string, respond: (body: unknown) => Response | Promise<Response>) {
  const bodies: unknown[] = [];
  server.use(
    http[method](`${API}${path}`, async ({ request }) => {
      const body: unknown = await request.json();
      bodies.push(body);
      return respond(body);
    }),
  );
  return bodies;
}
