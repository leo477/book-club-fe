import { z } from 'zod';

/**
 * Response-side enum: the backend declares these fields as plain `str`, so an unknown string falls back
 * instead of failing the whole payload. Missing or non-string values still fail.
 */
export const tolerantEnum = <const T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) =>
  z.string().transform((v): T[number] => ((values as readonly string[]).includes(v) ? v : fallback));
