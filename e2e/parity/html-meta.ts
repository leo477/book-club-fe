export interface SeoSnapshot {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  canonical: string;
  jsonLd: string[];
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(text: string): string {
  return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec, hex, name) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return NAMED_ENTITIES[String(name).toLowerCase()] ?? whole;
  });
}

const TAG = (name: string) => new RegExp(`<${name}\\b(?:"[^"]*"|'[^']*'|[^'">])*>`, 'gi');

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    out[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? '');
  }
  return out;
}

export function extractSeo(html: string): SeoSnapshot {
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html;
  const metas = [...head.matchAll(TAG('meta'))].map((m) => attrs(m[0]));
  const meta = (key: 'name' | 'property', value: string) =>
    metas.find((a) => a[key] === value)?.['content']?.trim() ?? '';
  const links = [...head.matchAll(TAG('link'))].map((m) => attrs(m[0]));
  const jsonLd = [...html.matchAll(/<script\b(?:"[^"]*"|'[^']*'|[^'">])*type\s*=\s*["']application\/ld\+json["'](?:"[^"]*"|'[^']*'|[^'">])*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1].trim(),
  );
  return {
    title: decodeEntities(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? ''),
    description: meta('name', 'description'),
    ogTitle: meta('property', 'og:title'),
    ogDescription: meta('property', 'og:description'),
    ogUrl: meta('property', 'og:url'),
    ogImage: meta('property', 'og:image'),
    canonical: links.find((a) => a['rel'] === 'canonical')?.['href']?.trim() ?? '',
    jsonLd,
  };
}

export const KNOWN_JSON_LD_TYPES = new Set([
  'Organization',
  'WebSite',
  'WebApplication',
  'WebPage',
  'CollectionPage',
  'ItemList',
  'BreadcrumbList',
  'Event',
  'Person',
  'Book',
  'ContactPage',
]);

function typesOf(node: unknown): string[] {
  if (!node || typeof node !== 'object') return [];
  const t = (node as { '@type'?: string | string[] })['@type'];
  return t === undefined ? [] : [t].flat();
}

export function jsonLdTypes(blocks: string[]): string[] {
  return blocks.map((b) => {
    let parsed: { '@context'?: unknown; '@graph'?: unknown[] };
    try {
      parsed = JSON.parse(b);
    } catch {
      return 'invalid-json';
    }
    const ctx = String(parsed['@context'] ?? '');
    if (!/^https?:\/\/schema\.org\/?$/.test(ctx)) return 'invalid-context';
    const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
    const types = nodes.flatMap(typesOf);
    if (!types.length) return 'unknown';
    return types.join('+');
  });
}

export function jsonLdProblems(types: string[]): string[] {
  if (!types.length) return ['no JSON-LD'];
  return types.flatMap((t) => {
    if (t === 'invalid-json' || t === 'invalid-context' || t === 'unknown') return [t];
    return t.split('+').filter((x) => !KNOWN_JSON_LD_TYPES.has(x)).map((x) => `unknown type ${x}`);
  });
}
