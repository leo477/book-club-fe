const LOCALES: Record<string, string> = { uk: 'uk-UA', en: 'en-US' };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Today and yesterday get a word, older messages a short date; the time is 24h in the viewer's own zone. */
export function formatChatTimestamp(
  value: Date | string | null | undefined,
  locale: string,
  words: { today: string; yesterday: string },
  now: Date = new Date(),
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const day = startOfDay(date).getTime();
  const today = startOfDay(now);
  if (day === today.getTime()) return `${words.today} ${time}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (day === yesterday.getTime()) return `${words.yesterday} ${time}`;

  const shortDate = date.toLocaleDateString(LOCALES[locale] ?? 'en-US', { day: 'numeric', month: 'short' });
  return `${shortDate} ${time}`;
}
