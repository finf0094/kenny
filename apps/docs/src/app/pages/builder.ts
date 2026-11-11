import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT, Location } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { KnBadge } from '@kenny/ui/badge';
import { KnButton } from '@kenny/ui/button';
import { KnField } from '@kenny/ui/field';
import { KnIcon } from '@kenny/ui/icon';
import { KnInput } from '@kenny/ui/input';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { KnToggle, KnToggleGroup } from '@kenny/ui/toggle-group';
import { DocsCode } from '../core/code-block';
import { DocsPresetPreview } from '../core/preset-preview';
import {
  contrast,
  decodeOptions,
  DEFAULT_OPTIONS,
  encodeOptions,
  slug,
  styleCss,
  StyleOptions,
  styleTokens,
} from '../core/style-builder';
import { PRESETS } from '../core/theme';

/** Value of the "as in the base style" option: selects hold strings, the options hold `null`. */
const KEEP = 'keep';

interface Choice {
  key: keyof StyleOptions;
  label: string;
  hint: string;
  options: { value: string; label: string }[];
}

const CHOICES: Choice[] = [
  {
    key: 'radius',
    label: 'Скругление',
    hint: 'Радиус полей; карточки и окна считаются от него',
    options: [0, 2, 4, 6, 8, 12, 16, 20].map((r) => ({ value: String(r), label: `${r} px` })),
  },
  {
    key: 'control',
    label: 'Форма кнопок',
    hint: 'Кнопки, сегменты вкладок, номера страниц',
    options: [
      { value: 'field', label: 'Как у полей' },
      { value: 'pill', label: 'Капсула' },
      { value: 'square', label: 'Прямые углы' },
    ],
  },
  {
    key: 'density',
    label: 'Плотность',
    hint: 'Высота контролов и размер текста',
    options: [
      { value: 'compact', label: 'Плотно — 32 px' },
      { value: 'regular', label: 'Обычно — 38 px' },
      { value: 'touch', label: 'Под палец — 44 px' },
    ],
  },
  {
    key: 'fields',
    label: 'Поля',
    hint: 'Ввод, списки, выбор даты',
    options: [
      { value: 'outlined', label: 'С обводкой' },
      { value: 'filled', label: 'С заливкой' },
      { value: 'underlined', label: 'С линией снизу' },
    ],
  },
  {
    key: 'material',
    label: 'Поверхности',
    hint: 'Карточки, панели, всплывающие слои',
    options: [
      { value: 'opaque', label: 'Непрозрачные' },
      { value: 'translucent', label: 'Полупрозрачные с размытием' },
    ],
  },
  {
    key: 'edge',
    label: 'Край поверхностей',
    hint: 'Чем карточка отделяется от страницы',
    options: [
      { value: 'border', label: 'Рамка' },
      { value: 'shadow', label: 'Тень' },
      { value: 'both', label: 'Рамка и тень' },
      { value: 'none', label: 'Ничего' },
    ],
  },
  {
    key: 'motion',
    label: 'Характер движения',
    hint: 'Переключатели, индикаторы, окна',
    options: [
      { value: 'spring', label: 'С пружиной' },
      { value: 'flat', label: 'Без перелёта' },
    ],
  },
  {
    key: 'tempo',
    label: 'Темп',
    hint: 'Множитель всех длительностей',
    options: [
      { value: 'brisk', label: 'Быстро — × 0,7' },
      { value: 'regular', label: 'Обычно — × 1' },
      { value: 'calm', label: 'Спокойно — × 1,4' },
    ],
  },
  {
    key: 'press',
    label: 'Отклик на нажатие',
    hint: 'Кнопки, вкладки, пункты меню',
    options: [
      { value: 'squeeze', label: 'Сжатие' },
      { value: 'wave', label: 'Волна' },
      { value: 'both', label: 'Сжатие и волна' },
      { value: 'none', label: 'Ничего' },
    ],
  },
  {
    key: 'font',
    label: 'Шрифт',
    hint: 'Системные семейства; свой шрифт впишите в файл',
    options: [
      { value: 'system', label: 'Системный' },
      { value: 'humanist', label: 'Гуманистический' },
      { value: 'rounded', label: 'Скруглённый' },
      { value: 'serif', label: 'С засечками' },
      { value: 'mono', label: 'Моноширинный' },
    ],
  },
];

/** Name of the style in the live preview. The file you download uses your own name. */
const PREVIEW = 'builder-preview';

@Component({
  imports: [
    RouterLink,
    KnField,
    KnInput,
    KnSelect,
    KnOption,
    KnButton,
    KnBadge,
    KnIcon,
    DocsCode,
    DocsPresetPreview,
    KnToggleGroup,
    KnToggle,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose">
      <h1>Конструктор стиля</h1>
      <p class="lead">
        Соберите свой стиль: возьмите готовый за основу, поменяйте то, что не подходит, и заберите
        CSS-файл. Справа — настоящие компоненты, они перерисовываются сразу.
      </p>

      <div class="builder">
        <form class="controls" aria-label="Настройки стиля" (submit)="$event.preventDefault()">
          <kn-field label="Основа" hint="С чего начать">
            <kn-select [value]="options().base" (valueChange)="set('base', $event)">
              @for (preset of presets; track preset.id) {
                <kn-option [value]="preset.id">{{ preset.label }}</kn-option>
              }
            </kn-select>
          </kn-field>

          @for (choice of choices; track choice.key) {
            <kn-field [label]="choice.label" [hint]="choice.hint">
              <kn-select [value]="selected(choice.key)" (valueChange)="set(choice.key, $event)">
                <kn-option [value]="keep">Как в основе</kn-option>
                @for (option of choice.options; track option.value) {
                  <kn-option [value]="option.value">{{ option.label }}</kn-option>
                }
              </kn-select>
            </kn-field>
          }

          <div class="accent">
            <label class="accent-label" for="builder-accent">Акцент</label>
            <div class="accent-row">
              <input
                id="builder-accent"
                class="swatch"
                type="color"
                [value]="options().accent ?? '#1f4bdb'"
                (input)="set('accent', $any($event.target).value)"
              />
              @if (options().accent; as accent) {
                <code>{{ accent }}</code>
                <button
                  kn-button
                  size="sm"
                  variant="ghost"
                  tone="neutral"
                  (click)="set('accent', keep)"
                >
                  Сбросить
                </button>
              } @else {
                <span class="note">Как в основе</span>
              }
            </div>
            @if (accentContrast(); as ratio) {
              <p class="contrast">
                <kn-badge [tone]="ratio >= 4.5 ? 'success' : 'warning'">
                  {{ ratio.toFixed(1) }} : 1
                </kn-badge>
                @if (ratio >= 4.5) {
                  Белый текст на этом цвете читается.
                } @else {
                  Белый текст на этом цвете читается плохо: нужно не меньше 4,5 : 1. Возьмите цвет
                  темнее.
                }
              </p>
            }
          </div>

          <button kn-button variant="soft" tone="neutral" [disabled]="pristine()" (click)="reset()">
            <kn-icon name="refresh" /> Сбросить всё
          </button>
        </form>

        <div class="result">
          <section
            class="stage kn-wallpaper-sm"
            aria-label="Предпросмотр стиля"
            [attr.data-kn-preset]="previewName"
            [attr.data-theme]="previewTheme() === 'auto' ? null : previewTheme()"
            [attr.data-docs-wallpaper]="translucent() ? '' : null"
          >
            <docs-preset-preview label="предпросмотр" />
          </section>
          <div class="stage-bar">
            <kn-toggle-group
              aria-label="Тема предпросмотра"
              size="sm"
              requireSelection
              [(value)]="previewTheme"
            >
              <button kn-toggle value="auto">Как на сайте</button>
              <button kn-toggle value="light">Светлая</button>
              <button kn-toggle value="dark">Тёмная</button>
            </kn-toggle-group>
            <button kn-button size="sm" variant="outline" tone="neutral" (click)="share()">
              <kn-icon [name]="shared() ? 'check' : 'link'" />
              {{ shared() ? 'Ссылка скопирована' : 'Скопировать ссылку на стиль' }}
            </button>
          </div>
          <p class="note">
            Изменено значений: {{ changed() }}. Ссылка открывает конструктор с теми же настройками —
            удобно показать вариант коллеге.
          </p>
        </div>
      </div>

      <h2 id="file">Готовый файл</h2>
      <div class="file-head">
        <kn-field class="name" label="Имя стиля" hint="Латиница, цифры и дефис">
          <input knInput [value]="name()" (input)="name.set($any($event.target).value)" />
        </kn-field>
        <button kn-button (click)="download()">
          <kn-icon name="download" /> Скачать {{ fileName() }}
        </button>
      </div>
      <docs-code class="output" [code]="css()" label="CSS-файл стиля" />

      <h2 id="use">Как подключить</h2>
      <ol>
        <li>Положите файл рядом со своими стилями и импортируйте его после токенов Kenny.</li>
        <li>
          Поставьте атрибут <code>data-kn-preset="{{ id() }}"</code> на <code>&lt;html&gt;</code> —
          или на любой блок, если стиль нужен только в нём.
        </li>
        <li>
          Дальше файл ваш: это обычные CSS-переменные. Что означает каждая и как менять отдельные
          компоненты — в разделе <a routerLink="/docs/presets">Стили</a>.
        </li>
      </ol>
      <p>
        Конструктор меняет то, из чего складывается характер: форму, плотность, материал и цвет.
        Точные детали — геометрию переключателя, толщину линий, собственный шрифт — допишите в тот
        же файл переменными компонентов.
      </p>
    </article>
  `,
  styles: `
    .builder {
      display: grid;
      grid-template-columns: minmax(0, 17rem) minmax(0, 1fr);
      align-items: start;
      gap: var(--kn-space-6);
      margin-block-start: var(--kn-space-8);
    }

    .controls {
      display: grid;
      gap: var(--kn-space-4);
    }

    .controls > button {
      justify-self: start;
    }

    .accent-label {
      display: block;
      margin-block-end: var(--kn-space-1-5);
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
    }

    .accent-row {
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      min-block-size: var(--kn-size-md);
    }

    .swatch {
      inline-size: 3rem;
      block-size: var(--kn-size-md);
      padding: 2px;
      border: 0;
      border-radius: var(--kn-radius-field);
      background: var(--kn-color-field);
      box-shadow: inset 0 0 0 1px var(--kn-color-field-border);
      cursor: pointer;
    }

    .swatch:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .contrast {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--kn-space-2);
      margin: var(--kn-space-2) 0 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .result {
      position: sticky;
      inset-block-start: 6rem;
      min-inline-size: 0;
    }

    .stage-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--kn-space-3);
      margin-block-start: var(--kn-space-3);
    }

    .stage {
      padding: clamp(var(--kn-space-4), 4vw, var(--kn-space-8));
      border-radius: var(--kn-radius-lg);
      background-color: var(--docs-stage);
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    .stage docs-preset-preview {
      max-inline-size: 24rem;
      margin-inline: auto;
    }

    .note {
      margin: var(--kn-space-2) 0 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .file-head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--kn-space-4);
    }

    .name {
      inline-size: 16rem;
      max-inline-size: 100%;
    }

    .file-head > button {
      margin-block-start: 1.6rem;
    }

    .output {
      --docs-code-max: 24rem;
    }

    @media (max-width: 64rem) {
      .builder {
        grid-template-columns: minmax(0, 1fr);
      }

      .controls {
        grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
      }

      .result {
        position: static;
        order: -1;
      }
    }
  `,
})
export default class BuilderPage {
  private readonly document = inject(DOCUMENT);

  protected readonly presets = PRESETS;
  protected readonly choices = CHOICES;
  protected readonly keep = KEEP;
  protected readonly previewName = PREVIEW;

  protected readonly options = signal<StyleOptions>(DEFAULT_OPTIONS);
  protected readonly previewTheme = signal<string | null>('auto');
  protected readonly shared = signal(false);
  private readonly clipboard = inject(Clipboard);
  private readonly location = inject(Location);
  protected readonly name = signal('my-style');

  protected readonly id = computed(() => slug(this.name()));
  protected readonly fileName = computed(() => `${this.id()}.css`);
  private readonly baseLabel = computed(
    () => PRESETS.find((preset) => preset.id === this.options().base)?.label ?? '',
  );
  protected readonly css = computed(() => styleCss(this.id(), this.options(), this.baseLabel()));
  protected readonly changed = computed(() => styleTokens(this.options()).own.size);
  protected readonly pristine = computed(
    () => JSON.stringify(this.options()) === JSON.stringify(DEFAULT_OPTIONS),
  );

  /** Translucent surfaces need something to blur: the preview gets a wallpaper. */
  protected readonly translucent = computed(() => {
    const { base, material } = this.options();
    return material === 'translucent' || (material === null && base === 'glass');
  });

  protected readonly accentContrast = computed(() => {
    const accent = this.options().accent;
    return accent ? contrast(accent, '#ffffff') : null;
  });

  constructor() {
    // The preview is styled exactly the way an application would be: by a stylesheet
    // with the generated file, addressed through the attribute.
    let sheet: HTMLStyleElement | null = null;
    afterRenderEffect(() => {
      const css = styleCss(PREVIEW, this.options(), this.baseLabel());
      sheet ??= this.document.head.appendChild(this.document.createElement('style'));
      sheet.textContent = css;
    });
    inject(DestroyRef).onDestroy(() => sheet?.remove());

    // A shared link carries the options; keep the address in step with them afterwards
    afterNextRender(() => {
      const query = new URLSearchParams(this.document.defaultView?.location.search ?? '');
      if (query.has('style')) this.options.set(decodeOptions(query.get('style')));
      if (query.has('name')) this.name.set(query.get('name') ?? 'my-style');
    });
  }

  /** The address of this very style: the constructor opens with the same options. */
  private link(): string {
    const encoded = encodeOptions(this.options());
    const query = new URLSearchParams();
    if (encoded) query.set('style', encoded);
    if (this.id() !== 'my-style') query.set('name', this.id());
    const text = query.toString();
    return `/docs/builder${text ? `?${text}` : ''}`;
  }

  protected share(): void {
    const path = this.link();
    this.location.replaceState(path);
    const origin = this.document.defaultView?.location.origin ?? '';
    if (this.clipboard.copy(origin + this.location.prepareExternalUrl(path))) {
      this.shared.set(true);
      setTimeout(() => this.shared.set(false), 1800);
    }
  }

  /** Current value of a choice as the select sees it. */
  protected selected(key: keyof StyleOptions): string {
    const value = this.options()[key];
    return value === null ? KEEP : String(value);
  }

  protected set(key: keyof StyleOptions, value: unknown): void {
    if (value == null) return;
    const text = String(value);
    const parsed = text === KEEP ? null : key === 'radius' ? Number(text) : text;
    this.options.update((options) => ({ ...options, [key]: parsed }));
  }

  protected reset(): void {
    this.options.set(DEFAULT_OPTIONS);
  }

  protected download(): void {
    const view = this.document.defaultView;
    if (!view) return;
    const url = view.URL.createObjectURL(new Blob([this.css()], { type: 'text/css' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = this.fileName();
    link.click();
    view.URL.revokeObjectURL(url);
  }
}
