// Tiny static server for a built app: used by the screenshot and audit tools.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

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

/**
 * Serves `distDir` on a free port with SPA fallback.
 * @returns {Promise<{ port: number, close: () => void }>}
 */
export async function serve(distDir) {
  const root = resolve(distDir);

  async function resolveFile(urlPath) {
    const clean = decodeURIComponent(urlPath.split('?')[0]);
    for (const candidate of [clean, join(clean, 'index.html'), 'index.html', 'index.csr.html']) {
      const file = join(root, candidate);
      // Never serve anything outside the dist folder
      if (!file.startsWith(root)) continue;
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
  await new Promise((done) => server.listen(0, done));
  return { port: server.address().port, close: () => server.close() };
}

export const chromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
export const chromeArgs = ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'];
