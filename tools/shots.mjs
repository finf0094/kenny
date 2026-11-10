// Visual check helper: serves a built app and takes screenshots with headless Chrome.
/* global document, MutationObserver */
//
//   node tools/shots.mjs <distDir> <path> [<path> …] [--theme=dark] [--width=1280]
//                        [--height=800] [--full] [--out=tools/shots] [--wait=400]
//                        [--click=<selector>] [--press=<Key>] [--name=<file>] [--dir=rtl]
//
// CHROME_PATH overrides the browser binary (default: /usr/bin/google-chrome).
import { mkdir } from 'node:fs/promises';
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
const [distDir, ...paths] = args.filter((a) => !a.startsWith('--'));
const out = resolve(flags.out ?? 'tools/shots');

const server = await serve(distDir);
const port = server.port;
const browser = await puppeteer.launch({ executablePath: chromePath, args: chromeArgs });
await mkdir(out, { recursive: true });
const errors = [];
try {
  for (const path of paths) {
    const page = await browser.newPage();
    await page.setViewport({
      width: Number(flags.width ?? 1280),
      height: Number(flags.height ?? 800),
      deviceScaleFactor: Number(flags.scale ?? 1),
    });
    page.on('console', (m) => m.type() === 'error' && errors.push(`${path}: ${m.text()}`));
    page.on('pageerror', (e) => errors.push(`${path}: ${e.message}`));
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: flags.theme === 'dark' ? 'dark' : 'light' },
    ]);
    if (flags.dir) {
      // Set the direction before the app boots, as a real RTL page would have it
      await page.evaluateOnNewDocument((dir) => {
        const observer = new MutationObserver(() => {
          if (!document.documentElement) return;
          document.documentElement.dir = dir;
          observer.disconnect();
        });
        observer.observe(document, { childList: true });
      }, flags.dir);
    }
    await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle0' });
    if (flags.theme) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), flags.theme);
    }
    if (flags.click) {
      for (const selector of String(flags.click).split(';;')) {
        await page.click(selector);
        await new Promise((r) => setTimeout(r, 350));
      }
    }
    if (flags.press) {
      for (const key of String(flags.press).split(',')) {
        if (key.includes('+')) {
          const [mod, k] = key.split('+');
          await page.keyboard.down(mod);
          await page.keyboard.press(k);
          await page.keyboard.up(mod);
        } else {
          await page.keyboard.press(key);
        }
        await new Promise((r) => setTimeout(r, 120));
      }
    }
    await new Promise((r) => setTimeout(r, Number(flags.wait ?? 400)));
    const name =
      flags.name ?? ((path.replace(/[^\w]+/g, '_').replace(/^_|_$/g, '') || 'home') + (flags.theme ? `.${flags.theme}` : ''));
    await page.screenshot({ path: join(out, `${name}.png`), fullPage: Boolean(flags.full) });
    console.log('shot', join(out, `${name}.png`));
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (errors.length) {
  console.log('console errors:\n' + [...new Set(errors)].join('\n'));
}
