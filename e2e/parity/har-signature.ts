// Pure request-signature and diff helpers shared by har-diff.ts (node) and the Playwright specs (no import.meta here).
const VALUE_KEYS = new Set(['limit', 'offset', 'page', 'page_size', 'sort', 'order', 'q', 'search']);
const IGNORED_PATH = /^\/(_next|_vercel|@vite|@fs|__vite)(\/|$)/;
const STATIC_EXT = /\.(js|mjs|css|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|json5?|txt|xml|webmanifest)$/i;

export interface HarEntry {
  request: { method: string; url: string; postData?: { text?: string; mimeType?: string } };
}

export function normalizePath(p: string): string {
  return p
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, ':ts')
    .replace(/(?<=\/)[0-9a-f]{16,}(?=\/|$)/gi, ':hash')
    .replace(/(?<=\/)\d{6,}(?=\/|$)/g, ':n');
}

export function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.length ? [shape(value[0])] : [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, shape(v)]),
    );
  }
  return value === null ? 'null' : typeof value;
}

function bodyShape(post: HarEntry['request']['postData']): string {
  if (!post?.text) return '-';
  try {
    return JSON.stringify(shape(JSON.parse(post.text)));
  } catch {
    const keys = [...new URLSearchParams(post.text).keys()].sort();
    return keys.length ? `form:${keys.join(',')}` : 'raw';
  }
}

export function signatures(entries: HarEntry[], selfOrigin: string): string[] {
  const out: string[] = [];
  for (const { request } of entries) {
    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol)) continue;
    const self = url.origin === selfOrigin;
    if (self && IGNORED_PATH.test(url.pathname)) continue;
    if (request.method === 'GET' && STATIC_EXT.test(url.pathname)) continue;
    const keys = [...new Set(url.searchParams.keys())]
      .sort()
      .map((k) => (VALUE_KEYS.has(k) ? `${k}=${url.searchParams.getAll(k).sort().join('|')}` : k))
      .join(',');
    out.push(
      `${request.method} ${self ? 'self' : url.host} ${normalizePath(url.pathname)}?${keys} body=${bodyShape(request.postData)}`,
    );
  }
  return out;
}

function count(list: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of list) m.set(s, (m.get(s) ?? 0) + 1);
  return m;
}

export interface AllowEntry {
  signature: string;
  reason: string;
  legacy?: number;
  next?: number;
}

export function diff(legacy: string[], next: string[], allowed: AllowEntry[] = [], stale: string[] = []): string[] {
  const a = count(legacy);
  const b = count(next);
  const rules = new Map(allowed.map((e) => [e.signature, e]));
  const matched = new Set<string>();
  const problems: string[] = [];
  for (const sig of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(sig) ?? 0;
    const y = b.get(sig) ?? 0;
    const rule = rules.get(sig);
    if (rule) {
      matched.add(sig);
      const legacyOk = rule.legacy === undefined || rule.legacy === x;
      const nextOk = rule.next === undefined || rule.next === y;
      if (legacyOk && nextOk) continue;
      problems.push(`${sig}  legacy=${x} next=${y}  (allowlist expects legacy=${rule.legacy ?? '*'} next=${rule.next ?? '*'})`);
      continue;
    }
    if (x !== y) problems.push(`${sig}  legacy=${x} next=${y}`);
  }
  for (const e of allowed) if (!matched.has(e.signature)) stale.push(e.signature);
  return problems.sort();
}

