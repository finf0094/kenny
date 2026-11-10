// Builds @kenny/tokens into dist/tokens:
//   tokens.css  — custom properties + keyframes
//   base.css    — optional page defaults and CDK overlay plumbing
//   kenny.css   — both, in one file
//   tokens.json — machine-readable list (name, value, group, comment) used by the docs
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'src');
const out = join(here, '../../dist/tokens');
const groups = ['color', 'typography', 'layout', 'elevation', 'motion'];

/** Extracts `--kn-*` declarations from the first `:root { … }` block of a file. */
export function parseTokens(css, group) {
  const start = css.indexOf(':root');
  const open = css.indexOf('{', start);
  let depth = 1;
  let i = open + 1;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
  }
  const body = css.slice(open + 1, i - 1);
  const tokens = [];
  const re = /(--kn-[\w-]+)\s*:\s*([^;]+);(?:[ \t]*\/\*([^*]*)\*\/)?/g;
  for (let m; (m = re.exec(body));) {
    tokens.push({
      name: m[1],
      value: m[2].replace(/\s+/g, ' ').trim(),
      group,
      comment: m[3]?.trim() ?? '',
    });
  }
  return tokens;
}

export async function readAllTokens() {
  const all = [];
  for (const group of groups) {
    all.push(...parseTokens(await readFile(join(src, `${group}.css`), 'utf8'), group));
  }
  return all;
}

async function main() {
  await mkdir(out, { recursive: true });
  const parts = await Promise.all(groups.map((g) => readFile(join(src, `${g}.css`), 'utf8')));
  const tokensCss = parts.join('\n');
  const baseCss = await readFile(join(src, 'base.css'), 'utf8');
  await writeFile(join(out, 'tokens.css'), tokensCss);
  await writeFile(join(out, 'base.css'), baseCss);
  await writeFile(join(out, 'kenny.css'), `${tokensCss}\n${baseCss}`);
  await writeFile(join(out, 'tokens.json'), JSON.stringify(await readAllTokens(), null, 2));
  const pkg = JSON.parse(await readFile(join(here, 'package.json'), 'utf8'));
  await writeFile(join(out, 'package.json'), JSON.stringify(pkg, null, 2));
  await copyFile(join(here, 'README.md'), join(out, 'README.md'));
  await copyFile(join(here, '../../LICENSE'), join(out, 'LICENSE'));
  console.log(`@kenny/tokens → ${out}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
