import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { stderr } from 'node:process';
import { fileURLToPath } from 'node:url';
import { applyOverrides, buildIcu } from './icu.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = (locale) => resolve(root, '../../public/i18n', `${locale}.json`);
const overridesFile = (locale) => resolve(root, 'overrides', `${locale}.json`);
const out = resolve(root, 'dist');
mkdirSync(out, { recursive: true });

for (const locale of ['en', 'uk']) {
  const { merged, redundant } = applyOverrides(
    JSON.parse(readFileSync(source(locale), 'utf8')),
    JSON.parse(readFileSync(overridesFile(locale), 'utf8')),
  );
  if (redundant.length) stderr.write(`[i18n] ${locale}: source now defines ${redundant.join(', ')}; remove them from overrides/${locale}.json\n`);
  const { messages } = buildIcu(merged);
  writeFileSync(resolve(out, `${locale}.icu.json`), `${JSON.stringify(messages, null, 2)}\n`);
}
