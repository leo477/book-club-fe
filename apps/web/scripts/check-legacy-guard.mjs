/**
 * Asserts that the production-promotion guard (LEGACY_FALLBACK_DISABLED_AT_BUILD, see src/proxy.ts) is baked into the built server code
 * exactly when the build was made with DISABLE_LEGACY_FALLBACK. The minifier drops the guard's branch when the inlined marker is empty.
 *
 * Usage: node scripts/check-legacy-guard.mjs present|absent [serverDir]
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const NEEDLE = 'LEGACY_FALLBACK_DISABLED_AT_BUILD: this deployment';

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(full);
    else if (full.endsWith('.js')) yield full;
  }
}

export function guardBaked(serverDir) {
  for (const file of files(serverDir)) if (readFileSync(file, 'utf8').includes(NEEDLE)) return true;
  return false;
}

const [expectation, dir = '.next/server'] = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}`) {
  if (expectation !== 'present' && expectation !== 'absent') throw new Error('usage: check-legacy-guard.mjs present|absent [serverDir]');
  const baked = guardBaked(dir);
  if (baked !== (expectation === 'present')) {
    console.error(`legacy guard is ${baked ? 'present' : 'absent'} in ${dir}, expected ${expectation}`);
    process.exit(1);
  }
  console.log(`legacy guard ${expectation} in ${dir}, as expected`);
}
