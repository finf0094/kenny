// Non-text contrast of controls (WCAG 2.1 SC 1.4.11) in the built documentation site.
/* global document, getComputedStyle, localStorage */
//
//   node tools/contrast.mjs [distDir] [--preset=default,glass] [--theme=light|dark] [--min=3]
//
// axe-core checks the contrast of text, not of the edges that make a control recognisable:
// the outline of a field, the box of an unchecked checkbox, the track of a switch that is
// off. This tool measures them in a real browser, in every style and both themes, and fails
// when the strongest cue a control has is weaker than 3:1 against what is around it.
//
// A cue is whichever of these is present: an outline, an underline, or the fill itself.
// Translucent layers are composited over the page colour; a wallpaper behind a glass
// surface is not taken into account.
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
const presets =
  typeof flags.preset === 'string'
    ? flags.preset.split(',')
    : ['default', 'glass', 'tonal', 'crisp', 'soft'];
const themes = typeof flags.theme === 'string' ? [flags.theme] : ['light', 'dark'];
const minimum = Number(flags.min ?? 3);

/** What is measured: a resting, enabled control in the first demo that has one. */
const probes = [
  { name: 'Input', route: '/components/input', selector: 'input.kn-control:not(:disabled)' },
  { name: 'Textarea', route: '/components/textarea', selector: 'textarea.kn-control' },
  { name: 'Select', route: '/components/select', selector: 'kn-select .kn-control' },
  { name: 'Combobox', route: '/components/combobox', selector: 'kn-combobox .kn-control' },
  { name: 'Date picker', route: '/components/date-picker', selector: 'kn-date-picker .kn-control' },
  {
    name: 'Number input',
    route: '/components/number-input',
    selector: 'kn-number-input .kn-control',
  },
  {
    name: 'Checkbox',
    route: '/components/checkbox',
    selector:
      'kn-checkbox:has(input:not(:checked):not(:indeterminate):not(:disabled)):not(:has([aria-invalid])) .box',
  },
  {
    name: 'Radio',
    route: '/components/radio',
    selector: 'kn-radio:has(input:not(:checked):not(:disabled)) .circle',
  },
  {
    name: 'Switch',
    route: '/components/switch',
    selector: 'kn-switch:has(input:not(:checked):not(:disabled)) .track',
  },
];

const server = await serve(join(distDir, 'browser'));
const browser = await puppeteer.launch({ executablePath: chromePath, args: chromeArgs });

/** Runs in the page: the contrast of each visual cue of the element against its surroundings. */
function measure(selector) {
  const element = document.querySelector(selector);
  if (!element) return null;
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  // The canvas understands every colour syntax the browser does: rgb(), color(), oklab()
  const rgba = (css) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000';
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const over = (top, bottom) => [
    ...[0, 1, 2].map((i) => top[i] * top[3] + bottom[i] * (1 - top[3])),
    1,
  ];
  const luminance = ([r, g, b]) => {
    const channel = (value) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const ratio = (a, b) => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (high + 0.05) / (low + 0.05);
  };
  /** Every background colour from the page down to `node`, flattened into one. */
  const backdrop = (node) => {
    const layers = [];
    for (let parent = node; parent; parent = parent.parentElement) {
      const color = rgba(getComputedStyle(parent).backgroundColor);
      if (color[3] > 0) layers.push(color);
      if (color[3] > 0.999) break;
    }
    return layers.reverse().reduce((below, layer) => over(layer, below), [255, 255, 255, 1]);
  };
  /** `box-shadow` as a list of { color, x, y, blur, spread, inset }. */
  const shadows = (value) => {
    if (!value || value === 'none') return [];
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === '(') depth++;
      else if (value[i] === ')') depth--;
      else if (value[i] === ',' && depth === 0) {
        parts.push(value.slice(start, i));
        start = i + 1;
      }
    }
    parts.push(value.slice(start));
    return parts.map((part) => {
      const text = part.trim();
      const color = text.match(/^(?:[a-z-]+\([^)]*\)|#[0-9a-f]+|[a-z]+)/i)?.[0] ?? 'transparent';
      const lengths = [...text.slice(color.length).matchAll(/(-?[\d.]+)px/g)].map((m) =>
        Number(m[1]),
      );
      const [x = 0, y = 0, blur = 0, spread = 0] = lengths;
      return { color: rgba(color), x, y, blur, spread, inset: /\binset\b/.test(text) };
    });
  };

  const style = getComputedStyle(element);
  const outside = backdrop(element.parentElement);
  const fill = over(rgba(style.backgroundColor), outside);
  const list = shadows(style.boxShadow);
  const outline = list.find(
    (s) => s.inset && s.blur === 0 && s.spread > 0 && s.x === 0 && s.y === 0 && s.color[3] > 0,
  );
  const underline = list.find(
    (s) => s.inset && s.blur === 0 && s.spread === 0 && s.x === 0 && s.y < 0 && s.color[3] > 0,
  );
  const cues = { fill: ratio(fill, outside) };
  if (outline) {
    const edge = over(outline.color, fill);
    cues.outline = Math.max(ratio(edge, outside), ratio(edge, fill));
  }
  if (underline) {
    const line = over(underline.color, fill);
    cues.underline = Math.max(ratio(line, outside), ratio(line, fill));
  }
  return cues;
}

const rows = [];
const failures = [];
try {
  for (const preset of presets) {
    for (const theme of themes) {
      for (const probe of probes) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });
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
        }, preset);
        await page.goto(`http://localhost:${server.port}${probe.route}`, {
          waitUntil: 'networkidle0',
        });
        const cues = await page.evaluate(measure, probe.selector);
        await page.close();
        const where = `${probe.name} [${preset}, ${theme}]`;
        if (!cues) {
          failures.push(`${where}: nothing matches ${probe.selector}`);
          continue;
        }
        const [cue, value] = Object.entries(cues).sort((a, b) => b[1] - a[1])[0];
        rows.push({ preset, theme, name: probe.name, cue, value });
        if (value < minimum) {
          failures.push(`${where}: ${value.toFixed(2)}:1 by its ${cue}, needs ${minimum}:1`);
        }
      }
    }
  }
} finally {
  await browser.close();
  server.close();
}

// One line per style and theme: the weakest control decides
console.log('non-text contrast of controls, weakest first\n');
for (const preset of presets) {
  for (const theme of themes) {
    const group = rows
      .filter((row) => row.preset === preset && row.theme === theme)
      .sort((a, b) => a.value - b.value);
    if (!group.length) continue;
    // Controls that share a value are listed together
    const byValue = new Map();
    for (const row of group) {
      const key = `${row.value.toFixed(2)} by ${row.cue}`;
      byValue.set(key, [...(byValue.get(key) ?? []), row.name]);
    }
    const list = [...byValue].map(([key, names]) => `${key} — ${names.join(', ')}`).join('; ');
    console.log(`  ${preset.padEnd(8)}${theme.padEnd(6)}${list}`);
  }
}

if (failures.length) {
  console.error(
    `\n${failures.length} control(s) below ${minimum}:1:\n\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(`\nevery control has a cue of at least ${minimum}:1`);
