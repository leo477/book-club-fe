import { parse, TYPE, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';

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

function ngxBody(elements: MessageFormatElement[]): string {
  return elements
    .map((el) => {
      if (el.type === TYPE.literal) return el.value;
      if (el.type === TYPE.argument) return `{{ ${el.value} }}`;
      throw new Error(`unsupported ICU element type ${el.type}`);
    })
    .join('');
}

// Inverse of buildIcu for the ngx-translate JSON the Angular app loads until R14: nested keys, `_<category>` plural suffixes.
export function toNgx(messages: Record<string, string>): Tree {
  const tree: Tree = {};
  const put = (key: string, value: string) => {
    const path = key.split('.');
    const leaf = path.pop() as string;
    let node = tree;
    for (const part of path) {
      const next = (node[part] ??= {});
      if (typeof next === 'string') throw new Error(`key ${key} collides with ${part}`);
      node = next;
    }
    if (leaf in node) throw new Error(`duplicate key ${key}`);
    node[leaf] = value;
  };
  for (const [key, message] of Object.entries(messages)) {
    const ast = parse(message);
    const [first] = ast;
    if (ast.length === 1 && first?.type === TYPE.plural) {
      for (const [category, option] of Object.entries(first.options)) put(`${key}_${category}`, ngxBody(option.value));
    } else put(key, ngxBody(ast));
  }
  return tree;
}
