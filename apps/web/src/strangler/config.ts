export const BUCKET_COOKIE = 'bc_bucket';
export const BUCKET_HEADER = 'x-bc-bucket';
export const BUCKET_MAX_AGE = 60 * 60 * 24 * 30;
export const EDGE_CONFIG_KEY = 'strangler';
export const EDGE_CONFIG_TIMEOUT_MS = 50;

export interface RouteFlag {
  target: 'next' | 'legacy';
  percent: number;
}

export interface StranglerConfig {
  version: number;
  enabled: boolean;
  routes: Readonly<Record<string, RouteFlag>>;
}

export type Decision = 'next' | 'legacy';

export function parseConfig(raw: unknown): StranglerConfig | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { version, enabled, routes } = raw as Record<string, unknown>;
  if (typeof routes !== 'object' || routes === null) return null;
  const parsed: Record<string, RouteFlag> = {};
  for (const [pattern, flag] of Object.entries(routes)) {
    if (typeof flag !== 'object' || flag === null) continue;
    const { target, percent } = flag as Record<string, unknown>;
    if ((target === 'next' || target === 'legacy') && typeof percent === 'number' && Number.isFinite(percent)) {
      parsed[pattern] = { target, percent };
    }
  }
  return {
    version: typeof version === 'number' ? version : 0,
    enabled: enabled === true,
    routes: parsed,
  };
}

export function validBucket(value: string | undefined | null): number | null {
  if (value === undefined || value === null || !/^\d{1,2}$/.test(value)) return null;
  return Number(value);
}

export function newBucket(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]! % 100;
}

/** Fail-safe is legacy: anything other than an explicit, enabled, in-bucket `next` flag goes to Angular. */
export function decide(config: StranglerConfig | null, pattern: string, bucket: number): Decision {
  if (!config?.enabled) return 'legacy';
  const flag = config.routes[pattern];
  if (flag?.target !== 'next') return 'legacy';
  return bucket < flag.percent ? 'next' : 'legacy';
}

export async function loadConfig(read: (key: string) => Promise<unknown>): Promise<StranglerConfig | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), EDGE_CONFIG_TIMEOUT_MS);
  });
  try {
    return parseConfig(await Promise.race([read(EDGE_CONFIG_KEY), timeout]));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface StranglerState {
  version: number;
  routes: { pattern: string; enabled: boolean }[];
}

export function computeState(
  config: StranglerConfig | null,
  bucket: number,
  patterns: readonly string[],
): StranglerState {
  return {
    version: config?.version ?? 0,
    routes: patterns.map((pattern) => ({ pattern, enabled: decide(config, pattern, bucket) === 'next' })),
  };
}
