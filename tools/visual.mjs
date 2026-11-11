// Visual regression check of the built documentation site: screenshots before and after.
/* global document, window, localStorage, Image */
//
//   node tools/visual.mjs [distDir] --update     take the baseline (before a change)
//   node tools/visual.mjs [distDir]              take new screenshots and compare (after it)
//
//   [--only=/components/button,/examples/dashboard] [--preset=default,glass] [--theme=light|dark]
//   [--dir=.visual] [--tolerance=30] [--concurrency=4]
//
// Every prerendered route is captured in every style and both themes, with the clock, the
// animations and the motion preference pinned, so two runs of the same build are identical
// pixel for pixel. Rendering differs between machines, which is why nothing is committed:
// the baseline and the comparison are made on the same machine — yours, or one CI job that
// builds the base branch and the pull request side by side.
//
// A screenshot counts as changed when more than `tolerance` pixels differ. The report
// (<dir>/report/index.html) shows before, after and the difference for each of them.
import { Buffer } from 'node:buffer';
import { appendFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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
const root = resolve(typeof flags.dir === 'string' ? flags.dir : '.visual');
const baselineDir = join(root, 'baseline');
const currentDir = join(root, 'current');
const reportDir = join(root, 'report');
const update = Boolean(flags.update);
const tolerance = Number(flags.tolerance ?? 30);
const concurrency = Number(flags.concurrency ?? 4);
const presets =
  typeof flags.preset === 'string'
    ? flags.preset.split(',')
    : ['default', 'glass', 'tonal', 'crisp', 'soft'];
const themes = typeof flags.theme === 'string' ? [flags.theme] : ['light', 'dark'];

const manifest = JSON.parse(await readFile(join(distDir, 'prerendered-routes.json'), 'utf8'));
const only = typeof flags.only === 'string' ? flags.only.split(',') : null;
const routes = Object.keys(manifest.routes).filter((route) => !only || only.includes(route));

if (!update && !existsSync(baselineDir)) {
  console.error(
    'No baseline yet. Build the version you want to compare against and run\n' +
      '  pnpm check:visual --update\nthen make the change, build again and run pnpm check:visual.',
  );
  process.exit(2);
}

const fileOf = (route, preset, theme) =>
  `${route === '/' ? 'home' : route.slice(1).replace(/\//g, '.')}__${preset}__${theme}.png`;

const server = await serve(join(distDir, 'browser'));
const VIEWPORT = { width: 1280, height: 900 };
// Pages are born at this size: a page that starts smaller and is resized before loading
// can still answer a media query with the size it was born with
const browser = await puppeteer.launch({
  executablePath: chromePath,
  args: [...chromeArgs, `--window-size=${VIEWPORT.width},${VIEWPORT.height}`],
  defaultViewport: VIEWPORT,
});

/** Pins everything that moves on its own: the clock before the app boots, animations after. */
async function capture(route, preset, theme, file) {
  // A context of its own: tabs of one profile share localStorage, and a tab opened for
  // another style would change the style of this one while it is still starting up
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: theme },
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ]);
    await page.evaluateOnNewDocument((name) => {
      try {
        localStorage.setItem('kn-preset', name);
      } catch {
        /* storage is unavailable on about:blank */
      }
      // "Today" in calendars and relative dates must not depend on the day of the run
      const fixed = Date.UTC(2026, 5, 15, 9, 0, 0);
      const RealDate = Date;
      window.Date = class extends RealDate {
        constructor(...values) {
          if (values.length) super(...values);
          else super(fixed);
        }
        static now() {
          return fixed;
        }
      };
    }, preset);
    await page.goto(`http://localhost:${server.port}${route}`, { waitUntil: 'networkidle0' });
    // Every animation jumps to its last frame and stays there: entrances are complete,
    // spinners and shimmers stand still. Applies to whatever is rendered later, too.
    await page.addStyleTag({
      content: `*, *::before, *::after {
        animation-duration: 0.001s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        animation-fill-mode: forwards !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }`,
    });
    // Hydration and deferred rendering finish at their own pace: wait until the page has
    // looked the same for a few checks in a row
    const settle = () =>
      page.evaluate(async () => {
        await document.fonts.ready;
        // Angular removes its hydration marks as it takes the server markup over
        for (let i = 0; i < 60 && document.querySelector('[ngh]'); i++) {
          await new Promise((done) => setTimeout(done, 50));
        }
        const look = () =>
          `${document.documentElement.scrollHeight}:${document.body.innerHTML.length}:${document.getAnimations().length}`;
        let last = '';
        let same = 0;
        for (let i = 0; i < 40 && same < 4; i++) {
          await new Promise((done) => setTimeout(done, 80));
          const now = look();
          same = now === last ? same + 1 : 0;
          last = now;
        }
        return document.documentElement.scrollHeight;
      });
    // The whole page is brought into the viewport instead of being captured beyond it:
    // layers below the fold are not always painted in time for such a capture
    const height = await settle();
    await page.setViewport({ ...VIEWPORT, height: Math.max(VIEWPORT.height, height) });
    await settle();
    await page.screenshot({ path: file, captureBeyondViewport: false });
  } finally {
    await context.close();
  }
}

const outDir = update ? baselineDir : currentDir;
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const shots = [];
for (const route of routes) {
  for (const preset of presets) {
    for (const theme of themes)
      shots.push({ route, preset, theme, file: fileOf(route, preset, theme) });
  }
}

let comparer;
const changed = [];
try {
  let next = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < shots.length) {
        const shot = shots[next++];
        await capture(shot.route, shot.preset, shot.theme, join(outDir, shot.file));
      }
    }),
  );
  console.log(
    `captured ${shots.length} screenshots: ${routes.length} routes × ${presets.length} styles × ${themes.length} themes`,
  );

  if (!update) {
    await rm(reportDir, { recursive: true, force: true });
    await mkdir(reportDir, { recursive: true });
    comparer = await browser.newPage();
    for (const shot of shots) {
      const before = join(baselineDir, shot.file);
      if (!existsSync(before)) continue;
      const [a, b] = await Promise.all([readFile(before), readFile(join(currentDir, shot.file))]);
      if (a.equals(b)) continue;
      // Decoding and comparing happen in the browser: no image library to install
      const result = await comparer.evaluate(
        async (beforeUrl, afterUrl) => {
          const load = (url) =>
            new Promise((done, fail) => {
              const image = new Image();
              image.onload = () => done(image);
              image.onerror = fail;
              image.src = url;
            });
          const [first, second] = await Promise.all([load(beforeUrl), load(afterUrl)]);
          const width = Math.max(first.width, second.width);
          const height = Math.max(first.height, second.height);
          const pixels = (image) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.drawImage(image, 0, 0);
            return context.getImageData(0, 0, width, height);
          };
          const [x, y] = [pixels(first), pixels(second)];
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          const out = context.createImageData(width, height);
          let count = 0;
          for (let i = 0; i < x.data.length; i += 4) {
            const delta = Math.max(
              Math.abs(x.data[i] - y.data[i]),
              Math.abs(x.data[i + 1] - y.data[i + 1]),
              Math.abs(x.data[i + 2] - y.data[i + 2]),
              Math.abs(x.data[i + 3] - y.data[i + 3]),
            );
            if (delta > 16) {
              count++;
              out.data.set([226, 0, 116, 255], i);
            } else {
              // The unchanged page, washed out, so that the marks stand out
              const grey = (y.data[i] + y.data[i + 1] + y.data[i + 2]) / 3;
              out.data.set(
                [grey, grey, grey, 255].map((v, k) => (k < 3 ? 255 - (255 - v) * 0.25 : v)),
                i,
              );
            }
          }
          context.putImageData(out, 0, 0);
          return {
            count,
            resized: first.width !== second.width || first.height !== second.height,
            diff: canvas.toDataURL('image/png').split(',')[1],
          };
        },
        `data:image/png;base64,${a.toString('base64')}`,
        `data:image/png;base64,${b.toString('base64')}`,
      );
      if (result.count <= tolerance && !result.resized) continue;
      const name = shot.file.replace(/\.png$/, '');
      await writeFile(join(reportDir, `${name}.before.png`), a);
      await writeFile(join(reportDir, `${name}.after.png`), b);
      await writeFile(join(reportDir, `${name}.diff.png`), Buffer.from(result.diff, 'base64'));
      changed.push({ ...shot, name, count: result.count, resized: result.resized });
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (update) {
  console.log(`baseline saved to ${baselineDir}`);
  process.exit(0);
}

const baseline = new Set(await readdir(baselineDir));
const added = shots.filter((shot) => !baseline.has(shot.file)).map((shot) => shot.file);
const current = new Set(shots.map((shot) => shot.file));
// Only meaningful for a full run: a narrowed one leaves most of the baseline untouched
const removed =
  only || flags.preset || flags.theme ? [] : [...baseline].filter((file) => !current.has(file));

const escape = (text) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const report = `<!doctype html>
<html lang="en">
<meta charset="utf-8" />
<title>Kenny — visual changes</title>
<style>
  body { margin: 2rem; font: 15px/1.5 system-ui, sans-serif; color: #171a21; background: #f7f8fa; }
  h1 { font-size: 1.5rem; }
  h2 { margin-top: 2.5rem; font-size: 1rem; }
  .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; align-items: start; }
  figure { margin: 0; }
  figcaption { margin-bottom: 0.25rem; color: #5c6272; font-size: 0.8125rem; }
  img { max-width: 100%; border: 1px solid #dcdfe6; background: #fff; }
  code { font-size: 0.875em; }
</style>
<h1>${changed.length} of ${shots.length} screenshots changed</h1>
${added.length ? `<p>New, nothing to compare with: ${added.map((f) => `<code>${escape(f)}</code>`).join(', ')}</p>` : ''}
${removed.length ? `<p>In the baseline only: ${removed.map((f) => `<code>${escape(f)}</code>`).join(', ')}</p>` : ''}
${changed
  .map(
    (
      shot,
    ) => `<h2><code>${escape(shot.route)}</code> — ${shot.preset}, ${shot.theme}: ${shot.count} pixels${
      shot.resized ? ', size changed' : ''
    }</h2>
<div class="row">
  <figure><figcaption>Before</figcaption><img loading="lazy" src="${shot.name}.before.png" alt="" /></figure>
  <figure><figcaption>After</figcaption><img loading="lazy" src="${shot.name}.after.png" alt="" /></figure>
  <figure><figcaption>Difference</figcaption><img loading="lazy" src="${shot.name}.diff.png" alt="" /></figure>
</div>`,
  )
  .join('\n')}
</html>
`;
await writeFile(join(reportDir, 'index.html'), report);

// On GitHub the result is also written to the job summary
if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = changed.length
    ? [
        `### ${changed.length} of ${shots.length} screenshots changed`,
        '',
        '| Page | Style | Theme | Pixels |',
        '| --- | --- | --- | --- |',
        ...changed.map(
          (shot) =>
            `| \`${shot.route}\` | ${shot.preset} | ${shot.theme} | ${shot.count}${shot.resized ? ', size changed' : ''} |`,
        ),
        '',
        'Before, after and the difference are in the `visual-report` artifact of this run.',
      ]
    : [`### No visual changes in ${shots.length} screenshots`];
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}

if (added.length) console.log(`${added.length} new screenshot(s) have no baseline`);
if (removed.length) console.log(`${removed.length} screenshot(s) exist only in the baseline`);
if (changed.length) {
  // Grouped by page: one change usually shows in every style and theme of it
  const byRoute = new Map();
  for (const shot of changed) byRoute.set(shot.route, [...(byRoute.get(shot.route) ?? []), shot]);
  console.error(`\n${changed.length} of ${shots.length} screenshots changed:\n`);
  for (const [route, list] of byRoute) {
    const most = Math.max(...list.map((shot) => shot.count));
    console.error(`  ${route} — ${list.length} variant(s), up to ${most} pixels`);
  }
  console.error(`\nreport: ${join(reportDir, 'index.html')}`);
  console.error('If the change is intended, accept it: pnpm check:visual --update');
  process.exit(1);
}
console.log('no visual changes');
