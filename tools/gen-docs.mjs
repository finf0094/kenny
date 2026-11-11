// Generates documentation data from the real sources, so the docs can never drift:
//
//   packages/ui/<entry>/*.ts            → API tables (inputs, models, outputs, methods, CSS variables)
//   apps/docs/src/app/demos/<entry>/*   → demo source code, highlighted at build time
//   packages/tokens/src/*.css           → token reference
//   packages/tokens/src/presets/*.css   → what each style preset changes
//   all demos                           → registry for the playground app
//
// Output: apps/docs/src/generated/*.ts and apps/playground/src/generated/demos.ts
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { createCssVariablesTheme, createHighlighter } from 'shiki';
import { allPresetsCss, readAllTokens, readPresets } from '../packages/tokens/build.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const uiRoot = join(root, 'packages/ui');
const demosRoot = join(root, 'apps/docs/src/app/demos');
const outDocs = join(root, 'apps/docs/src/generated');
const outPlayground = join(root, 'apps/playground/src/generated');

const CVA_METHODS = new Set([
  'writeValue',
  'registerOnChange',
  'registerOnTouched',
  'setDisabledState',
]);

/* ------------------------------------------------------------------ API */

function jsdoc(node) {
  const doc = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1);
  if (!doc) return '';
  const text =
    typeof doc.comment === 'string'
      ? doc.comment
      : (doc.comment?.map((c) => c.text).join('') ?? '');
  return text.replace(/\s*\n\s*/g, ' ').trim();
}

function decorator(node, names) {
  for (const d of ts.getDecorators(node) ?? []) {
    const e = d.expression;
    if (
      ts.isCallExpression(e) &&
      ts.isIdentifier(e.expression) &&
      names.includes(e.expression.text)
    ) {
      return { name: e.expression.text, arg: e.arguments[0] };
    }
  }
  return null;
}

function objectProp(obj, key, sf) {
  if (!obj || !ts.isObjectLiteralExpression(obj)) return undefined;
  for (const prop of obj.properties) {
    if (ts.isPropertyAssignment(prop) && prop.name.getText(sf) === key) return prop.initializer;
    if (ts.isShorthandPropertyAssignment(prop) && prop.name.text === key) return prop.name;
  }
  return undefined;
}

function literalType(node) {
  if (!node) return 'unknown';
  if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword)
    return 'boolean';
  if (ts.isStringLiteralLike(node)) return 'string';
  if (ts.isNumericLiteral(node) || ts.isPrefixUnaryExpression(node)) return 'number';
  if (node.kind === ts.SyntaxKind.NullKeyword) return 'null';
  return 'unknown';
}

function isHidden(member) {
  if (member.name && ts.isPrivateIdentifier(member.name)) return true;
  return (ts.getModifiers(member) ?? []).some(
    (m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword,
  );
}

function parseSignalMember(member, sf) {
  if (!ts.isPropertyDeclaration(member) || !member.initializer || isHidden(member)) return null;
  const init = member.initializer;
  if (!ts.isCallExpression(init)) return null;
  let callee = init.expression;
  let required = false;
  if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'required') {
    required = true;
    callee = callee.expression;
  }
  if (!ts.isIdentifier(callee) || !['input', 'model', 'output'].includes(callee.text)) return null;
  const kind = callee.text;
  const args = init.arguments;
  const options = kind === 'output' || required ? args[0] : args[1];
  const alias = objectProp(options, 'alias', sf);
  const transform = objectProp(options, 'transform', sf)?.getText(sf);
  const typeArg = init.typeArguments?.[0]?.getText(sf);
  const type =
    typeArg ??
    (transform === 'booleanAttribute'
      ? 'boolean'
      : transform === 'numberAttribute'
        ? 'number'
        : kind === 'output'
          ? 'void'
          : literalType(args[0]));
  const result = {
    name: alias && ts.isStringLiteralLike(alias) ? alias.text : member.name.getText(sf),
    kind,
    type: type.replace(/\s+/g, ' '),
    description: jsdoc(member),
  };
  if (required) result.required = true;
  else if (kind !== 'output' && args[0]) {
    const text = args[0].getText(sf).replace(/\s+/g, ' ');
    // Defaults that an application can change with provideKnDefaults()
    const configurable =
      /^knDefaults\([^)]*\)\.\w+ \?\? (.+)$/.exec(text)?.[1] ??
      (/^knDefaultSize\(/.test(text) ? "'md'" : null);
    result.default = configurable ?? text;
    if (configurable) result.configurable = true;
  }
  return result;
}

function parseMethod(member, sf) {
  if (!ts.isMethodDeclaration(member) || isHidden(member)) return null;
  const name = member.name.getText(sf);
  const description = jsdoc(member);
  if (!description || description.startsWith('@internal')) return null;
  if (CVA_METHODS.has(name) || name.startsWith('ng')) return null;
  const params = member.parameters.map((p) => p.getText(sf)).join(', ');
  const returns = member.type ? member.type.getText(sf) : 'void';
  return {
    name,
    kind: 'method',
    type: `(${params}) => ${returns}`.replace(/\s+/g, ' '),
    description,
  };
}

/** Documented public state that is neither an input nor an output: signals, observables. */
function parseProperty(member, sf) {
  if (!ts.isPropertyDeclaration(member) || isHidden(member)) return null;
  const description = jsdoc(member);
  if (!description || description.startsWith('@internal')) return null;
  const init = member.initializer;
  let type = member.type?.getText(sf);
  if (!type && init && ts.isCallExpression(init) && ts.isIdentifier(init.expression)) {
    const fn = init.expression.text;
    if (fn === 'signal' || fn === 'computed' || fn === 'linkedSignal') {
      const arg = init.typeArguments?.[0]?.getText(sf);
      type = arg
        ? `Signal<${arg}>`
        : fn === 'signal'
          ? `Signal<${literalType(init.arguments[0])}>`
          : 'Signal';
    }
  }
  if (!type) type = 'Signal';
  return {
    name: member.name.getText(sf),
    kind: 'property',
    type: type.replace(/\s+/g, ' '),
    description,
  };
}

function parseFile(file, text, classes, aliases) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      aliases.set(node.name.text, node.type.getText(sf).replace(/\s+/g, ' '));
    }
    if (ts.isClassDeclaration(node) && node.name) {
      const dec = decorator(node, ['Component', 'Directive', 'Injectable']);
      const exported = (ts.getModifiers(node) ?? []).some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      );
      const base = node.heritageClauses
        ?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)
        ?.types[0]?.expression.getText(sf);
      const members = [];
      for (const member of node.members) {
        const parsed =
          parseSignalMember(member, sf) ?? parseMethod(member, sf) ?? parseProperty(member, sf);
        if (parsed) members.push(parsed);
      }
      const selector = objectProp(dec?.arg, 'selector', sf);
      // Parts: the class names in the template are the hooks for styling from outside
      let template = objectProp(dec?.arg, 'template', sf);
      // `template,` — a constant shared by several components of the file
      if (template && ts.isIdentifier(template)) {
        const name = template.text;
        template = undefined;
        ts.forEachChild(sf, (statement) => {
          if (!ts.isVariableStatement(statement)) return;
          for (const declaration of statement.declarationList.declarations) {
            if (declaration.name.getText(sf) === name) template = declaration.initializer;
          }
        });
      }
      const parts = [];
      if (template && ts.isStringLiteralLike(template)) {
        for (const match of template.text.matchAll(/\sclass="([^"]+)"/g)) {
          for (const name of match[1].split(/\s+/)) {
            if (name && !name.startsWith('kn-') && !parts.includes(name)) parts.push(name);
          }
        }
      }
      classes.set(node.name.text, {
        name: node.name.text,
        kind: dec ? (dec.name === 'Injectable' ? 'service' : dec.name.toLowerCase()) : 'class',
        selector: selector && ts.isStringLiteralLike(selector) ? selector.text : undefined,
        description: jsdoc(node),
        members,
        parts,
        base,
        exported,
        file,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

/** Finds `var(--kn-<component>-*, fallback)` usages: these are the public CSS variables. */
function parseCssVars(text) {
  const vars = new Map();
  const re = /var\(\s*(--kn-[a-z0-9-]+)\s*,/g;
  for (let m; (m = re.exec(text));) {
    let depth = 1;
    let i = re.lastIndex;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') depth--;
    }
    const fallback = text
      .slice(re.lastIndex, i - 1)
      .replace(/\s+/g, ' ')
      .trim();
    if (!vars.has(m[1])) vars.set(m[1], fallback);
  }
  return [...vars].map(([name, fallback]) => ({ name, fallback }));
}

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.ts') && !e.name.endsWith('.spec.ts'))
    .map((e) => join(dir, e.name));
}

async function collectApi() {
  const classes = new Map();
  const aliases = new Map();
  const cssVars = new Map();
  const entries = (await readdir(uiRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && existsSync(join(uiRoot, d.name, 'index.ts')))
    .map((d) => d.name);
  for (const entry of entries) {
    const vars = [];
    for (const file of await sourceFiles(join(uiRoot, entry))) {
      const text = await readFile(file, 'utf8');
      parseFile(relative(uiRoot, file), text, classes, aliases);
      vars.push(...parseCssVars(text));
    }
    cssVars.set(entry, vars);
  }

  const expand = (type) => {
    const alias = aliases.get(type);
    return alias && alias.length <= 140 && /['|]/.test(alias) ? alias : type;
  };
  const withBase = (cls) => {
    const members = [...cls.members];
    let base = cls.base && classes.get(cls.base);
    while (base) {
      for (const m of base.members) if (!members.some((x) => x.name === m.name)) members.push(m);
      base = base.base && classes.get(base.base);
    }
    return members.map((m) => ({ ...m, type: expand(m.type) }));
  };

  const api = new Map();
  for (const entry of entries) {
    const list = [...classes.values()]
      .filter((c) => c.file.startsWith(`${entry}/`) && c.exported)
      .filter((c) => !c.description.startsWith('@internal'))
      .filter((c) =>
        c.kind === 'service' || c.kind === 'class' ? c.members.length > 0 : c.selector,
      )
      .map((c) => ({
        name: c.name,
        kind: c.kind,
        selector: c.selector,
        description: c.description,
        members: withBase(c),
        parts: c.parts?.length ? c.parts : undefined,
      }));
    api.set(entry, { classes: list, cssVars: cssVars.get(entry) ?? [] });
  }
  return api;
}

/* ---------------------------------------------------------------- Demos */

async function collectDemos(highlighter) {
  const demos = new Map();
  if (!existsSync(demosRoot)) return demos;
  for (const dir of await readdir(demosRoot, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const sources = {};
    for (const file of (await readdir(join(demosRoot, dir.name))).sort()) {
      if (!file.endsWith('.demo.ts')) continue;
      const code = (await readFile(join(demosRoot, dir.name, file), 'utf8')).trimEnd();
      sources[file.replace('.demo.ts', '')] = {
        file,
        code,
        html: highlighter.codeToHtml(code, { lang: 'angular-ts', theme: 'kenny' }),
      };
    }
    demos.set(dir.name, sources);
  }
  return demos;
}

/* -------------------------------------------------------------- Snippets */

const SNIPPET_LANGS = {
  ts: 'angular-ts',
  html: 'angular-html',
  css: 'css',
  sh: 'bash',
  json: 'json',
};

/** Guide pages show code from apps/docs/src/app/snippets — real files, highlighted here. */
async function collectSnippets(highlighter) {
  const dir = join(root, 'apps/docs/src/app/snippets');
  const snippets = {};
  if (!existsSync(dir)) return snippets;
  for (const file of (await readdir(dir)).sort()) {
    const ext = file.split('.').pop();
    const lang = SNIPPET_LANGS[ext];
    if (!lang) continue;
    const code = (await readFile(join(dir, file), 'utf8')).trimEnd();
    snippets[file] = { file, code, html: highlighter.codeToHtml(code, { lang, theme: 'kenny' }) };
  }
  return snippets;
}

/* ----------------------------------------------------------------- Main */

const banner = '// GENERATED by tools/gen-docs.mjs — do not edit.\n/* eslint-disable */\n';

async function main() {
  const theme = createCssVariablesTheme({
    name: 'kenny',
    variablePrefix: '--code-',
    fontStyle: true,
  });
  const highlighter = await createHighlighter({
    themes: [theme],
    langs: ['angular-ts', 'angular-html', 'css', 'bash', 'json'],
  });

  const [api, demos, tokens, snippets] = await Promise.all([
    collectApi(),
    collectDemos(highlighter),
    readAllTokens(),
    collectSnippets(highlighter),
  ]);

  await rm(outDocs, { recursive: true, force: true });
  await mkdir(outDocs, { recursive: true });
  await mkdir(outPlayground, { recursive: true });

  for (const entry of new Set([...api.keys(), ...demos.keys()])) {
    const data = {
      api: api.get(entry) ?? { classes: [], cssVars: [] },
      sources: demos.get(entry) ?? {},
    };
    await writeFile(
      join(outDocs, `${entry}.ts`),
      `${banner}import type { EntryData } from '../app/core/doc-types';\n\nexport const data: EntryData = ${JSON.stringify(data, null, 2)};\n`,
    );
  }

  await writeFile(
    join(outDocs, 'tokens.ts'),
    `${banner}import type { TokenDoc } from '../app/core/doc-types';\n\nexport const tokens: TokenDoc[] = ${JSON.stringify(tokens, null, 2)};\n`,
  );

  // Style presets: the final stylesheet (with the "default" reset) and a table of what each changes
  const presets = await readPresets();
  await writeFile(join(outDocs, 'presets.css'), await allPresetsCss());
  const base = new Map(tokens.map((token) => [token.name, token]));
  const changed = [...new Set(presets.flatMap((preset) => preset.tokens.map((t) => t.name)))];
  const presetRows = [
    ...tokens.map((token) => token.name).filter((name) => changed.includes(name)),
    ...changed.filter((name) => !base.has(name)),
  ].map((name) => ({
    name,
    group: base.get(name)?.group ?? 'component',
    values: {
      default: base.get(name)?.value ?? null,
      ...Object.fromEntries(
        presets.map((preset) => [
          preset.name,
          preset.tokens.find((token) => token.name === name)?.value ?? null,
        ]),
      ),
    },
  }));
  await writeFile(
    join(outDocs, 'presets.ts'),
    `${banner}import type { PresetTokenRow } from '../app/core/doc-types';\n\nexport const presetRows: PresetTokenRow[] = ${JSON.stringify(presetRows, null, 2)};\n`,
  );

  await writeFile(
    join(outDocs, 'snippets.ts'),
    `${banner}import type { DemoSource } from '../app/core/doc-types';\n\nexport const snippets: Record<string, DemoSource> = ${JSON.stringify(snippets, null, 2)};\n`,
  );

  const registry = [...demos]
    .flatMap(([entry, sources]) => Object.keys(sources).map((name) => `${entry}/${name}`))
    .sort()
    .map(
      (id) =>
        `  { id: '${id}', load: () => import('../../../docs/src/app/demos/${id}.demo').then((m) => m.default) },`,
    )
    .join('\n');
  await writeFile(
    join(outPlayground, 'demos.ts'),
    `${banner}import type { Type } from '@angular/core';\n\nexport const demos: { id: string; load: () => Promise<Type<unknown>> }[] = [\n${registry}\n];\n`,
  );

  highlighter.dispose();
  console.log(
    `docs data: ${api.size} entry points, ${[...demos.values()].reduce((n, d) => n + Object.keys(d).length, 0)} demos, ${tokens.length} tokens`,
  );
}

await main();
