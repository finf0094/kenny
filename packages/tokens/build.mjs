// Builds @kenny/tokens into dist/tokens:
//   tokens.css  — custom properties + keyframes
//   base.css    — optional page defaults and CDK overlay plumbing
//   kenny.css   — both, in one file
//   tokens.json — machine-readable list (name, value, group, comment) used by the docs
//   presets/*.css, presets.css — style presets, one per file and all together
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'src');
const out = join(here, '../../dist/tokens');
const groups = ['color', 'typography', 'layout', 'elevation', 'motion'];

/** Extracts `--kn-*` declarations from the first block that follows `selector` in a file. */
export function parseTokens(css, group, selector = ':root') {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`"${selector}" not found in the ${group} styles`);
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

/** Style presets, in the order the documentation lists them. */
export const presetNames = ['classic', 'tonal', 'crisp'];

/** Component-level variables a preset may set although they are not global tokens. */
const componentVariables = new Set(['--kn-tabs-thumb', '--kn-tooltip-bg', '--kn-tooltip-color']);

/**
 * Reads every preset: its description (the leading comment) and the tokens it overrides.
 * Fails on a name that is not a token — a typo in a preset would otherwise do nothing, silently.
 */
export async function readPresets() {
  const known = new Set((await readAllTokens()).map((token) => token.name));
  const presets = [];
  for (const name of presetNames) {
    const css = await readFile(join(src, 'presets', `${name}.css`), 'utf8');
    const tokens = parseTokens(css, name, `[data-kn-preset='${name}']`);
    const unknown = tokens
      .map((token) => token.name)
      .filter((token) => !known.has(token) && !componentVariables.has(token));
    if (unknown.length) {
      throw new Error(`Preset "${name}" sets unknown tokens: ${unknown.join(', ')}`);
    }
    presets.push({ name, css, tokens });
  }
  return presets;
}

/**
 * The default style as a preset: restores every token that some preset overrides, so that
 * `data-kn-preset="glass"` works on a block nested inside another preset.
 */
export async function glassPresetCss() {
  const base = new Map((await readAllTokens()).map((token) => [token.name, token.value]));
  const overridden = new Set(
    (await readPresets()).flatMap((preset) => preset.tokens.map((token) => token.name)),
  );
  // Source order of the base tokens first, component variables last
  const names = [
    ...[...base.keys()].filter((name) => overridden.has(name)),
    ...[...overridden].filter((name) => !base.has(name)),
  ];
  const lines = names.map((name) => `  ${name}: ${base.get(name) ?? 'initial'};`);
  return [
    '/*',
    ' * Kenny style preset — Glass (the default).',
    ' *',
    ' * Generated from the base tokens. Needed only to return to the default style inside a',
    ' * block that sits within another preset; on <html> the attribute changes nothing.',
    ' */',
    "[data-kn-preset='glass'] {",
    ...lines,
    '}',
    '',
  ].join('\n');
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
  const presets = await readPresets();
  await mkdir(join(out, 'presets'), { recursive: true });
  const glass = await glassPresetCss();
  await writeFile(join(out, 'presets', 'glass.css'), glass);
  for (const preset of presets) {
    await writeFile(join(out, 'presets', `${preset.name}.css`), preset.css);
  }
  await writeFile(
    join(out, 'presets.css'),
    [glass, ...presets.map((preset) => preset.css)].join('\n'),
  );
  const pkg = JSON.parse(await readFile(join(here, 'package.json'), 'utf8'));
  await writeFile(join(out, 'package.json'), JSON.stringify(pkg, null, 2));
  await copyFile(join(here, 'README.md'), join(out, 'README.md'));
  await copyFile(join(here, '../../LICENSE'), join(out, 'LICENSE'));
  console.log(`@kenny/tokens → ${out}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
