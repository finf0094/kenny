// Builds @kenny/tokens into dist/tokens:
//   tokens.css  — custom properties + keyframes
//   base.css    — optional page defaults and CDK overlay plumbing
//   kenny.css   — both, in one file
//   tokens.json — machine-readable list (name, value, group, comment) used by the docs
//   presets/*.css, presets.css — style presets, one per file and all together
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
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
  await checkTempo(all);
  return all;
}

/**
 * `[data-kn-tempo]` repeats every token computed from the tempo, so that a block can have
 * its own. The copy is written by hand, in the same file; this keeps it honest.
 */
async function checkTempo(base) {
  const css = await readFile(join(src, 'motion.css'), 'utf8');
  const copy = new Map(
    parseTokens(css, 'motion', '[data-kn-tempo]').map((token) => [token.name, token.value]),
  );
  const expected = base.filter((token) => token.value.includes('var(--kn-duration-scale)'));
  const drift = expected.filter((token) => copy.get(token.name) !== token.value);
  if (drift.length || copy.size !== expected.length) {
    throw new Error(
      `[data-kn-tempo] in motion.css is out of step with :root: ${
        drift.map((token) => token.name).join(', ') || 'it declares tokens that :root does not'
      }`,
    );
  }
}

/** Style presets, in the order the documentation lists them. */
export const presetNames = ['glass', 'tonal', 'crisp', 'soft'];

const uiRoot = join(here, '../ui');

/**
 * Variables that components read with a fallback (`var(--kn-switch-width, 2.625rem)`).
 * They are not tokens — nothing declares them by default — but a preset may set them.
 */
async function componentVariables() {
  const names = new Set();
  const visit = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
        const text = await readFile(path, 'utf8');
        for (const match of text.matchAll(/var\(\s*(--kn-[a-z0-9-]+)\s*,/g)) names.add(match[1]);
      }
    }
  };
  await visit(uiRoot);
  return names;
}

const references = (value) => [...value.matchAll(/var\(\s*(--kn-[\w-]+)/g)].map((m) => m[1]);

/**
 * Default tokens that are computed from tokens a preset changes, e.g. `--kn-elevation-card`
 * from `--kn-surface-rim`. A custom property is evaluated where it is declared, so a preset
 * applied to a block (not to <html>) would inherit them already computed from the old values.
 * They are re-declared inside the preset to be evaluated again in its scope.
 */
export function derivedTokens(overridden, base) {
  const affected = new Set(overridden);
  const derived = new Set();
  for (let changed = true; changed;) {
    changed = false;
    for (const token of base) {
      if (affected.has(token.name)) continue;
      if (references(token.value).some((name) => affected.has(name))) {
        affected.add(token.name);
        derived.add(token.name);
        changed = true;
      }
    }
  }
  return base.filter((token) => derived.has(token.name));
}

/**
 * Reads every preset: the tokens it overrides and its final CSS (the source plus the
 * re-evaluated derived tokens). Fails on a name that is neither a token nor a component
 * variable — a typo in a preset would otherwise do nothing, silently.
 */
export async function readPresets() {
  const base = await readAllTokens();
  const known = new Set(base.map((token) => token.name));
  const variables = await componentVariables();
  const presets = [];
  for (const name of presetNames) {
    const source = await readFile(join(src, 'presets', `${name}.css`), 'utf8');
    const tokens = parseTokens(source, name, `[data-kn-preset='${name}']`);
    const unknown = tokens
      .map((token) => token.name)
      .filter((token) => !known.has(token) && !variables.has(token));
    if (unknown.length) {
      throw new Error(`Preset "${name}" sets unknown tokens: ${unknown.join(', ')}`);
    }
    const derived = derivedTokens(
      tokens.map((token) => token.name),
      base,
    );
    const end = source.lastIndexOf('}');
    const css = derived.length
      ? `${source.slice(0, end)}\n  /* Default tokens computed from the values above: evaluated again in this scope */\n${derived
          .map((token) => `  ${token.name}: ${token.value};`)
          .join('\n')}\n}\n`
      : source;
    presets.push({ name, css, tokens, derived: derived.map((token) => token.name) });
  }
  return presets;
}

/**
 * The default style as a preset: restores every token that some preset changes, so that
 * `data-kn-preset="default"` works on a block nested inside another preset.
 */
export async function defaultPresetCss() {
  const base = await readAllTokens();
  const values = new Map(base.map((token) => [token.name, token.value]));
  const presets = await readPresets();
  const touched = new Set(
    presets.flatMap((preset) => [...preset.tokens.map((token) => token.name), ...preset.derived]),
  );
  // Source order of the base tokens first, component variables last
  const names = [
    ...[...values.keys()].filter((name) => touched.has(name)),
    ...[...touched].filter((name) => !values.has(name)),
  ];
  const lines = names.map((name) => `  ${name}: ${values.get(name) ?? 'initial'};`);
  return [
    '/*',
    ' * Kenny style preset — Default.',
    ' *',
    ' * Generated from the base tokens. Needed only to return to the default style inside a',
    ' * block that sits within another preset; on <html> the attribute changes nothing.',
    ' */',
    "[data-kn-preset='default'] {",
    ...lines,
    '}',
    '',
  ].join('\n');
}

/** Every preset, the default one first, as one stylesheet. */
export async function allPresetsCss() {
  const presets = await readPresets();
  return [await defaultPresetCss(), ...presets.map((preset) => preset.css)].join('\n');
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
  await rm(join(out, 'presets'), { recursive: true, force: true });
  await mkdir(join(out, 'presets'), { recursive: true });
  await writeFile(join(out, 'presets', 'default.css'), await defaultPresetCss());
  for (const preset of presets) {
    await writeFile(join(out, 'presets', `${preset.name}.css`), preset.css);
  }
  await writeFile(join(out, 'presets.css'), await allPresetsCss());
  const pkg = JSON.parse(await readFile(join(here, 'package.json'), 'utf8'));
  await writeFile(join(out, 'package.json'), JSON.stringify(pkg, null, 2));
  await copyFile(join(here, 'README.md'), join(out, 'README.md'));
  await copyFile(join(here, '../../LICENSE'), join(out, 'LICENSE'));
  console.log(`@kenny/tokens → ${out}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
