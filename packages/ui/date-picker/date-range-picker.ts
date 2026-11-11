import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  LOCALE_ID,
  model,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { _IdGenerator, CdkTrapFocus } from '@angular/cdk/a11y';
import {
  injectKnLabels,
  KnAnchoredOverlay,
  knDefaultSize,
  KnFormControl,
  KnSize,
  useControlStyles,
} from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';
import { KnCalendar, KnCalendarRange } from './calendar';
import { formatDate, startOfDay } from './date-utils';

/** Период: оба конца включительно. */
export interface KnDateRange {
  start: Date;
  end: Date;
}

/** Готовый период в боковом списке: «Последние 7 дней», «Этот месяц». */
export interface KnDateRangePreset {
  label: string;
  range: KnDateRange;
}

/**
 * Выбор периода двумя нажатиями в одном календаре: первый день, затем последний — в любом
 * порядке. Значение — `{ start, end }` или `null`; пока выбран один день, оно не меняется.
 */
@Component({
  selector: 'kn-date-range-picker',
  imports: [KnIcon, KnCalendar, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #control
      class="control kn-control"
      [attr.data-size]="size()"
      [attr.data-invalid]="isInvalid() ? '' : null"
    >
      <button
        #trigger
        class="trigger"
        type="button"
        aria-haspopup="dialog"
        [id]="controlId"
        [disabled]="isDisabled()"
        [attr.aria-expanded]="overlay.isOpen()"
        [attr.aria-label]="ariaLabel() ? ariaLabel() + ': ' + text() : null"
        [attr.aria-labelledby]="labelledBy() ? labelledBy() + ' ' + valueId : null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        (click)="toggle()"
        (keydown.arrowDown)="$event.preventDefault(); open()"
        (blur)="onBlur()"
      >
        <kn-icon name="calendar" />
        <span class="value" [id]="valueId" [class.placeholder]="!value()">{{ text() }}</span>
      </button>
      @if (clearable() && value() && !isDisabled()) {
        <button
          class="clear"
          type="button"
          [attr.aria-label]="labels().datePicker.clear"
          (click)="clear()"
        >
          <kn-icon name="x" />
        </button>
      }
    </div>

    <ng-template #panel>
      <div
        class="panel"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="labels().datePicker.rangeDialog"
        cdkTrapFocus
      >
        @if (presets().length) {
          <ul class="presets">
            @for (preset of presets(); track preset.label) {
              <li>
                <button
                  class="preset"
                  type="button"
                  [attr.aria-pressed]="isActive(preset)"
                  (click)="apply(preset.range)"
                >
                  {{ preset.label }}
                </button>
              </li>
            }
          </ul>
        }
        <div class="main">
          <kn-calendar
            [range]="draft()"
            [value]="draft().start"
            [min]="min()"
            [max]="max()"
            [dateFilter]="dateFilter()"
            [locale]="locale()"
            (pick)="onPick($event)"
          />
          <p class="step" role="status">
            {{
              draft().start && !draft().end
                ? labels().datePicker.rangeEnd
                : labels().datePicker.rangeStart
            }}
          </p>
        </div>
      </div>
    </ng-template>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles: `
    :host {
      display: block;
      min-inline-size: 0;
    }

    /* The well comes from the shared kn-control class */
    .control {
      display: flex;
      align-items: center;
      padding-inline-end: var(--kn-space-1);
    }

    /* Focus is drawn by the well: it reacts to aria-expanded and to :has(:focus-visible) */
    .control:has(.trigger:focus-visible),
    .control:has(.trigger[aria-expanded='true']) {
      outline: var(--kn-field-focus-width) solid var(--kn-color-focus);
      outline-offset: -1px;
    }

    .trigger {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      min-inline-size: 0;
      block-size: 100%;
      padding: 0 var(--kn-space-1) 0 var(--kn-field-padding, var(--kn-space-3));
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-variant-numeric: tabular-nums;
      text-align: start;
      cursor: pointer;
      outline: none;
    }

    .trigger:disabled {
      cursor: not-allowed;
    }

    .trigger kn-icon {
      --kn-icon-size: 1.125rem;
      flex: none;
      color: var(--kn-color-text-muted);
    }

    .value {
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .placeholder {
      color: var(--kn-color-text-subtle);
    }

    .clear {
      display: grid;
      place-items: center;
      flex: none;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-control);
      background: none;
      color: var(--kn-color-text-subtle);
      cursor: pointer;
    }

    .clear:hover {
      color: var(--kn-color-text);
      background: var(--kn-color-hover);
    }

    .clear:focus-visible,
    .preset:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .clear kn-icon {
      --kn-icon-size: 1rem;
    }

    .panel {
      display: flex;
      gap: var(--kn-space-3);
      max-inline-size: calc(100vw - 1rem);
      padding: var(--kn-space-3);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-date-picker-panel-bg, var(--kn-color-surface-raised));
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-date-picker-panel-shadow, var(--kn-elevation-popup));
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .presets {
      display: grid;
      align-content: start;
      gap: 2px;
      margin: 0;
      padding: 0 var(--kn-space-3) 0 0;
      border-inline-end: 1px solid var(--kn-color-border);
      list-style: none;
    }

    .preset {
      inline-size: 100%;
      padding: var(--kn-space-1-5) var(--kn-space-2);
      border: 0;
      border-radius: var(--kn-radius-sm);
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-size: var(--kn-text-sm);
      text-align: start;
      white-space: nowrap;
      cursor: pointer;
    }

    .preset:hover {
      background: var(--kn-color-hover);
    }

    .preset[aria-pressed='true'] {
      background: var(--kn-color-accent-soft);
      color: var(--kn-color-accent-text);
      font-weight: var(--kn-weight-medium);
    }

    .step {
      margin: var(--kn-space-2) 0 0;
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
      text-align: center;
    }

    @media (max-width: 30rem) {
      .panel {
        flex-direction: column;
      }

      .presets {
        display: flex;
        flex-wrap: wrap;
        padding: 0 0 var(--kn-space-2);
        border-inline-end: 0;
        border-block-end: 1px solid var(--kn-color-border);
      }

      .preset {
        inline-size: auto;
      }
    }
  `,
})
export class KnDateRangePicker extends KnFormControl<KnDateRange | null> {
  /** Выбранный период. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<KnDateRange | null>(null);
  /** Текст, пока период не выбран. По умолчанию — из `provideKnLabels`. */
  readonly placeholder = input<string>();
  /** Самая ранняя доступная дата. */
  readonly min = input<Date | null | undefined>(null);
  /** Самая поздняя доступная дата. */
  readonly max = input<Date | null | undefined>(null);
  /** Возвращает `false` для дат, которые нельзя выбрать концом периода. */
  readonly dateFilter = input<((date: Date) => boolean) | null>(null);
  /** Готовые периоды слева от календаря. */
  readonly presets = input<KnDateRangePreset[]>([]);
  /** Показывает кнопку очистки, когда период выбран. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Локаль формата и календаря. По умолчанию `LOCALE_ID`. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());

  protected readonly model = this.value;
  protected readonly labels = injectKnLabels();
  protected readonly overlay = new KnAnchoredOverlay();
  protected readonly valueId = inject(_IdGenerator).getId('kn-range-value-');
  private readonly injector = inject(Injector);

  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly calendar = viewChild(KnCalendar);

  /** What the calendar shows while the dialog is open: the value, or a range in the making. */
  protected readonly draft = signal<KnCalendarRange>({ start: null, end: null });

  protected readonly text = computed(() => {
    const value = this.value();
    if (!value) return this.placeholder() ?? this.labels().datePicker.rangePlaceholder;
    return `${formatDate(value.start, this.locale())} – ${formatDate(value.end, this.locale())}`;
  });

  constructor() {
    super();
    useControlStyles();
    this.overlay.dismissed.subscribe((reason) => void this.close(reason === 'escape'));
  }

  protected override coerce(value: KnDateRange | null): KnDateRange | null {
    return value?.start && value.end ? value : null;
  }

  /** Открывает календарь и переносит фокус на первый день периода. */
  open(): void {
    if (this.overlay.isOpen() || this.isDisabled()) return;
    const value = this.value();
    this.draft.set({ start: value?.start ?? null, end: value?.end ?? null });
    this.overlay.open({
      origin: this.control(),
      template: this.panel(),
      placement: 'bottom-start',
      offset: 6,
      transformOriginOn: '.panel',
    });
    afterNextRender(() => this.calendar()?.focus(), { injector: this.injector });
  }

  /** Закрывает календарь. Незавершённый выбор отбрасывается. */
  async close(restoreFocus = true): Promise<void> {
    if (restoreFocus && this.overlay.isOpen()) this.trigger().nativeElement.focus();
    await this.overlay.close();
  }

  protected toggle(): void {
    if (this.overlay.isOpen()) void this.close();
    else this.open();
  }

  protected onPick(date: Date): void {
    const { start, end } = this.draft();
    // A click on a finished range starts a new one
    if (!start || end) {
      this.draft.set({ start: date, end: null });
      return;
    }
    const [from, to] = [start, date].sort((a, b) => a.getTime() - b.getTime());
    this.apply({ start: from, end: to });
  }

  protected apply(range: KnDateRange): void {
    const next = { start: startOfDay(range.start), end: startOfDay(range.end) };
    this.draft.set(next);
    this.commit(next);
    void this.close();
  }

  protected clear(): void {
    this.commit(null);
    this.trigger().nativeElement.focus();
  }

  protected isActive(preset: KnDateRangePreset): boolean {
    const value = this.value();
    return (
      !!value &&
      startOfDay(preset.range.start).getTime() === startOfDay(value.start).getTime() &&
      startOfDay(preset.range.end).getTime() === startOfDay(value.end).getTime()
    );
  }

  protected onBlur(): void {
    if (!this.overlay.isOpen()) this.markTouched();
  }
}
