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

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? '';
  }
  return out;
}

export function extractSeo(html: string): SeoSnapshot {
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html;
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const meta = (key: 'name' | 'property', value: string) =>
    metas.find((a) => a[key] === value)?.['content']?.trim() ?? '';
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const jsonLd = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1].trim(),
  );
  return {
    title: head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? '',
    description: meta('name', 'description'),
    ogTitle: meta('property', 'og:title'),
    ogDescription: meta('property', 'og:description'),
    ogUrl: meta('property', 'og:url'),
    ogImage: meta('property', 'og:image'),
    canonical: links.find((a) => a['rel'] === 'canonical')?.['href']?.trim() ?? '',
    jsonLd,
  };
}

export function jsonLdTypes(blocks: string[]): string[] {
  return blocks.map((b) => {
    try {
      const parsed = JSON.parse(b) as { '@type'?: string | string[] };
      return [parsed['@type'] ?? 'unknown'].flat().join('+');
    } catch {
      return 'invalid-json';
    }
  });
}
