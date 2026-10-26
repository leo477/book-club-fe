import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toNgx } from './icu.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, '../../public/i18n');
mkdirSync(out, { recursive: true });

for (const locale of ['en', 'uk']) {
  const messages = JSON.parse(readFileSync(resolve(root, 'locales', `${locale}.json`), 'utf8'));
  writeFileSync(resolve(out, `${locale}.json`), `${JSON.stringify(toNgx(messages), null, 2)}\n`);
}
