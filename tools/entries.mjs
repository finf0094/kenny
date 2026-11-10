// Ensures every folder in packages/ui that has an index.ts is a secondary entry point.
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../packages/ui/', import.meta.url));
for (const dir of readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name === 'src' || dir.name === 'testing') continue;
  const index = join(root, dir.name, 'index.ts');
  const config = join(root, dir.name, 'ng-package.json');
  if (existsSync(index) && !existsSync(config)) {
    writeFileSync(config, JSON.stringify({ lib: { entryFile: 'index.ts' } }, null, 2) + '\n');
    console.log('entry point:', dir.name);
  }
}
