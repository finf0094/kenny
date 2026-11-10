// Visual check helper: serves a built app and takes screenshots with headless Chrome.
//
//   node tools/shots.mjs <distDir> <path> [<path> …] [--theme=dark] [--width=1280]
//                        [--height=800] [--full] [--out=tools/shots] [--wait=400]
//                        [--click=<selector>] [--press=<Key>] [--name=<file>]
//
// CHROME_PATH overrides the browser binary (default: /usr/bin/google-chrome).
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.slice(2).split(/=(.*)/s);
    return [k, v ?? true];
  }),
);
const [distDir, ...paths] = args.filter((a) => !a.startsWith('--'));
const out = resolve(flags.out ?? 'tools/shots');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  for (const candidate of [clean, join(clean, 'index.html'), 'index.html', 'index.csr.html']) {
    const file = join(resolve(distDir), candidate);
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      /* try next */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? '/');
  if (!file) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'],
});
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
