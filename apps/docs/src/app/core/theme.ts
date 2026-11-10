import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface StylePreset {
  /** Value of `data-kn-preset`. */
  id: string;
  label: string;
  /** One line: what makes this style different. */
  summary: string;
  /** Longer description for the presets page. */
  description: string;
}

export const PRESETS: StylePreset[] = [
  {
    id: 'glass',
    label: 'Стекло',
    summary: 'Полупрозрачные слои, размытие, пружины',
    description:
      'Стиль по умолчанию. Поверхности полупрозрачны и размывают то, что под ними; у закрашенных элементов блик по верхней кромке; кнопки-капсулы и крупные радиусы.',
  },
  {
    id: 'classic',
    label: 'Классика',
    summary: 'Непрозрачные листы, рамки, прямоугольные кнопки',
    description:
      'Привычный вид классических веб-фреймворков: непрозрачные поверхности, разделённые тонкими рамками, поля с обводкой, радиус 6 пикселей, тени только у всплывающих элементов.',
  },
  {
    id: 'tonal',
    label: 'Тональный',
    summary: 'Оттенки акцента вместо рамок',
    description:
      'Страница, карточки и поля — ступени одного тона, подмешанного из акцентного цвета. Рамок почти нет, кнопки-капсулы, большие радиусы, мягкие тени у всплывающих слоёв.',
  },
  {
    id: 'crisp',
    label: 'Строгий',
    summary: 'Плотный, с малыми радиусами — для данных',
    description:
      'Плотный интерфейс для экранов с данными: контролы ниже, шрифт 14 пикселей, радиус 4 пикселя, плоские листы с волосяными линиями и едва заметной тенью.',
  },
];

export interface AccentPreset {
  id: string;
  label: string;
  /** Eleven steps, 50 → 950. `null` restores the default cobalt from the tokens. */
  scale: string[] | null;
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const ACCENTS: AccentPreset[] = [
  { id: 'cobalt', label: 'Кобальт', scale: null },
  {
    id: 'emerald',
    label: 'Изумруд',
    scale: [
      '#e9f9f1',
      '#cff2e1',
      '#a0e4c4',
      '#77d9ab',
      '#4fd69c',
      '#1fae78',
      '#0f8a5c',
      '#0c7550',
      '#0a6143',
      '#073f2c',
      '#04261a',
    ],
  },
  {
    id: 'amber',
    label: 'Янтарь',
    scale: [
      '#fff6e5',
      '#ffeac2',
      '#ffd58a',
      '#ffc260',
      '#ffb23e',
      '#e08a1c',
      '#a85f00',
      '#8f5100',
      '#754300',
      '#4a2a00',
      '#2b1800',
    ],
  },
  {
    id: 'coral',
    label: 'Коралл',
    scale: [
      '#ffefee',
      '#ffdcda',
      '#ffb8b4',
      '#ff9d98',
      '#ff7f7a',
      '#ee5550',
      '#cf3a3a',
      '#b22f31',
      '#962729',
      '#5e181a',
      '#3a0d0f',
    ],
  },
];

/** Theme, style preset and accent for the docs. All are plain DOM writes: tokens react without a rebuild. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = this.safeStorage();

  readonly mode = signal<ThemeMode>(
    (this.storage?.getItem('kn-theme') as ThemeMode | null) ?? 'system',
  );
  readonly accent = signal(this.storage?.getItem('kn-accent') ?? 'cobalt');
  readonly preset = signal(this.storedPreset());

  constructor() {
    effect(() => {
      const mode = this.mode();
      const root = this.document.documentElement;
      if (mode === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', mode);
      this.storage?.setItem('kn-theme', mode);
    });
    effect(() => {
      const id = this.preset();
      const root = this.document.documentElement;
      // The default style needs no attribute: the base tokens already describe it
      if (id === 'glass') root.removeAttribute('data-kn-preset');
      else root.setAttribute('data-kn-preset', id);
      this.storage?.setItem('kn-preset', id);
    });
    effect(() => {
      const id = this.accent();
      const preset = ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
      const style = this.document.documentElement.style;
      STEPS.forEach((step, i) => {
        if (preset.scale) style.setProperty(`--kn-accent-${step}`, preset.scale[i]);
        else style.removeProperty(`--kn-accent-${step}`);
      });
      this.storage?.setItem('kn-accent', id);
    });
  }

  private storedPreset(): string {
    const stored = this.storage?.getItem('kn-preset');
    return PRESETS.some((preset) => preset.id === stored) ? (stored as string) : 'glass';
  }

  /** Cycles system → light → dark. */
  next(): void {
    const order: ThemeMode[] = ['system', 'light', 'dark'];
    this.mode.set(order[(order.indexOf(this.mode()) + 1) % order.length]);
  }

  private safeStorage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
