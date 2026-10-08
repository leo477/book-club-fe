import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

// Not under /api: that prefix is rewritten to the backend. The leading underscore is encoded in the folder name
// (%5Finternal) because a literal `_internal` folder is a private folder, not a route.
const HEADERS = { 'Cache-Control': 'private, no-store' } as const;
const MAX_TAGS = 20;
const MAX_BODY_BYTES = 2048;
const TAG = /^(clubs|club:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const digest = (value: string) => createHash('sha256').update(value).digest();

function authorized(request: Request, secret: string): boolean {
  const given = request.headers.get('x-revalidate-secret');
  return given !== null && timingSafeEqual(digest(given), digest(secret));
}

const reply = (status: number, body: Record<string, unknown> = {}) => NextResponse.json(body, { status, headers: HEADERS });

/** Backend hook: `POST {"tags":["clubs","club:<uuid>"]}` with `X-Revalidate-Secret`; expires those tags' data-cache entries now. */
export async function POST(request: Request) {
  const secret = process.env['REVALIDATE_SECRET'];
  if (!secret) return reply(503, { error: 'disabled' });
  if (!authorized(request, secret)) return reply(401, { error: 'unauthorized' });

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return reply(413, { error: 'too_large' });
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return reply(413, { error: 'too_large' });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: 'invalid_json' });
  }
  const tags = typeof body === 'object' && body !== null ? (body as { tags?: unknown }).tags : undefined;
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS || !tags.every((t): t is string => typeof t === 'string' && TAG.test(t))) {
    return reply(400, { error: 'invalid_tags' });
  }

  const unique = [...new Set(tags.map((t) => t.toLowerCase()))];
  for (const tag of unique) revalidateTag(tag, { expire: 0 });
  return reply(200, { revalidated: unique });
}
