import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIcu } from './icu.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = (locale) => resolve(root, '../../public/i18n', `${locale}.json`);
const out = resolve(root, 'dist');
mkdirSync(out, { recursive: true });

for (const locale of ['en', 'uk']) {
  const { messages } = buildIcu(JSON.parse(readFileSync(source(locale), 'utf8')));
  writeFileSync(resolve(out, `${locale}.icu.json`), `${JSON.stringify(messages, null, 2)}\n`);
}
