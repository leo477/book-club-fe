const PLURAL_SUFFIX = /^(.*)_(zero|one|two|few|many|other)$/;
const CATEGORY_ORDER = ['zero', 'one', 'two', 'few', 'many', 'other'];

export type Tree = { [key: string]: string | Tree };

export function flatten(obj: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') Object.assign(out, flatten(value, path));
    else out[path] = String(value);
  }
  return out;
}

function escapeIcu(text: string): string {
  return text.replace(/'/g, "''").replace(/[{}]/g, "'$&'");
}

// Escape literal text, keep `{{ name }}` placeholders as ICU `{name}` arguments.
export function toIcuBody(text: string): string {
  return text
    .split(/(\{\{\s*[\w.]+\s*\}\})/)
    .map((part, i) => (i % 2 ? `{${part.slice(2, -2).trim()}}` : escapeIcu(part)))
    .join('');
}

export function buildIcu(source: Tree, { pluralArg = 'count' } = {}) {
  const flat = flatten(source);
  const groups = new Map<string, Record<string, string>>();
  const messages: Record<string, string> = {};
  for (const [key, value] of Object.entries(flat)) {
    const m = PLURAL_SUFFIX.exec(key);
    if (m) {
      const [, base = '', category = ''] = m;
      const forms = groups.get(base) ?? {};
      forms[category] = value;
      groups.set(base, forms);
    } else {
      messages[key] = toIcuBody(value);
    }
  }
  for (const [base, forms] of groups) {
    const cases = { ...forms };
    // ICU requires `other`; source locales that omit it use `many` (or the last form) as the fallback.
    cases['other'] ??= cases['many'] ?? Object.values(forms).at(-1) ?? '';
    const body = CATEGORY_ORDER.filter((c) => c in cases)
      .map((c) => `${c} {${toIcuBody(cases[c] ?? '')}}`)
      .join(' ');
    messages[base] = `{${pluralArg}, plural, ${body}}`;
  }
  return { messages, sourceKeyCount: Object.keys(flat).length, pluralGroups: groups.size };
}
