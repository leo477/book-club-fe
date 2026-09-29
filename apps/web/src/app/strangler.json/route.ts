import { NextResponse, type NextRequest } from 'next/server';
import { BUCKET_COOKIE, BUCKET_MAX_AGE, newBucket, validBucket } from '@/strangler/config';
import { readState } from '@/strangler/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const existing = validBucket(request.cookies.get(BUCKET_COOKIE)?.value);
  const bucket = existing ?? newBucket();
  const response = NextResponse.json(await readState(bucket), {
    headers: { 'Cache-Control': 'private, max-age=30', Vary: 'Cookie' },
  });
  if (existing === null) {
    response.cookies.set(BUCKET_COOKIE, String(bucket), {
      maxAge: BUCKET_MAX_AGE,
      sameSite: 'lax',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
  return response;
}
