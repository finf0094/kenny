import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  LOCALE_ID,
  model,
  output,
  signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { KnIcon } from '@kenny/ui/icon';
import { addDays, addMonths, firstDayOfWeek, isoDate, sameDay, startOfDay } from './date-utils';

interface Cell {
  date: Date;
  iso: string;
  day: number;
  label: string;
  today: boolean;
  selected: boolean;
  disabled: boolean;
}

/**
 * Календарь на один месяц. Сетка дат по паттерну APG: один день в порядке
 * табуляции, стрелки двигают фокус по дням и неделям, PageUp/PageDown — по месяцам.
 */
@Component({
  selector: 'kn-calendar',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="header">
      <button class="nav" type="button" aria-label="Предыдущий месяц" (click)="shiftMonth(-1)">
        <kn-icon name="chevron-left" />
      </button>
      <div class="title" [id]="titleId" aria-live="polite">{{ title() }}</div>
      <button class="nav" type="button" aria-label="Следующий месяц" (click)="shiftMonth(1)">
        <kn-icon name="chevron-right" />
      </button>
    </div>
    <table class="grid" role="grid" [attr.aria-labelledby]="titleId" (keydown)="onKeydown($event)">
      <thead>
        <tr>
          @for (weekday of weekdays(); track weekday.long) {
            <th scope="col"><abbr [title]="weekday.long">{{ weekday.short }}</abbr></th>
          }
        </tr>
      </thead>
      @for (key of [monthKey()]; track key) {
        <tbody [attr.data-dir]="direction()">
          @for (week of weeks(); track $index) {
            <tr>
              @for (cell of week; track $index) {
                @if (cell) {
                  <td role="gridcell" [attr.aria-selected]="cell.selected">
                    <button
                      class="day"
                      type="button"
                      [attr.data-date]="cell.iso"
                      [attr.data-today]="cell.today ? '' : null"
                      [attr.aria-label]="cell.label"
                      [attr.aria-current]="cell.today ? 'date' : null"
                      [attr.aria-disabled]="cell.disabled ? 'true' : null"
                      [tabindex]="cell.iso === focusedIso() ? 0 : -1"
                      (click)="select(cell)"
                      (focus)="focused.set(cell.date)"
                    >
                      {{ cell.day }}
                    </button>
                  </td>
                } @else {
                  <td role="gridcell"></td>
                }
              }
            </tr>
          }
        </tbody>
      }
    </table>
  `,
  styles: `
    :host {
      --_cell: 2.25rem;
      display: block;
      inline-size: max-content;
      user-select: none;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block-end: var(--kn-space-2);
    }

    .title {
      font-weight: var(--kn-weight-semibold);
      letter-spacing: var(--kn-tracking-snug);
    }

    .title::first-letter {
      text-transform: uppercase;
    }

    .nav {
      display: grid;
      place-items: center;
      inline-size: 2rem;
      block-size: 2rem;
      padding: 0;
      border: 0;
      border-radius: var(--kn-radius-full);
      background: none;
      color: var(--kn-color-accent-text);
      cursor: pointer;
    }

    .nav:hover {
      background: var(--kn-color-hover);
    }

    :host-context([dir='rtl']) .nav kn-icon {
      transform: scaleX(-1);
    }

    .grid {
      border-collapse: collapse;
      overflow: hidden;
    }

    th {
      inline-size: var(--_cell);
      block-size: 1.75rem;
      font-size: var(--kn-text-xs);
      font-weight: var(--kn-weight-medium);
      color: var(--kn-color-text-subtle);
    }

    abbr {
      text-decoration: none;
    }

    td {
      padding: 0;
    }

    tbody {
      animation: calendar-in var(--kn-duration-normal) var(--kn-ease-out);
    }

    tbody[data-dir='-1'] {
      --_from: -14px;
    }

    @keyframes calendar-in {
      from {
        opacity: 0;
        transform: translateX(calc(var(--_from, 14px) * var(--kn-dir)));
      }
    }

    .day {
      position: relative;
      display: grid;
      place-items: center;
      inline-size: var(--_cell);
      block-size: var(--_cell);
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-size: var(--kn-text-md);
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      isolation: isolate;
    }

    .day::before {
      content: '';
      position: absolute;
      inset: 2px;
      z-index: -1;
      border-radius: 50%;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    .day:hover::before {
      opacity: 1;
    }

    .day[data-today] {
      color: var(--kn-color-accent-text);
      font-weight: var(--kn-weight-semibold);
    }

    td[aria-selected='true'] .day {
      color: var(--kn-color-on-accent);
      font-weight: var(--kn-weight-semibold);
    }

    td[aria-selected='true'] .day::before {
      background: var(--kn-color-accent);
      opacity: 1;
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring-bouncy);
    }

    .day[aria-disabled='true'] {
      color: var(--kn-color-text-disabled);
      cursor: not-allowed;
    }

    .day[aria-disabled='true']::before {
      display: none;
    }

    .nav:focus-visible,
    .day:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -2px;
    }
  `,
})
export class KnCalendar {
  /** Выбранная дата. Двусторонняя привязка: `[(value)]`. */
  readonly value = model<Date | null>(null);
  /** Самая ранняя доступная дата. */
  readonly min = input<Date | null>(null);
  /** Самая поздняя доступная дата. */
  readonly max = input<Date | null>(null);
  /** Возвращает `false` для дат, которые нельзя выбрать. */
  readonly dateFilter = input<((date: Date) => boolean) | null>(null);
  /** Локаль для названий и первого дня недели. По умолчанию `LOCALE_ID`. */
  readonly locale = input<string>(inject(LOCALE_ID));
  /** Пользователь выбрал дату (срабатывает и при повторном выборе той же даты). */
  readonly pick = output<Date>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly dir = inject(Directionality, { optional: true });
  protected readonly titleId = inject(_IdGenerator).getId('kn-calendar-');

  /** The day that owns the tab stop; follows the value until the user navigates. */
  protected readonly focused = linkedSignal(() => startOfDay(this.value() ?? new Date()));
  protected readonly direction = signal<1 | -1>(1);
  protected readonly focusedIso = computed(() => isoDate(this.focused()));
  protected readonly monthKey = computed(
    () => `${this.focused().getFullYear()}-${this.focused().getMonth()}`,
  );

  protected readonly title = computed(() =>
    new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' }).format(this.focused()),
  );

  protected readonly weekdays = computed(() => {
    const first = firstDayOfWeek(this.locale());
    const short = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const long = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });
    // 2 Jan 2000 was a Sunday.
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2000, 0, 2 + first + i);
      return { short: short.format(date), long: long.format(date) };
    });
  });

  protected readonly weeks = computed(() => {
    const focused = this.focused();
    const year = focused.getFullYear();
    const month = focused.getMonth();
    const label = new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' });
    const today = new Date();
    const offset = (new Date(year, month, 1).getDay() - firstDayOfWeek(this.locale()) + 7) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const cells: (Cell | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day);
      cells.push({
        date,
        day,
        iso: isoDate(date),
        label: label.format(date),
        today: sameDay(date, today),
        selected: sameDay(date, this.value()),
        disabled: this.isDisabled(date),
      });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  });

  /** Переносит фокус на активный день. */
  focus(): void {
    this.element.querySelector<HTMLElement>(`[data-date="${this.focusedIso()}"]`)?.focus();
  }

  protected isDisabled(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    return (
      (!!min && date < startOfDay(min)) ||
      (!!max && date > startOfDay(max)) ||
      this.dateFilter()?.(date) === false
    );
  }

  protected select(cell: Cell): void {
    if (cell.disabled) return;
    this.value.set(cell.date);
    this.pick.emit(cell.date);
  }

  protected shiftMonth(delta: number): void {
    this.direction.set(delta > 0 ? 1 : -1);
    this.focused.set(addMonths(this.focused(), delta));
  }

  protected onKeydown(event: KeyboardEvent): void {
    const current = this.focused();
    const inline = this.dir?.value === 'rtl' ? -1 : 1;
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(current, -inline);
        break;
      case 'ArrowRight':
        next = addDays(current, inline);
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'Home':
        next = addDays(current, -((current.getDay() - firstDayOfWeek(this.locale()) + 7) % 7));
        break;
      case 'End':
        next = addDays(current, 6 - ((current.getDay() - firstDayOfWeek(this.locale()) + 7) % 7));
        break;
      case 'PageUp':
        next = addMonths(current, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(current, event.shiftKey ? 12 : 1);
        break;
    }
    if (!next) return;
    event.preventDefault();
    this.direction.set(next > current ? 1 : -1);
    this.focused.set(next);
    afterNextRender(() => this.focus(), { injector: this.injector });
  }
}
