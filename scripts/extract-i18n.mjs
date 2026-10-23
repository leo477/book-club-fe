/**
 * Extracts translation keys from Angular templates and TypeScript files (src/) and adds the ones
 * missing from packages/i18n/locales/{uk,en}.json with an empty value, to be filled in manually.
 * Existing values are never touched. There is no --clean: the locale files are shared with apps/web,
 * and this scan only sees the Angular app, so it cannot tell which keys are unused.
 *
 * Usage: node scripts/extract-i18n.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

if (process.argv.includes('--clean')) {
  console.error('--clean is not supported: the locale files are shared with apps/web (SCRUM-74).');
  process.exit(1);
}

const SRC_DIR = './src';
const OUTPUT_FILES = ['./packages/i18n/locales/uk.json', './packages/i18n/locales/en.json'];

// Patterns to extract keys from templates and TS files
const PATTERNS = [
  /'(\w+\.\w[\w.]+)'\s*\|\s*translate/g,
  /"(\w+\.\w[\w.]+)"\s*\|\s*translate/g,
  /translate\.instant\(['"`](\w+\.\w[\w.]+)['"`]\)/g,
  /translate\.get\(['"`](\w+\.\w[\w.]+)['"`]\)/g,
];

function collectFiles(dir, extensions = ['.html', '.ts']) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full, extensions));
    } else if (extensions.includes(extname(full)) && !entry.endsWith('.spec.ts')) {
      results.push(full);
    }
  }
  return results;
}

function extractKeys(content) {
  const keys = new Set();
  for (const pattern of PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return keys;
}

const files = collectFiles(SRC_DIR);
const allKeys = new Set();

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const key of extractKeys(content)) {
    allKeys.add(key);
  }
}

console.log(`Found ${allKeys.size} translation keys in ${files.length} files.`);

for (const outputPath of OUTPUT_FILES) {
  const messages = JSON.parse(readFileSync(outputPath, 'utf8'));
  const base = (key) => key.replace(/_(zero|one|two|few|many|other)$/, '');
  const added = [...allKeys].filter((key) => !(key in messages) && !(base(key) in messages)).sort();
  for (const key of added) messages[key] = '';
  writeFileSync(outputPath, JSON.stringify(messages, null, 2) + '\n', 'utf8');
  console.log(`  Updated ${outputPath} (${added.length} added)`);
}
