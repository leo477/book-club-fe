const LOCALES: Record<string, string> = { uk: 'uk-UA', en: 'en-US' };

/** Fixed zone: server and browser must render the same text, or hydration of event dates would mismatch. */
const TIME_ZONE = 'Europe/Kyiv';

export function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(LOCALES[locale] ?? 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: TIME_ZONE });
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const [first, second] = parts;
  return first && second ? ((first[0] ?? '') + (second[0] ?? '')).toUpperCase() : name.slice(0, 2).toUpperCase();
}
