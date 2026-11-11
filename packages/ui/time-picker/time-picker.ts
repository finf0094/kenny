import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  model,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';
import {
  injectKnLabels,
  knDefaultSize,
  KnFormControl,
  KnSize,
  useControlStyles,
} from '@kenny/ui/core';

type Segment = 'hours' | 'minutes' | 'period';

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Поле времени из сегментов — часы, минуты и, в 12-часовом формате, половина дня. Каждый
 * сегмент — отдельный spinbutton: стрелки меняют значение, цифры набираются с клавиатуры.
 * Значение — строка `ЧЧ:ММ` в 24-часовом формате или `null`, пока время не введено целиком.
 */
@Component({
  selector: 'kn-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="control kn-control"
      role="group"
      [attr.data-size]="size()"
      [attr.data-invalid]="isInvalid() ? '' : null"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="describedBy()"
      (focusout)="onFocusOut($event)"
    >
      <input
        class="segment"
        type="text"
        inputmode="numeric"
        role="spinbutton"
        autocomplete="off"
        data-segment="hours"
        placeholder="––"
        [id]="controlId"
        [value]="hoursText()"
        [disabled]="isDisabled()"
        [attr.aria-label]="labels().timePicker.hours"
        [attr.aria-valuenow]="hours()"
        [attr.aria-valuetext]="hours() === null ? null : hoursText()"
        [attr.aria-valuemin]="hour12() ? 1 : 0"
        [attr.aria-valuemax]="hour12() ? 12 : 23"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-required]="required() ? 'true' : null"
        (focus)="onFocus('hours', $event)"
        (keydown)="onKeydown('hours', $event)"
        (input)="onInput('hours', $event)"
      />
      <span class="colon" aria-hidden="true">:</span>
      <input
        class="segment"
        type="text"
        inputmode="numeric"
        role="spinbutton"
        autocomplete="off"
        data-segment="minutes"
        placeholder="––"
        [value]="minutesText()"
        [disabled]="isDisabled()"
        [attr.aria-label]="labels().timePicker.minutes"
        [attr.aria-valuenow]="minutes()"
        aria-valuemin="0"
        aria-valuemax="59"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        (focus)="onFocus('minutes', $event)"
        (keydown)="onKeydown('minutes', $event)"
        (input)="onInput('minutes', $event)"
      />
      @if (hour12()) {
        <input
          class="segment period"
          type="text"
          inputmode="none"
          role="spinbutton"
          autocomplete="off"
          data-segment="period"
          [value]="periodText()"
          [disabled]="isDisabled()"
          [attr.aria-label]="labels().timePicker.period"
          [attr.aria-valuenow]="pm() ? 1 : 0"
          [attr.aria-valuetext]="periodText()"
          aria-valuemin="0"
          aria-valuemax="1"
          (focus)="onFocus('period', $event)"
          (keydown)="onKeydown('period', $event)"
          (input)="onInput('period', $event)"
        />
      }
    </div>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles: `
    :host {
      display: inline-block;
      min-inline-size: 0;
      vertical-align: middle;
    }

    /* The well comes from the shared kn-control class. Time reads left to right everywhere. */
    .control {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      direction: ltr;
      padding-inline: var(--kn-field-padding, var(--kn-space-2));
      font-variant-numeric: tabular-nums;
    }

    .segment {
      box-sizing: content-box;
      inline-size: 2ch;
      block-size: 1.5em;
      padding: 0 0.1875rem;
      border: 0;
      border-radius: var(--kn-radius-xs);
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-variant-numeric: inherit;
      text-align: center;
      caret-color: transparent;
      outline: none;
      cursor: default;
    }

    .segment.period {
      inline-size: 2.4ch;
      margin-inline-start: var(--kn-space-1);
    }

    .segment::placeholder {
      color: var(--kn-color-text-subtle);
      opacity: 1;
    }

    .segment::selection {
      background: transparent;
    }

    /* The focused segment is a filled chip: the caret is hidden, the whole value is replaced */
    .segment:focus {
      background: var(--kn-time-picker-active, var(--kn-color-accent));
      color: var(--kn-color-on-accent);
    }

    .segment:focus::placeholder {
      color: var(--kn-color-on-accent);
    }

    .segment:disabled {
      cursor: not-allowed;
    }

    .colon {
      color: var(--kn-color-text-muted);
    }
  `,
})
export class KnTimePicker extends KnFormControl<string | null> {
  /** Время в формате `ЧЧ:ММ` (24 часа) или `null`. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<string | null>(null);
  /** Шаг минут для стрелок. Набрать с клавиатуры можно любую минуту. */
  readonly step = input(1, { transform: numberAttribute });
  /** 12- или 24-часовой вид. По умолчанию — как принято в локали. */
  readonly hourCycle = input<12 | 24 | undefined>(undefined);
  /** Локаль, из которой берётся вид часов и обозначения половины дня. По умолчанию `LOCALE_ID`. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());

  protected readonly model = this.value;
  protected readonly labels = injectKnLabels();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Hour of the day, 0–23, whatever the display. */
  protected readonly hours = signal<number | null>(null);
  protected readonly minutes = signal<number | null>(null);
  /** Digits typed into the focused segment so far. */
  private typed = '';

  protected readonly hour12 = computed(() => {
    const cycle = this.hourCycle();
    if (cycle) return cycle === 12;
    const resolved = new Intl.DateTimeFormat(this.locale(), { hour: 'numeric' }).resolvedOptions();
    return resolved.hourCycle === 'h12' || resolved.hourCycle === 'h11';
  });
  protected readonly pm = computed(() => (this.hours() ?? 0) >= 12);
  protected readonly hoursText = computed(() => {
    const hours = this.hours();
    if (hours === null) return '';
    return pad(this.hour12() ? hours % 12 || 12 : hours);
  });
  protected readonly minutesText = computed(() => {
    const minutes = this.minutes();
    return minutes === null ? '' : pad(minutes);
  });
  private readonly periodNames = computed(() => {
    const format = new Intl.DateTimeFormat(this.locale(), { hour: 'numeric', hour12: true });
    const name = (hour: number): string =>
      format.formatToParts(new Date(2000, 0, 1, hour)).find((part) => part.type === 'dayPeriod')
        ?.value ?? (hour < 12 ? 'AM' : 'PM');
    return [name(9), name(15)];
  });
  protected readonly periodText = computed(() => this.periodNames()[this.pm() ? 1 : 0]);

  constructor() {
    super();
    useControlStyles();
    // The segments follow the value; an unfinished entry is kept until the value changes
    effect(() => {
      const match = /^(\d{1,2}):(\d{2})/.exec(this.value() ?? '');
      untracked(() => {
        if (match && Number(match[1]) < 24 && Number(match[2]) < 60) {
          this.hours.set(Number(match[1]));
          this.minutes.set(Number(match[2]));
        } else if (this.value() === null && this.hours() !== null && this.minutes() !== null) {
          this.hours.set(null);
          this.minutes.set(null);
        }
      });
    });
  }

  protected override coerce(value: string | null): string | null {
    return typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value) ? value.slice(0, 5) : null;
  }

  protected onFocus(_segment: Segment, event: FocusEvent): void {
    this.typed = '';
    (event.target as HTMLInputElement).select();
  }

  protected onKeydown(segment: Segment, event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.spin(segment, 1);
        break;
      case 'ArrowDown':
        this.spin(segment, -1);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        // The control itself is always left to right, so the arrows are not mirrored
        this.move(event.target as HTMLElement, event.key === 'ArrowRight' ? 1 : -1);
        break;
      case 'Home':
      case 'End':
        if (segment === 'hours') this.setHours(event.key === 'Home' ? 0 : 23);
        else if (segment === 'minutes') this.setMinutes(event.key === 'Home' ? 0 : 59);
        else this.setPm(event.key === 'End');
        break;
      case 'Backspace':
      case 'Delete':
        this.typed = '';
        if (segment === 'hours') this.hours.set(null);
        else if (segment === 'minutes') this.minutes.set(null);
        this.sync();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  /** Typing arrives as an input event on every keyboard, including on-screen ones. */
  protected onInput(segment: Segment, event: Event): void {
    const field = event.target as HTMLInputElement;
    const text = field.value;
    if (segment === 'period') {
      const letter = text.trim().slice(-1).toLowerCase();
      const [am, pm] = this.periodNames().map((name) => name[0]?.toLowerCase());
      if (letter && (letter === pm || letter === 'p')) this.setPm(true);
      else if (letter && (letter === am || letter === 'a')) this.setPm(false);
      this.restore(field, this.periodText());
      return;
    }
    const digit = text.replace(/\D/g, '').slice(-1);
    if (!digit) {
      this.restore(field, segment === 'hours' ? this.hoursText() : this.minutesText());
      return;
    }
    this.typed = (this.typed + digit).slice(-2);
    const number = Number(this.typed);
    const twelve = this.hour12();
    const max = segment === 'minutes' ? 59 : twelve ? 12 : 23;
    const value = Math.min(number, max);
    if (segment === 'hours') {
      // "9" then "PM" is 21:00; "12 AM" is midnight
      this.setHours(twelve ? (value % 12) + (this.pm() ? 12 : 0) : value);
    } else {
      this.setMinutes(value);
    }
    this.restore(field, segment === 'hours' ? this.hoursText() : this.minutesText());
    // Two digits, or a first digit that cannot start a longer number: on to the next segment
    if (this.typed.length === 2 || number * 10 > max) {
      this.typed = '';
      this.move(field, 1);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.element.contains(event.relatedTarget as Node | null)) this.markTouched();
  }

  private spin(segment: Segment, direction: 1 | -1): void {
    this.typed = '';
    if (segment === 'hours') {
      this.setHours(((this.hours() ?? (direction > 0 ? -1 : 0)) + direction + 24) % 24);
    } else if (segment === 'minutes') {
      const step = Math.max(1, this.step());
      const current = this.minutes();
      // From an empty segment the first press lands on a round value
      const next =
        current === null
          ? direction > 0
            ? 0
            : 60 - step
          : (Math.round(current / step) * step + direction * step + 60) % 60;
      this.setMinutes(next);
    } else {
      this.setPm(!this.pm());
    }
  }

  private setHours(hours: number): void {
    this.hours.set(hours);
    this.sync();
  }

  private setMinutes(minutes: number): void {
    this.minutes.set(minutes);
    this.sync();
  }

  private setPm(pm: boolean): void {
    const hours = this.hours() ?? 0;
    this.setHours((hours % 12) + (pm ? 12 : 0));
  }

  /** Publishes the value once both parts are known; an incomplete time is `null`. */
  private sync(): void {
    const [hours, minutes] = [this.hours(), this.minutes()];
    const next = hours === null || minutes === null ? null : `${pad(hours)}:${pad(minutes)}`;
    if (next !== this.value()) this.commit(next);
  }

  /** Puts the canonical text back and keeps it selected, so the next digit replaces it. */
  private restore(field: HTMLInputElement, text: string): void {
    field.value = text;
    field.select();
  }

  private move(from: HTMLElement, delta: 1 | -1): void {
    const segments = Array.from(this.element.querySelectorAll<HTMLInputElement>('.segment'));
    segments[segments.indexOf(from as HTMLInputElement) + delta]?.focus();
  }
}
