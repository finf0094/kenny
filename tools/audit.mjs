// Accessibility and runtime audit of the built documentation site.
/* global document, window, getComputedStyle, localStorage, MutationObserver */
//
//   node tools/audit.mjs [distDir] [--only=/components/button,/docs/tokens] [--theme=light|dark]
//                        [--preset=default,glass,tonal,crisp,soft] [--concurrency=4] [--no-rtl]
//
// Opens every prerendered route in headless Chrome, in every style preset and both themes,
// and fails on:
//   - any axe-core violation of WCAG 2.1 A/AA (colour contrast included: this is a real browser);
//   - any console error or uncaught exception;
//   - horizontal overflow of the page at a phone-sized viewport.
// Then repeats the pass right-to-left (first style, light theme): the same checks, plus
// overflow at desktop width — a mirrored layout breaks in places a narrow one does not.
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
const rtl = !flags['no-rtl'];

const server = await serve(join(distDir, 'browser'));
const browser = await puppeteer.launch({ executablePath: chromePath, args: chromeArgs });
const problems = [];
let checked = 0;

async function open(route, theme, preset, width, height, dir = 'ltr') {
  // A context of its own: tabs of one profile share localStorage, and a tab opened for
  // another style would change the style of this one while it is still starting up
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
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
  if (dir === 'rtl') {
    // Set the direction before the app boots, as a real right-to-left page would have it
    await page.evaluateOnNewDocument(() => {
      const observer = new MutationObserver(() => {
        if (!document.documentElement) return;
        document.documentElement.dir = 'rtl';
        observer.disconnect();
      });
      observer.observe(document, { childList: true });
    });
  }
  const errors = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://localhost:${server.port}${route}`, { waitUntil: 'networkidle0' });
  return { page, errors, close: () => context.close() };
}

async function auditRender(route, theme, preset, dir = 'ltr') {
  const where = `${route} [${preset}, ${theme}${dir === 'rtl' ? ', rtl' : ''}]`;
  const { page, errors, close } = await open(route, theme, preset, 1280, 900, dir);
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
    await close();
  }
}

/** The page itself must not scroll sideways: at a phone width, and mirrored at any width. */
async function auditOverflow(route, preset, width = 375, dir = 'ltr') {
  const where = `${route} [${preset}, ${width}px${dir === 'rtl' ? ', rtl' : ''}]`;
  const { page, errors, close } = await open(route, 'light', preset, width, 800, dir);
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
        // Left-to-right content sticks out on the right, mirrored content on the left
        const inside = rect.right <= width + 1 && rect.left >= -1;
        if (rect.width === 0 || inside || clipped(el)) continue;
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
    await close();
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
if (rtl) {
  for (const route of routes) {
    jobs.push(() => auditRender(route, 'light', presets[0], 'rtl'));
    jobs.push(() => auditOverflow(route, presets[0], 375, 'rtl'));
    jobs.push(() => auditOverflow(route, presets[0], 1280, 'rtl'));
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
  `audited ${routes.length} routes × ${presets.length} styles × ${themes.length} themes` +
    `${rtl ? ', and right-to-left' : ''}: ${checked} renders`,
);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n\n${problems.join('\n\n')}`);
  process.exit(1);
}
console.log('no accessibility violations, console errors or overflow');
