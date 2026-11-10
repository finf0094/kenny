import '@testing-library/jest-dom/vitest';

// axe-core probes <canvas> for contrast checks; jsdom has no canvas and logs loudly.
HTMLCanvasElement.prototype.getContext = (() => null) as never;

// Browsers still populate the legacy `keyCode`, and the CDK key managers read it.
// user-event leaves it at 0 for most keys, so derive it from `key` like a browser would.
const KEY_CODES: Record<string, number> = {
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Escape: 27,
  ' ': 32,
  PageUp: 33,
  PageDown: 34,
  End: 35,
  Home: 36,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Delete: 46,
};
Object.defineProperty(KeyboardEvent.prototype, 'keyCode', {
  configurable: true,
  get(this: KeyboardEvent) {
    return KEY_CODES[this.key] ?? (this.key.length === 1 ? this.key.toUpperCase().charCodeAt(0) : 0);
  },
});
