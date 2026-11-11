import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  model,
  numberAttribute,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  injectKnLabels,
  knDefaultSize,
  KnFormControl,
  KnSize,
  useControlStyles,
} from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

const HOLD_DELAY = 420;
const HOLD_INTERVAL = 70;

/**
 * Числовое поле с кнопками шага по паттерну APG Spinbutton. Значение — `number | null`.
 * Ввод разбирается с учётом локали (запятая или точка, пробелы между разрядами),
 * при потере фокуса округляется до точности шага и ограничивается `min`/`max`.
 */
@Component({
  selector: 'kn-number-input',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="control kn-control"
      [attr.data-size]="size()"
      [attr.data-invalid]="isInvalid() ? '' : null"
    >
      <button
        class="step"
        type="button"
        tabindex="-1"
        [attr.aria-label]="labels().numberInput.decrement"
        [disabled]="isDisabled() || atMin()"
        (pointerdown)="hold($event, -1)"
      >
        <kn-icon name="minus" />
      </button>
      <input
        #input
        class="input"
        type="text"
        role="spinbutton"
        inputmode="decimal"
        autocomplete="off"
        [id]="controlId"
        [value]="text()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.name]="name() || null"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuetext]="value() === null ? null : text()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-required]="required() ? 'true' : null"
        (input)="text.set($any($event.target).value)"
        (keydown)="onKeydown($event)"
        (blur)="commitText(); markTouched()"
      />
      <button
        class="step"
        type="button"
        tabindex="-1"
        [attr.aria-label]="labels().numberInput.increment"
        [disabled]="isDisabled() || atMax()"
        (pointerdown)="hold($event, 1)"
      >
        <kn-icon name="plus" />
      </button>
    </div>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles: `
    :host {
      display: inline-block;
      inline-size: var(--kn-number-input-width, 9rem);
      min-inline-size: 0;
      vertical-align: middle;
    }

    /* The well comes from the shared kn-control class */
    .control {
      display: flex;
      align-items: center;
      inline-size: 100%;
      padding-inline: var(--kn-space-1);
    }

    .input {
      flex: 1;
      min-inline-size: 0;
      block-size: 100%;
      padding: 0 var(--kn-space-1);
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-variant-numeric: tabular-nums;
      text-align: center;
      outline: none;
    }

    .input::placeholder {
      color: var(--kn-color-text-subtle);
      opacity: 1;
    }

    .input:disabled {
      cursor: not-allowed;
    }

    .step {
      position: relative;
      display: grid;
      place-items: center;
      flex: none;
      inline-size: calc(var(--_h) - 0.5rem);
      block-size: calc(var(--_h) - 0.5rem);
      padding: 0;
      border: 0;
      border-radius: calc(var(--_r) - 2px);
      background: none;
      color: var(--kn-color-text-muted);
      cursor: pointer;
      touch-action: manipulation;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .step::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    @media (hover: hover) {
      .step:hover:not(:disabled)::after {
        opacity: 1;
      }
    }

    .step:active:not(:disabled) {
      color: var(--kn-color-text);
      transform: scale(0.88);
      transition-duration: var(--kn-duration-instant);
    }

    .step:active:not(:disabled)::after {
      opacity: 1;
    }

    .step:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .step kn-icon {
      --kn-icon-size: 1rem;
    }
  `,
})
export class KnNumberInput extends KnFormControl<number | null> {
  /** Значение. Двусторонняя привязка: `[(value)]`. Пустое поле — `null`. */
  readonly value = model<number | null>(null);
  /** Нижняя граница. */
  readonly min = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Верхняя граница. */
  readonly max = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Шаг кнопок и стрелок. Определяет и точность: шаг `0.1` — один знак после запятой. */
  readonly step = input(1, { transform: numberAttribute });
  /** Текст в пустом поле. */
  readonly placeholder = input<string>('');
  /** Настройки `Intl.NumberFormat` для отображения: валюта, единицы, проценты. */
  readonly format = input<Intl.NumberFormatOptions>({});
  /** Локаль разбора и форматирования. По умолчанию `LOCALE_ID`. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());
  /** Разрешает редактирование. `false` оставляет только кнопки шага. */
  readonly editable = input(true, { transform: booleanAttribute });

  protected readonly model = this.value;
  protected readonly labels = injectKnLabels();
  protected readonly text = signal('');
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private timer: ReturnType<typeof setTimeout> | undefined;

  private readonly digits = computed(() => {
    const [, fraction = ''] = String(this.step()).split('.');
    return fraction.length;
  });
  private readonly formatter = computed(
    () =>
      new Intl.NumberFormat(this.locale(), {
        maximumFractionDigits: Math.max(this.digits(), 0),
        ...this.format(),
      }),
  );
  /** The locale's decimal mark and digit-group separator, for parsing typed text. */
  private readonly marks = computed(() => {
    const parts = new Intl.NumberFormat(this.locale()).formatToParts(12345.6);
    return {
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
      group: parts.find((part) => part.type === 'group')?.value ?? '',
    };
  });

  protected readonly atMin = computed(() => {
    const [value, min] = [this.value(), this.min()];
    return value !== null && min !== null && value <= min;
  });
  protected readonly atMax = computed(() => {
    const [value, max] = [this.value(), this.max()];
    return value !== null && max !== null && value >= max;
  });

  constructor() {
    super();
    useControlStyles();
    // The text follows the value, except while the user is typing
    effect(() => {
      const value = this.value();
      const formatter = this.formatter();
      untracked(() => this.text.set(value === null ? '' : formatter.format(value)));
    });
    inject(DestroyRef).onDestroy(() => this.stopHold());
  }

  protected override coerce(value: number | null): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  /** Увеличивает или уменьшает значение на `steps` шагов. */
  stepBy(steps: number): void {
    if (this.isDisabled()) return;
    const current = this.parse(this.text()) ?? this.value();
    const base =
      current ?? (steps > 0 ? (this.min() ?? 0) - this.step() : (this.max() ?? 0) + this.step());
    this.set(base + steps * this.step());
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.stepBy(1);
        break;
      case 'ArrowDown':
        this.stepBy(-1);
        break;
      case 'PageUp':
        this.stepBy(10);
        break;
      case 'PageDown':
        this.stepBy(-10);
        break;
      case 'Home':
        if (this.min() === null) return;
        this.set(this.min()!);
        break;
      case 'End':
        if (this.max() === null) return;
        this.set(this.max()!);
        break;
      case 'Enter':
        this.commitText();
        return;
      default:
        if (!this.editable() && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
        }
        return;
    }
    event.preventDefault();
  }

  /** Applies what was typed: an empty field is `null`, anything unparsable is rolled back. */
  protected commitText(): void {
    const raw = this.text().trim();
    if (raw === '') {
      if (this.value() !== null) this.commit(null);
      return;
    }
    const parsed = this.parse(raw);
    if (parsed === null) {
      const value = this.value();
      this.text.set(value === null ? '' : this.formatter().format(value));
      return;
    }
    this.set(parsed);
  }

  /** Press and hold: one step at once, then a repeat that keeps going until release. */
  protected hold(event: PointerEvent, direction: 1 | -1): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // Keep the focus (and the caret) in the field
    event.preventDefault();
    this.inputRef().nativeElement.focus({ preventScroll: true });
    this.stepBy(direction);
    const view = this.inputRef().nativeElement.ownerDocument.defaultView;
    const stop = (): void => {
      this.stopHold();
      view?.removeEventListener('pointerup', stop);
      view?.removeEventListener('pointercancel', stop);
    };
    view?.addEventListener('pointerup', stop);
    view?.addEventListener('pointercancel', stop);
    const repeat = (): void => {
      this.stepBy(direction);
      if ((direction > 0 && this.atMax()) || (direction < 0 && this.atMin())) return stop();
      this.timer = setTimeout(repeat, HOLD_INTERVAL);
    };
    this.timer = setTimeout(repeat, HOLD_DELAY);
  }

  private stopHold(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  private set(value: number): void {
    const factor = 10 ** this.digits();
    let next = Math.round(value * factor) / factor;
    const [min, max] = [this.min(), this.max()];
    if (min !== null) next = Math.max(min, next);
    if (max !== null) next = Math.min(max, next);
    if (next !== this.value()) this.commit(next);
    // Normalise the text even when the value did not change ("007" → "7")
    this.text.set(this.formatter().format(next));
  }

  private parse(text: string): number | null {
    const { decimal, group } = this.marks();
    let normalized = text.replace(/\s/g, '');
    if (group && group.trim()) normalized = normalized.split(group).join('');
    if (decimal !== '.') normalized = normalized.replace(decimal, '.');
    // Keep digits, one sign and one decimal point; drop currency signs and units
    normalized = normalized.replace(/[−–]/g, '-').replace(/[^\d.-]/g, '');
    if (!/^-?\d*\.?\d+$|^-?\d+\.$/.test(normalized)) return null;
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
