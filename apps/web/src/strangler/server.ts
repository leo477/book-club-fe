import 'server-only';
import { headers } from 'next/headers';
import { BUCKET_COOKIE, BUCKET_HEADER, computeState, validBucket, type StranglerState } from './config';
import { readStranglerConfig } from './edge-config';
import { manifest } from './routes';

/** `flags` are extra keys evaluated like routes (see flags.ts); they are not in the manifest and never reach /strangler.json. */
export async function readState(bucket: number, flags: readonly string[] = []): Promise<StranglerState> {
  return computeState(await readStranglerConfig(), bucket, [...manifest.map((route) => route.pattern), ...flags]);
}

export async function requestBucket(): Promise<number | null> {
  const h = await headers();
  const forwarded = validBucket(h.get(BUCKET_HEADER));
  if (forwarded !== null) return forwarded;
  const cookie = h.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${BUCKET_COOKIE}=(\\d{1,2})(?:;|$)`));
  return validBucket(cookie?.[1]);
}
