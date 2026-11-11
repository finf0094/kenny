// Keyboard smoke test of the built documentation site: no mouse, real browser.
/* global document, window */
//
//   node tools/keyboard.mjs [distDir]
//
// Each scenario drives a widget the way a keyboard user would and asserts on focus
// and ARIA state. It complements the unit tests: here the components run inside
// the real site, with real overlays, router and hydration.
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeArgs, chromePath, serve } from './serve.mjs';

const distDir = resolve(process.argv[2] ?? 'dist/docs');
const server = await serve(join(distDir, 'browser'));
const browser = await puppeteer.launch({ executablePath: chromePath, args: chromeArgs });
const failures = [];
let passed = 0;

const pause = (ms) => new Promise((done) => setTimeout(done, ms));

/** Presses a key and lets the zoneless scheduler render the result. */
async function press(page, key) {
  await page.keyboard.press(key);
  await pause(80);
}

/** Describes the focused element: enough to assert on without brittle selectors. */
const active = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: 'body', role: null, text: '', id: '' };
    return {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role'),
      text: (el.getAttribute('aria-label') ?? el.textContent ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 60),
      id: el.id,
      selected: el.getAttribute('aria-selected'),
      expanded: el.getAttribute('aria-expanded'),
      insideDialog: Boolean(el.closest('[role="dialog"], [role="alertdialog"]')),
      insideMenu: Boolean(el.closest('[role="menu"]')),
    };
  });

async function scenario(name, route, run) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(`http://localhost:${server.port}${route}`, { waitUntil: 'networkidle0' });
    await run(page);
    if (errors.length) throw new Error(`page error: ${errors[0]}`);
    passed++;
    console.log(`  ok    ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`  FAIL  ${name}\n        ${error.message}`);
  } finally {
    await page.close();
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

/** Focuses the first element matching `selector` inside the first live demo of the page. */
async function focusIn(page, selector) {
  const found = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.focus();
    return document.activeElement === el;
  }, selector);
  expect(found, `cannot focus ${selector}`);
}

try {
  console.log('keyboard scenarios');

  await scenario(
    'skip link is the first tab stop and moves focus to the content',
    '/',
    async (page) => {
      await press(page, 'Tab');
      const link = await active(page);
      expect(link.tag === 'a' && /содержим/i.test(link.text), `first tab stop is "${link.text}"`);
      await press(page, 'Enter');
      expect((await active(page)).id === 'content', 'focus did not move to #content');
    },
  );

  await scenario(
    'Ctrl+K opens the command palette, typing filters, Enter navigates',
    '/',
    async (page) => {
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyK');
      await page.keyboard.up('Control');
      await pause(200);
      const input = await active(page);
      expect(
        input.role === 'combobox' && input.insideDialog,
        `palette input not focused (${input.tag}/${input.role})`,
      );
      await page.keyboard.type('splitter');
      await pause(150);
      await press(page, 'Enter');
      await page.waitForFunction(() => window.location.pathname === '/components/splitter', {
        timeout: 4000,
      });
      expect(!(await page.$('[role="dialog"]')), 'palette stayed open after navigation');
    },
  );

  await scenario(
    'Style preset: chosen in the command palette, applied to <html>, survives a reload',
    '/',
    async (page) => {
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyK');
      await page.keyboard.up('Control');
      await pause(200);
      await page.keyboard.type('строгий');
      await pause(150);
      await press(page, 'Enter');
      await pause(200);
      const preset = () => page.evaluate(() => document.documentElement.dataset.knPreset ?? null);
      expect((await preset()) === 'crisp', `data-kn-preset is ${await preset()}`);
      await page.reload({ waitUntil: 'networkidle0' });
      expect((await preset()) === 'crisp', 'the style was not restored after a reload');
    },
  );

  await scenario(
    'Style preset: the menu in the top bar switches it with arrows and Enter',
    '/docs/presets',
    async (page) => {
      await focusIn(page, 'header button.style');
      await press(page, 'Enter');
      await pause(200);
      const first = await active(page);
      expect(
        first.insideMenu && first.role === 'menuitemradio',
        `menu item not focused (${first.role})`,
      );
      await press(page, 'ArrowDown');
      await press(page, 'ArrowDown');
      await press(page, 'Enter');
      await pause(200);
      const preset = await page.evaluate(() => document.documentElement.dataset.knPreset ?? null);
      expect(preset === 'tonal', `data-kn-preset is ${preset}`);
      expect(!(await page.$('[role="menu"]')), 'menu stayed open');
    },
  );

  await scenario(
    'Escape closes the command palette and restores focus',
    '/docs/theming',
    async (page) => {
      await focusIn(page, 'header .search');
      await press(page, 'Enter');
      await pause(200);
      expect((await active(page)).insideDialog, 'palette did not take focus');
      await press(page, 'Escape');
      await pause(200);
      expect(!(await page.$('[role="dialog"]')), 'palette still open');
      expect(/поиск/i.test((await active(page)).text), 'focus did not return to the search button');
    },
  );

  await scenario(
    'Tabs: arrows move and activate, Home/End jump, one tab stop',
    '/components/tabs',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component [role="tab"][aria-selected="true"]');
      const first = await active(page);
      await press(page, 'ArrowRight');
      const second = await active(page);
      expect(second.role === 'tab' && second.text !== first.text, 'ArrowRight did not move focus');
      expect(second.selected === 'true', 'focused tab was not activated');
      await press(page, 'End');
      const last = await active(page);
      await press(page, 'ArrowRight');
      expect((await active(page)).text !== last.text, 'ArrowRight on the last tab did not wrap');
      await press(page, 'Home');
      expect((await active(page)).text === first.text, 'Home did not return to the first tab');
      await press(page, 'Tab');
      expect((await active(page)).role !== 'tab', 'Tab stayed inside the tab list');
    },
  );

  await scenario(
    'Dialog: focus moves in, is trapped, Escape returns it to the trigger',
    '/components/dialog',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component button');
      const trigger = await active(page);
      await press(page, 'Enter');
      await pause(250);
      expect((await active(page)).insideDialog, 'focus is not inside the dialog');
      for (let i = 0; i < 12; i++) {
        await press(page, 'Tab');
        expect(
          (await active(page)).insideDialog,
          `focus escaped the dialog after ${i + 1} Tab presses`,
        );
      }
      await press(page, 'Escape');
      await pause(250);
      expect(!(await page.$('[role="dialog"], [role="alertdialog"]')), 'dialog still open');
      expect((await active(page)).text === trigger.text, 'focus did not return to the trigger');
    },
  );

  await scenario(
    'Dropdown menu: opens on Enter, arrows rove and wrap, Escape closes',
    '/components/dropdown-menu',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component button[aria-haspopup="menu"]');
      await press(page, 'Enter');
      await pause(200);
      const first = await active(page);
      expect(
        first.insideMenu && /^menuitem/.test(first.role ?? ''),
        `first item not focused (${first.role})`,
      );
      await press(page, 'ArrowDown');
      const second = await active(page);
      expect(second.insideMenu && second.text !== first.text, 'ArrowDown did not move');
      await press(page, 'End');
      await press(page, 'ArrowDown');
      expect((await active(page)).text === first.text, 'ArrowDown on the last item did not wrap');
      await press(page, 'Escape');
      await pause(200);
      expect(!(await page.$('[role="menu"]')), 'menu still open');
      expect((await active(page)).expanded === 'false', 'focus did not return to the trigger');
    },
  );

  await scenario(
    'Select: opens from the keyboard, arrows change the active option, Enter commits',
    '/components/select',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component kn-select [role="combobox"]');
      const before = (await active(page)).text;
      await press(page, 'ArrowDown');
      await pause(200);
      expect(await page.$('[role="listbox"]'), 'listbox did not open');
      await press(page, 'ArrowDown');
      await press(page, 'Enter');
      await pause(200);
      expect(!(await page.$('[role="listbox"]')), 'listbox did not close');
      const after = await active(page);
      expect(after.role === 'combobox', 'focus left the select');
      expect(after.text !== before, 'value did not change');
    },
  );

  await scenario(
    'Accordion: Enter toggles, arrows move between headers',
    '/components/accordion',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component kn-accordion button[aria-expanded]');
      const first = await active(page);
      await press(page, 'Enter');
      expect((await active(page)).expanded !== first.expanded, 'Enter did not toggle the panel');
      await press(page, 'ArrowDown');
      expect((await active(page)).text !== first.text, 'ArrowDown did not move to the next header');
    },
  );

  await scenario(
    'Slider: arrows, Home and End change the value',
    '/components/slider',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component kn-slider input[type="range"]');
      const value = () => page.evaluate(() => Number(document.activeElement.value));
      const start = await value();
      await press(page, 'ArrowRight');
      expect((await value()) > start, 'ArrowRight did not increase the value');
      await press(page, 'Home');
      const min = await value();
      await press(page, 'End');
      expect((await value()) > min, 'End did not jump to the maximum');
    },
  );

  await scenario(
    'Splitter: the separator is focusable and arrows resize the panels',
    '/components/splitter',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component [role="separator"]');
      const size = () =>
        page.evaluate(() => Number(document.activeElement.getAttribute('aria-valuenow')));
      const start = await size();
      await press(page, 'ArrowRight');
      await press(page, 'ArrowRight');
      expect((await size()) !== start, 'arrows did not resize');
    },
  );

  await scenario(
    'Date picker: opens with a grid, arrows move the day, Enter selects',
    '/components/date-picker',
    async (page) => {
      await focusIn(page, 'docs-demo ng-component kn-date-picker button');
      await press(page, 'Enter');
      await pause(250);
      const day = await active(page);
      expect(day.insideDialog, 'focus did not move into the calendar');
      await press(page, 'ArrowRight');
      expect((await active(page)).text !== day.text, 'ArrowRight did not move to the next day');
      await press(page, 'Enter');
      await pause(250);
      expect(!(await page.$('[role="dialog"]')), 'calendar did not close after selection');
    },
  );

  await scenario(
    'Kanban: a card moves between columns from its menu, no drag needed',
    '/examples/kanban',
    async (page) => {
      const count = (index) =>
        page.evaluate(
          (i) => document.querySelectorAll('.kb-column')[i].querySelectorAll('.kb-card').length,
          index,
        );
      const before = [await count(0), await count(3)];
      await focusIn(page, '.kb-column .kb-card [aria-haspopup="menu"]');
      await press(page, 'Enter');
      await pause(200);
      expect((await active(page)).insideMenu, 'card menu did not open');
      await press(page, 'End'); // "Удалить"
      await press(page, 'ArrowUp'); // last column
      await press(page, 'Enter');
      await pause(300);
      expect(
        (await count(0)) === before[0] - 1 && (await count(3)) === before[1] + 1,
        'card did not move to the last column',
      );
    },
  );

  await scenario(
    'Docs navigation: sidebar links are reachable and Enter follows them',
    '/docs/getting-started',
    async (page) => {
      await focusIn(page, 'kn-sidebar a[href="/docs/motion"]');
      await press(page, 'Enter');
      await page.waitForFunction(() => window.location.pathname === '/docs/motion', {
        timeout: 4000,
      });
      const current = await page.$eval('kn-sidebar a[aria-current="page"]', (el) =>
        el.textContent.trim(),
      );
      expect(current === 'Motion', `aria-current is on "${current}"`);
    },
  );

  await scenario(
    'Toggle group: one tab stop, arrows move focus, Space presses, Tab leaves',
    '/components/toggle-group',
    async (page) => {
      await focusIn(page, 'kn-toggle-group button[aria-pressed="true"]');
      expect((await active(page)).text === 'Доска', 'focus is not on the pressed toggle');
      await press(page, 'ArrowRight');
      const next = await active(page);
      expect(next.text === 'Календарь', `ArrowRight moved to "${next.text}"`);
      const untouched = await page.$eval('kn-toggle-group button[aria-pressed="true"]', (el) =>
        el.textContent.trim(),
      );
      expect(untouched === 'Доска', 'moving the focus changed the value');
      await press(page, 'Space');
      const pressed = await page.evaluate(() =>
        document.activeElement.getAttribute('aria-pressed'),
      );
      expect(pressed === 'true', 'Space did not press the focused toggle');
      await press(page, 'Tab');
      const outside = await page.evaluate(() =>
        document.activeElement.closest('kn-toggle-group')?.getAttribute('aria-labelledby'),
      );
      expect(outside !== 'view-label', 'Tab stayed inside the group');
    },
  );

  await scenario(
    'Number input: arrows step, typed text is applied on Enter and clamped',
    '/components/number-input',
    async (page) => {
      await focusIn(page, 'kn-number-input input[role="spinbutton"]');
      const value = () => page.evaluate(() => document.activeElement.getAttribute('aria-valuenow'));
      expect((await value()) === '5', `initial value is ${await value()}`);
      await press(page, 'ArrowUp');
      await press(page, 'ArrowUp');
      expect((await value()) === '7', `two steps up gave ${await value()}`);
      await press(page, 'End');
      expect((await value()) === '50', `End gave ${await value()}`);
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.type('999');
      await press(page, 'Enter');
      expect((await value()) === '50', `typed 999 was not clamped: ${await value()}`);
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.type('12');
      await press(page, 'Enter');
      expect((await value()) === '12', `typed 12 gave ${await value()}`);
    },
  );

  await scenario(
    'Chip: filter chips toggle with Enter, the remove button removes',
    '/components/chip',
    async (page) => {
      await focusIn(page, 'kn-chip button.remove');
      const before = await page.$$eval('kn-chip button.remove', (els) => els.length);
      await press(page, 'Enter');
      const after = await page.$$eval('kn-chip button.remove', (els) => els.length);
      expect(after === before - 1, `remove left ${after} of ${before} chips`);
      await focusIn(page, 'kn-chip button.body[aria-pressed="false"]');
      await press(page, 'Enter');
      const pressed = await page.evaluate(() =>
        document.activeElement.getAttribute('aria-pressed'),
      );
      expect(pressed === 'true', 'Enter did not select the chip');
    },
  );

  await scenario(
    'Alert: the close button is reachable and removes the message',
    '/components/alert',
    async (page) => {
      await focusIn(page, 'kn-alert button.close');
      await press(page, 'Enter');
      await page.waitForFunction(() => !document.querySelector('kn-alert button.close'), {
        timeout: 3000,
      });
    },
  );
} finally {
  await browser.close();
  server.close();
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
