import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  LOCALE_ID,
  model,
  signal,
  TemplateRef,
  untracked,
  viewChild,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  KnAnchoredOverlay,
  knDefaultSize,
  KnFormControl,
  KnSize,
  useControlStyles,
  injectKnLabels,
} from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';
import { KnCalendar } from './calendar';
import { datePattern, formatDate, parseDate, startOfDay } from './date-utils';

/**
 * Поле даты: дату можно ввести с клавиатуры в формате локали или выбрать в
 * календаре, который открывается как диалог с ловушкой фокуса.
 */
@Component({
  selector: 'kn-date-picker',
  imports: [KnIcon, KnCalendar, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #control
      class="control kn-control"
      [attr.data-size]="size()"
      [attr.data-invalid]="isInvalid() ? '' : null"
    >
      <input
        class="input"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        [id]="controlId"
        [value]="text()"
        [placeholder]="placeholder() || pattern()"
        [disabled]="isDisabled()"
        [attr.name]="name() || null"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-required]="required() ? 'true' : null"
        (input)="text.set($any($event.target).value)"
        (change)="commitText()"
        (keydown.enter)="commitText()"
        (keydown.alt.arrowDown)="$event.preventDefault(); open()"
        (blur)="onBlur()"
      />
      <button
        #toggleButton
        class="toggle"
        type="button"
        aria-haspopup="dialog"
        [attr.aria-label]="toggleLabel()"
        [attr.aria-expanded]="overlay.isOpen()"
        [disabled]="isDisabled()"
        (click)="toggle()"
      >
        <kn-icon name="calendar" />
      </button>
    </div>

    <ng-template #panel>
      <div
        class="panel"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="labels().datePicker.dialog"
        cdkTrapFocus
      >
        <kn-calendar
          [value]="value()"
          [min]="min()"
          [max]="max()"
          [dateFilter]="dateFilter()"
          [locale]="locale()"
          (pick)="onPick($event)"
        />
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
      padding-inline: var(--kn-field-padding, var(--kn-space-3)) var(--kn-space-1);
    }

    .input {
      flex: 1;
      min-inline-size: 0;
      block-size: 100%;
      padding: 0;
      border: 0;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-variant-numeric: tabular-nums;
      outline: none;
    }

    .input::placeholder {
      color: var(--kn-color-text-subtle);
      opacity: 1;
    }

    .toggle {
      display: grid;
      place-items: center;
      flex: none;
      inline-size: 1.875rem;
      block-size: 1.875rem;
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-control);
      background: none;
      color: var(--kn-color-text-muted);
      cursor: pointer;
    }

    .toggle:hover:not(:disabled),
    .toggle[aria-expanded='true'] {
      color: var(--kn-color-accent-text);
      background: var(--kn-color-accent-soft);
    }

    .toggle:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }

    .toggle kn-icon {
      --kn-icon-size: 1.125rem;
    }

    .panel {
      padding: var(--kn-space-3);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-date-picker-panel-bg, var(--kn-color-surface-raised));
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-date-picker-panel-shadow, var(--kn-elevation-popup));
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .panel[data-kn-state='closing'] {
      animation: kn-pop-out var(--kn-duration-fast) var(--kn-ease-in) forwards;
      pointer-events: none;
    }
  `,
})
export class KnDatePicker extends KnFormControl<Date | null> {
  protected readonly labels = injectKnLabels();
  /** Выбранная дата. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<Date | null>(null);
  /** Самая ранняя доступная дата. */
  readonly min = input<Date | null | undefined>(null);
  /** Самая поздняя доступная дата. */
  readonly max = input<Date | null | undefined>(null);
  /** Возвращает `false` для дат, которые нельзя выбрать. */
  readonly dateFilter = input<((date: Date) => boolean) | null>(null);
  /** Подсказка в пустом поле. По умолчанию — формат даты локали. */
  readonly placeholder = input<string>('');
  /** Локаль формата и календаря. По умолчанию `LOCALE_ID`. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());

  protected readonly model = this.value;
  protected readonly overlay = new KnAnchoredOverlay();
  private readonly injector = inject(Injector);

  private readonly control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggleButton');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly calendar = viewChild(KnCalendar);

  protected readonly text = signal('');
  protected readonly pattern = computed(() => datePattern(this.locale(), this.labels().datePicker));
  protected readonly toggleLabel = computed(() => {
    const value = this.value();
    const labels = this.labels().datePicker;
    return value
      ? labels.change(new Intl.DateTimeFormat(this.locale(), { dateStyle: 'long' }).format(value))
      : labels.choose;
  });

  constructor() {
    super();
    useControlStyles();
    effect(() => {
      const value = this.value();
      const locale = this.locale();
      untracked(() => this.text.set(value ? formatDate(value, locale) : ''));
    });
    this.overlay.dismissed.subscribe((reason) => void this.close(reason === 'escape'));
  }

  /** Открывает календарь и переносит фокус на выбранный день. */
  open(): void {
    if (this.overlay.isOpen() || this.isDisabled()) {
      return;
    }
    this.overlay.open({
      origin: this.control(),
      template: this.panel(),
      placement: 'bottom-start',
      offset: 6,
      transformOriginOn: '.panel',
    });
    afterNextRender(() => this.calendar()?.focus(), { injector: this.injector });
  }

  /** Закрывает календарь. */
  async close(restoreFocus = true): Promise<void> {
    if (restoreFocus && this.overlay.isOpen()) {
      this.toggleButton().nativeElement.focus();
    }
    await this.overlay.close();
  }

  protected toggle(): void {
    if (this.overlay.isOpen()) {
      void this.close();
    } else {
      this.open();
    }
  }

  protected onPick(date: Date): void {
    this.commit(date);
    void this.close();
  }

  /** Applies typed text; anything that is not a selectable date is rolled back on blur. */
  protected commitText(): void {
    const raw = this.text().trim();
    if (raw === '') {
      if (this.value() !== null) this.commit(null);
      return;
    }
    const parsed = parseDate(raw, this.locale());
    if (parsed && this.isSelectable(parsed)) {
      this.commit(parsed);
      this.text.set(formatDate(parsed, this.locale()));
    }
  }

  protected onBlur(): void {
    this.commitText();
    const value = this.value();
    this.text.set(value ? formatDate(value, this.locale()) : '');
    this.markTouched();
  }

  private isSelectable(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    return (
      (!min || date >= startOfDay(min)) &&
      (!max || date <= startOfDay(max)) &&
      this.dateFilter()?.(date) !== false
    );
  }
}
