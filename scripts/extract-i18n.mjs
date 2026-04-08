/**
 * Extracts translation keys from Angular templates and TypeScript files.
 * Scans for:
 *   - '{{ "KEY" | translate }}' and '[attr]="\'KEY\' | translate"' in HTML
 *   - translate.instant('KEY') and translate.get('KEY') in TS
 *
 * Merges keys into existing JSON files, preserving existing values.
 * New keys get an empty string value (to be filled in manually).
 * Use --clean flag to remove keys no longer found in source.
 *
 * Usage: node scripts/extract-i18n.mjs [--clean]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const CLEAN = process.argv.includes('--clean');
const SRC_DIR = './src';
const OUTPUT_FILES = ['./public/i18n/uk.json', './public/i18n/en.json'];

// Patterns to extract keys from templates and TS files
const PATTERNS = [
  /'([\w]+\.[\w.]+)'\s*\|\s*translate/g,
  /"([\w]+\.[\w.]+)"\s*\|\s*translate/g,
  /translate\.instant\(['"`]([\w]+\.[\w.]+)['"`]\)/g,
  /translate\.get\(['"`]([\w]+\.[\w.]+)['"`]\)/g,
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

function toNested(keys) {
  const result = {};
  for (const key of [...keys].sort()) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    const leaf = parts[parts.length - 1];
    if (current[leaf] === undefined) {
      current[leaf] = '';
    }
  }
  return result;
}

function mergeDeep(existing, extracted) {
  const result = {};
  for (const [key, val] of Object.entries(extracted)) {
    if (typeof val === 'object') {
      result[key] = mergeDeep(existing[key] ?? {}, val);
    } else {
      result[key] = existing[key] !== undefined ? existing[key] : '';
    }
  }
  if (!CLEAN) {
    for (const [key, val] of Object.entries(existing)) {
      if (result[key] === undefined) {
        result[key] = val;
      }
    }
  }
  return result;
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

const extractedNested = toNested(allKeys);

for (const outputPath of OUTPUT_FILES) {
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(outputPath, 'utf8'));
  } catch {
    console.warn(`  Could not read ${outputPath}, creating fresh.`);
  }

  const merged = mergeDeep(existing, extractedNested);
  writeFileSync(outputPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log(`  ✅ Updated ${outputPath}${CLEAN ? ' (cleaned)' : ''}`);
}
