import { presetRows } from '../../generated/presets';
import { tokens } from '../../generated/tokens';

/** What the constructor lets you decide. `null` everywhere means "as in the base style". */
export interface StyleOptions {
  /** `default` or the id of a built-in preset to start from. */
  base: string;
  /** Radius of fields, px. The rest of the scale is derived from it. */
  radius: number | null;
  control: 'field' | 'pill' | 'square' | null;
  density: 'compact' | 'regular' | 'touch' | null;
  fields: 'outlined' | 'filled' | 'underlined' | null;
  edge: 'border' | 'shadow' | 'both' | 'none' | null;
  material: 'opaque' | 'translucent' | null;
  motion: 'spring' | 'flat' | null;
  /** What a press looks like: the control shrinks, a wave spreads, both or nothing. */
  press: 'squeeze' | 'wave' | 'both' | 'none' | null;
  /** Tempo of every transition. */
  tempo: 'brisk' | 'regular' | 'calm' | null;
  font: 'system' | 'humanist' | 'rounded' | 'serif' | 'mono' | null;
  /** Key accent colour as `#rrggbb`. */
  accent: string | null;
}

export const DEFAULT_OPTIONS: StyleOptions = {
  base: 'default',
  radius: null,
  control: null,
  density: null,
  fields: null,
  edge: null,
  material: null,
  motion: null,
  press: null,
  tempo: null,
  font: null,
  accent: null,
};

const baseValue = new Map(tokens.map((token) => [token.name, token.value]));
const px = (value: number) => `${Math.round(value * 100) / 100}px`;

/** The tokens the chosen options turn into. Order is the order of the output file. */
function optionTokens(options: StyleOptions): Map<string, string> {
  const out = new Map<string, string>();
  const set = (entries: Record<string, string>) =>
    Object.entries(entries).forEach(([name, value]) => out.set(name, value));

  if (options.accent) {
    const c = options.accent;
    const tint = (share: number) => `color-mix(in oklab, ${c} ${share}%, white)`;
    const shade = (share: number) => `color-mix(in oklab, ${c} ${share}%, black)`;
    set({
      '--kn-accent-50': tint(7),
      '--kn-accent-100': tint(14),
      '--kn-accent-200': tint(28),
      '--kn-accent-300': tint(44),
      '--kn-accent-400': tint(64),
      '--kn-accent-500': tint(84),
      '--kn-accent-600': c,
      '--kn-accent-700': shade(86),
      '--kn-accent-800': shade(72),
      '--kn-accent-900': shade(48),
      '--kn-accent-950': shade(30),
    });
  }

  if (options.material === 'translucent') {
    set({
      '--kn-color-surface': 'light-dark(rgb(255 255 255 / 0.6), rgb(30 34 43 / 0.6))',
      '--kn-color-surface-raised': 'light-dark(rgb(255 255 255 / 0.84), rgb(30 34 43 / 0.86))',
      '--kn-color-surface-subtle': 'light-dark(rgb(255 255 255 / 0.34), rgb(255 255 255 / 0.06))',
      '--kn-surface-filter': 'blur(22px) saturate(180%)',
      '--kn-surface-filter-raised': 'blur(40px) saturate(190%)',
      '--kn-scrim-filter': 'blur(6px) saturate(140%)',
    });
  } else if (options.material === 'opaque') {
    set({
      '--kn-color-surface': 'light-dark(#ffffff, #171a21)',
      '--kn-color-surface-raised': 'light-dark(#ffffff, #1e222b)',
      '--kn-color-surface-subtle': 'light-dark(rgb(23 26 33 / 0.04), rgb(255 255 255 / 0.045))',
      '--kn-surface-filter': 'none',
      '--kn-surface-filter-raised': 'none',
      '--kn-scrim-filter': 'none',
    });
  }

  if (options.radius !== null) {
    const r = options.radius;
    set({
      '--kn-radius-xs': px(r * 0.5),
      '--kn-radius-sm': px(r * 0.75),
      '--kn-radius-md': px(r),
      '--kn-radius-lg': px(r * 1.5),
      '--kn-radius-xl': px(r * 2),
      '--kn-radius-2xl': px(r * 3),
    });
  }

  if (options.control) {
    const shape = { field: 'var(--kn-radius-md)', pill: 'var(--kn-radius-full)', square: '0px' };
    set({
      '--kn-radius-control': shape[options.control],
      '--kn-radius-badge':
        options.control === 'pill' ? 'var(--kn-radius-full)' : 'var(--kn-radius-sm)',
    });
  }

  if (options.density) {
    const sizes = {
      compact: ['1.625rem', '2rem', '2.5rem', '0.8125rem', '0.875rem', '1rem'],
      regular: ['1.875rem', '2.375rem', '2.875rem', '0.8125rem', '0.9375rem', '1.0625rem'],
      touch: ['2.125rem', '2.75rem', '3.125rem', '0.875rem', '1rem', '1.125rem'],
    }[options.density];
    set({
      '--kn-size-sm': sizes[0],
      '--kn-size-md': sizes[1],
      '--kn-size-lg': sizes[2],
      '--kn-text-sm': sizes[3],
      '--kn-text-md': sizes[4],
      '--kn-text-lg': sizes[5],
    });
  }

  if (options.fields === 'outlined') {
    set({
      '--kn-color-field': 'var(--kn-color-surface)',
      '--kn-color-field-border': 'var(--kn-color-border-strong)',
      '--kn-color-field-border-hover': 'var(--kn-color-text-subtle)',
      '--kn-field-border-width': '1px',
      '--kn-field-underline-width': '0px',
      '--kn-field-underline-focus-width': '0px',
      '--kn-field-focus-width': '2px',
      '--kn-radius-field': 'var(--kn-radius-md)',
      '--kn-radius-field-sm': 'var(--kn-radius-sm)',
    });
  } else if (options.fields === 'filled') {
    set({
      '--kn-color-field': 'var(--kn-color-surface-sunken)',
      '--kn-color-field-border': 'transparent',
      '--kn-color-field-border-hover': 'var(--kn-color-border-strong)',
      '--kn-field-border-width': '1px',
      '--kn-field-underline-width': '0px',
      '--kn-field-underline-focus-width': '0px',
      '--kn-field-focus-width': '2px',
      '--kn-radius-field': 'var(--kn-radius-md)',
      '--kn-radius-field-sm': 'var(--kn-radius-sm)',
    });
  } else if (options.fields === 'underlined') {
    set({
      '--kn-color-field': 'var(--kn-color-surface-sunken)',
      '--kn-color-field-border': 'transparent',
      '--kn-color-field-border-hover': 'var(--kn-color-text)',
      '--kn-color-field-underline': 'var(--kn-color-text-muted)',
      '--kn-field-border-width': '0px',
      '--kn-field-underline-width': '1px',
      '--kn-field-underline-focus-width': '2px',
      '--kn-field-focus-width': '0px',
      '--kn-radius-field': 'var(--kn-radius-sm) var(--kn-radius-sm) 0 0',
      '--kn-radius-field-sm': 'var(--kn-radius-sm) var(--kn-radius-sm) 0 0',
    });
  }

  if (options.edge) {
    const hairline = 'inset 0 0 0 1px var(--kn-color-border)';
    const none = '0 0 0 0 transparent';
    const edges = {
      border: [
        hairline,
        'var(--kn-surface-rim)',
        'var(--kn-surface-rim)',
        'var(--kn-surface-rim), var(--kn-shadow-md)',
        'var(--kn-surface-rim), var(--kn-shadow-lg)',
      ],
      shadow: [
        none,
        'var(--kn-shadow-xs)',
        'var(--kn-shadow-sm)',
        'var(--kn-shadow-md)',
        'var(--kn-shadow-lg)',
      ],
      both: [
        hairline,
        'var(--kn-surface-rim), var(--kn-shadow-xs)',
        'var(--kn-surface-rim), var(--kn-shadow-sm)',
        'var(--kn-surface-rim), var(--kn-shadow-md)',
        'var(--kn-surface-rim), var(--kn-shadow-lg)',
      ],
      // Nothing around containers; small surfaces keep an outline so that they stay visible
      none: [
        none,
        'inset 0 0 0 1px var(--kn-color-border-strong)',
        none,
        'var(--kn-shadow-md)',
        'var(--kn-shadow-lg)',
      ],
    }[options.edge];
    set({
      '--kn-surface-rim': edges[0],
      '--kn-elevation-raised': edges[1],
      '--kn-elevation-card': edges[2],
      '--kn-elevation-popup': edges[3],
      '--kn-elevation-modal': edges[4],
    });
  }

  if (options.motion === 'flat') {
    set({
      '--kn-ease-spring': 'cubic-bezier(0.2, 0, 0, 1)',
      '--kn-ease-spring-bouncy': 'cubic-bezier(0.2, 0, 0, 1)',
    });
  } else if (options.motion === 'spring') {
    set({
      '--kn-ease-spring': baseValue.get('--kn-ease-spring') ?? '',
      '--kn-ease-spring-bouncy': baseValue.get('--kn-ease-spring-bouncy') ?? '',
    });
  }

  if (options.press) {
    const squeeze = options.press === 'squeeze' || options.press === 'both';
    const wave = options.press === 'wave' || options.press === 'both';
    set({
      '--kn-press-scale': squeeze ? '0.97' : '1',
      '--kn-ripple-opacity': wave ? '0.14' : '0',
    });
  }

  if (options.tempo) {
    set({ '--kn-duration-scale': { brisk: '0.7', regular: '1', calm: '1.4' }[options.tempo] });
  }

  if (options.font) {
    set({
      '--kn-font-sans': {
        system: baseValue.get('--kn-font-sans') ?? 'system-ui, sans-serif',
        humanist:
          "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
        rounded:
          "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', Calibri, source-sans-pro, sans-serif",
        serif: "'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, Georgia, serif",
        mono: 'var(--kn-font-mono)',
      }[options.font],
    });
  }

  return out;
}

const references = (value: string) =>
  Array.from(value.matchAll(/var\(\s*(--kn-[\w-]+)/g), (match) => match[1]);

/**
 * Default tokens computed from the ones being changed. A custom property is evaluated where
 * it is declared, so they have to be declared again inside the style to pick up the new values.
 */
function derivedTokens(changed: Map<string, string>): Map<string, string> {
  const affected = new Set(changed.keys());
  const derived = new Map<string, string>();
  for (let grew = true; grew;) {
    grew = false;
    for (const token of tokens) {
      if (affected.has(token.name)) continue;
      if (references(token.value).some((name) => affected.has(name))) {
        affected.add(token.name);
        derived.set(token.name, token.value);
        grew = true;
      }
    }
  }
  return derived;
}

/** Every declaration of the style: the base preset, the options on top, then derived tokens. */
export function styleTokens(options: StyleOptions): {
  base: Map<string, string>;
  own: Map<string, string>;
  derived: Map<string, string>;
} {
  const base = new Map<string, string>();
  if (options.base !== 'default') {
    for (const row of presetRows) {
      const value = row.values[options.base];
      if (value) base.set(row.name, value);
    }
  }
  const own = optionTokens(options);
  for (const name of own.keys()) base.delete(name);
  const derived = derivedTokens(new Map([...base, ...own]));
  return { base, own, derived };
}

function block(title: string, entries: Map<string, string>): string {
  if (!entries.size) return '';
  const lines = Array.from(entries, ([name, value]) => `  ${name}: ${value};`);
  return `  /* ${title} */\n${lines.join('\n')}\n`;
}

/** The style as a CSS file. */
export function styleCss(name: string, options: StyleOptions, baseLabel: string): string {
  const { base, own, derived } = styleTokens(options);
  const body = [
    block(`Основа: стиль «${baseLabel}»`, base),
    block('Ваши настройки', own),
    block('Токены, собранные из изменённых: объявлены заново, чтобы взять новые значения', derived),
  ]
    .filter(Boolean)
    .join('\n');
  return [
    `/* Стиль «${name}» для Kenny. Подключите после @kenny/tokens/kenny.css`,
    ` * и поставьте data-kn-preset="${name}" на <html> или на любой блок. */`,
    `[data-kn-preset='${name}'] {`,
    body.trimEnd() || '  /* Пока ничего не изменено: это базовый стиль */',
    '}',
    '',
  ].join('\n');
}

/** WCAG contrast ratio of two `#rrggbb` colours. */
export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const channel = (i: number) => {
      const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  };
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** A valid CSS identifier for the attribute value, from whatever was typed. */
export function slug(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'my-style'
  );
}

/** Options as a compact query-string value, and back: a style can be shared as a link. */
export function encodeOptions(options: StyleOptions): string {
  const changed = Object.entries(options).filter(
    ([key, value]) => value !== DEFAULT_OPTIONS[key as keyof StyleOptions],
  );
  return changed.map(([key, value]) => `${key}.${String(value).replace('#', '')}`).join('~');
}

export function decodeOptions(text: string | null | undefined): StyleOptions {
  const options: Record<string, unknown> = { ...DEFAULT_OPTIONS };
  for (const pair of (text ?? '').split('~')) {
    const [key, ...rest] = pair.split('.');
    const value = rest.join('.');
    if (!(key in DEFAULT_OPTIONS) || !/^[\w-]+$/.test(value)) continue;
    if (key === 'radius') {
      const radius = Number(value);
      if (Number.isFinite(radius) && radius >= 0 && radius <= 32) options[key] = radius;
    } else if (key === 'accent') {
      if (/^[0-9a-f]{6}$/i.test(value)) options[key] = `#${value}`;
    } else {
      options[key] = value;
    }
  }
  return options as unknown as StyleOptions;
}
