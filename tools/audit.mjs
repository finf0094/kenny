// Accessibility and runtime audit of the built documentation site.
/* global document, window, getComputedStyle, localStorage */
//
//   node tools/audit.mjs [distDir] [--only=/components/button,/docs/tokens] [--theme=light|dark]
//                        [--preset=default,glass,tonal,crisp,soft] [--concurrency=4]
//
// Opens every prerendered route in headless Chrome, in every style preset and both themes,
// and fails on:
//   - any axe-core violation of WCAG 2.1 A/AA (colour contrast included: this is a real browser);
//   - any console error or uncaught exception;
//   - horizontal overflow of the page at a phone-sized viewport.
// CHROME_PATH overrides the browser binary.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeArgs, chromePath, serve } from './serve.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.slice(2).split(/=(.*)/s);
      return [k, v ?? true];
    }),
);
const distDir = resolve(args.find((a) => !a.startsWith('--')) ?? 'dist/docs');
const manifest = JSON.parse(await readFile(join(distDir, 'prerendered-routes.json'), 'utf8'));
const only = typeof flags.only === 'string' ? flags.only.split(',') : null;
const routes = Object.keys(manifest.routes).filter((route) => !only || only.includes(route));
const themes = typeof flags.theme === 'string' ? [flags.theme] : ['light', 'dark'];
const axeSource = await readFile(
  createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
  'utf8',
);

const presets =
  typeof flags.preset === 'string'
    ? flags.preset.split(',')
    : ['default', 'glass', 'tonal', 'crisp', 'soft'];
const concurrency = Number(flags.concurrency ?? 4);

const server = await serve(join(distDir, 'browser'));
const browser = await puppeteer.launch({ executablePath: chromePath, args: chromeArgs });
const problems = [];
let checked = 0;

async function open(route, theme, preset, width, height) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: theme },
    // Entrance animations would be caught mid-flight and reported as low contrast
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  // The site restores the style preset from storage before first paint
  await page.evaluateOnNewDocument((name) => {
    try {
      localStorage.setItem('kn-preset', name);
    } catch {
      /* storage is unavailable on about:blank */
    }
  }, preset);
  const errors = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://localhost:${server.port}${route}`, { waitUntil: 'networkidle0' });
  return { page, errors };
}

async function auditRender(route, theme, preset) {
  const where = `${route} [${preset}, ${theme}]`;
  const { page, errors } = await open(route, theme, preset, 1280, 900);
  try {
    await page.evaluate(axeSource);
    const result = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
      }),
    );
    for (const violation of result.violations) {
      const nodes = violation.nodes
        .slice(0, 4)
        .map(
          (node) =>
            `      ${node.target.join(' ')}\n        ${node.failureSummary?.split('\n').slice(1, 2).join(' ').trim()}`,
        );
      problems.push(
        `${where} ${violation.id} (${violation.impact}), ${violation.nodes.length} node(s)\n${nodes.join('\n')}`,
      );
    }
    for (const error of new Set(errors)) problems.push(`${where} console: ${error}`);
    checked++;
  } finally {
    await page.close();
  }
}

/** Narrow viewport: the page itself must not scroll sideways. */
async function auditOverflow(route, preset) {
  const where = `${route} [${preset}, 375px]`;
  const { page, errors } = await open(route, 'light', preset, 375, 800);
  try {
    const overflow = await page.evaluate(() => {
      const width = window.innerWidth;
      const amount = document.documentElement.scrollWidth - width;
      if (amount <= 1) return null;
      // Report the outermost elements that stick out and are not clipped by a scrolling ancestor
      const clipped = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (getComputedStyle(p).overflowX !== 'visible') return true;
        }
        return false;
      };
      const culprits = [];
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.right <= width + 1 || clipped(el)) continue;
        if (culprits.some((c) => c.el.contains(el))) continue;
        culprits.push({
          el,
          text: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(
            el.className.baseVal ?? el.className,
          )
            .trim()
            .replace(/\s+/g, '.')} (${Math.round(rect.width)}px wide)`,
        });
      }
      return { amount, culprits: culprits.slice(0, 3).map((c) => c.text) };
    });
    if (overflow) {
      problems.push(
        `${where} page overflows horizontally by ${overflow.amount}px\n      ${overflow.culprits.join('\n      ')}`,
      );
    }
    for (const error of new Set(errors)) problems.push(`${where} console: ${error}`);
  } finally {
    await page.close();
  }
}

// Every route in every style and theme, plus the phone width per style
const jobs = [];
for (const preset of presets) {
  for (const route of routes) {
    for (const theme of themes) jobs.push(() => auditRender(route, theme, preset));
    jobs.push(() => auditOverflow(route, preset));
  }
}

try {
  let next = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < jobs.length) await jobs[next++]();
    }),
  );
} finally {
  await browser.close();
  server.close();
}

console.log(
  `audited ${routes.length} routes × ${presets.length} styles × ${themes.length} themes: ${checked} renders`,
);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n\n${problems.join('\n\n')}`);
  process.exit(1);
}
console.log('no accessibility violations, console errors or overflow');
