const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

export interface StranglerRoute {
  readonly pattern: string;
  readonly regex: RegExp;
  readonly owner: 'next';
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** `:id` matches a UUID only, so a literal sibling such as `/clubs/create` never matches `/clubs/:id`. */
export function compilePattern(pattern: string): RegExp {
  const body = pattern
    .split('/')
    .filter(Boolean)
    .map((segment) => (segment === ':id' ? UUID : segment.startsWith(':') ? '[^/]+' : escape(segment)))
    .join('/');
  return new RegExp(`^/${body}/?$`);
}

export function defineRoutes(patterns: readonly string[]): readonly StranglerRoute[] {
  return patterns.map((pattern) => ({ pattern, regex: compilePattern(pattern), owner: 'next' as const }));
}

export function matchRoute(pathname: string, routes: readonly StranglerRoute[] = manifest): StranglerRoute | null {
  return routes.find((route) => route.regex.test(pathname)) ?? null;
}

export const manifest: readonly StranglerRoute[] = defineRoutes(['/__strangler-probe', '/privacy', '/terms']);
