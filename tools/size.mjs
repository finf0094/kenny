// Size budget of the library: every entry point, gzipped, against a recorded number.
//
//   node tools/size.mjs            compare dist/ui with tools/size-budget.json
//   node tools/size.mjs --update   record the current sizes as the new budget
//
// An application pays only for the entry points it imports, so each one is watched on its
// own. The check fails when an entry point grows by more than 10% (and at least 200 bytes)
// over its budget, or when a new one has no budget yet: growth has to be a decision that
// shows up in a diff, not something that happens on the side.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));
const bundles = join(root, 'dist/ui/fesm2022');
const budgetFile = join(root, 'tools/size-budget.json');
const update = process.argv.includes('--update');
const ALLOWED_GROWTH = 0.1;
const ALLOWED_BYTES = 200;

const sizes = {};
for (const file of (await readdir(bundles)).filter((name) => name.endsWith('.mjs')).sort()) {
  // kenny-ui-button.mjs → @kenny/ui/button
  const entry = file.replace(/^kenny-ui-?/, '').replace(/\.mjs$/, '');
  const name = entry ? `@kenny/ui/${entry}` : '@kenny/ui';
  sizes[name] = gzipSync(await readFile(join(bundles, file)), { level: 9 }).length;
}
const total = Object.values(sizes).reduce((sum, size) => sum + size, 0);
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

if (update) {
  await writeFile(budgetFile, `${JSON.stringify(sizes, null, 2)}\n`);
  console.log(`budget recorded: ${Object.keys(sizes).length} entry points, ${kb(total)} gzipped`);
  process.exit(0);
}

const budget = JSON.parse(await readFile(budgetFile, 'utf8'));
const problems = [];
for (const [name, size] of Object.entries(sizes)) {
  const allowed = budget[name];
  if (allowed === undefined) {
    problems.push(`${name}: ${kb(size)}, no budget yet`);
  } else if (size > allowed * (1 + ALLOWED_GROWTH) && size - allowed > ALLOWED_BYTES) {
    const growth = Math.round((size / allowed - 1) * 100);
    problems.push(`${name}: ${kb(size)}, budget ${kb(allowed)} (+${growth}%)`);
  }
}
for (const name of Object.keys(budget)) {
  if (!(name in sizes)) problems.push(`${name}: in the budget, but not built`);
}

const largest = Object.entries(sizes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([name, size]) => `${name} ${kb(size)}`)
  .join(', ');
console.log(`${Object.keys(sizes).length} entry points, ${kb(total)} gzipped in total`);
console.log(`largest: ${largest}`);

if (problems.length) {
  console.error(`\n${problems.length} entry point(s) over budget:\n\n  ${problems.join('\n  ')}`);
  console.error('\nIf the growth is intended, record it: pnpm check:size --update');
  process.exit(1);
}
console.log('every entry point is within its budget');
