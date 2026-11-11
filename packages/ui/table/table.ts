import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  TemplateRef,
} from '@angular/core';
import { KnCheckbox } from '@kenny/ui/checkbox';
import { knDefaultSize, KnSize, injectKnLabels } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

export interface KnColumn<T> {
  /** Ключ колонки и, по умолчанию, имя свойства строки. */
  key: string;
  /** Заголовок. */
  header: string;
  /** Прячет заголовок визуально, оставляя его скринридерам: для колонок с кнопками действий. */
  headerHidden?: boolean;
  /** Можно ли сортировать по колонке. */
  sortable?: boolean;
  /** Выравнивание содержимого. Числа обычно выравнивают по `end`. */
  align?: 'start' | 'center' | 'end';
  /** Ширина колонки (CSS-значение). */
  width?: string;
  /** Достаёт значение для отображения и сортировки, если оно не лежит в `row[key]`. */
  value?: (row: T) => unknown;
}

export interface KnSort {
  key: string;
  direction: 'asc' | 'desc';
}

/** Шаблон ячейки: `<ng-template knCell="status" let-row>…</ng-template>`. */
@Directive({ selector: 'ng-template[knCell]' })
export class KnCell<T = unknown> {
  /** Ключ колонки, для которой предназначен шаблон. */
  readonly key = input.required<string>({ alias: 'knCell' });
  readonly template =
    inject<TemplateRef<{ $implicit: T; value: unknown; index: number }>>(TemplateRef);
}

/**
 * Таблица данных на нативном `<table>`: сортировка по клику на заголовок
 * (`aria-sort`), выбор строк флажками, собственные шаблоны ячеек.
 */
@Component({
  selector: 'kn-table',
  imports: [KnCheckbox, KnIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table
      [attr.aria-label]="ariaLabel()"
      [attr.aria-rowcount]="virtual() ? rows().length + 1 : null"
    >
      <thead>
        <tr>
          @if (selectable()) {
            <th class="check" scope="col">
              <kn-checkbox
                size="sm"
                [aria-label]="labels().table.selectAll"
                [checked]="allSelected()"
                [indeterminate]="someSelected()"
                [disabled]="data().length === 0"
                (checkedChange)="toggleAll($event)"
              />
            </th>
          }
          @for (column of columns(); track column.key) {
            <th
              scope="col"
              [style.inline-size]="column.width ?? null"
              [attr.data-align]="column.align ?? 'start'"
              [attr.aria-sort]="column.sortable ? ariaSort(column.key) : null"
            >
              @if (column.sortable) {
                <button class="sort" type="button" (click)="toggleSort(column.key)">
                  {{ column.header }}
                  <kn-icon
                    class="arrow"
                    name="arrow-up"
                    [attr.data-direction]="sort()?.key === column.key ? sort()?.direction : null"
                  />
                </button>
              } @else if (column.headerHidden) {
                <span class="sr-only">{{ column.header }}</span>
              } @else {
                {{ column.header }}
              }
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @if (window().before) {
          <tr class="spacer" aria-hidden="true" [style.block-size.px]="window().before">
            <td [attr.colspan]="columns().length + (selectable() ? 1 : 0)"></td>
          </tr>
        }
        @for (item of window().items; track trackRow(item.row, item.index)) {
          @let row = item.row;
          @let i = item.index;
          <tr
            [attr.data-selected]="selectable() && isSelected(row) ? '' : null"
            [attr.aria-rowindex]="virtual() ? i + 2 : null"
            [style.--kn-index]="i"
          >
            @if (selectable()) {
              <td class="check">
                <kn-checkbox
                  size="sm"
                  [aria-label]="labels().table.selectRow(i + 1)"
                  [checked]="isSelected(row)"
                  (checkedChange)="toggleRow(row, $event)"
                />
              </td>
            }
            @for (column of columns(); track column.key) {
              <td [attr.data-align]="column.align ?? 'start'">
                @if (cellTemplate(column.key); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="{
                      $implicit: row,
                      value: cellValue(row, column),
                      index: i,
                    }"
                  />
                } @else {
                  {{ cellValue(row, column) }}
                }
              </td>
            }
          </tr>
        } @empty {
          <tr class="empty">
            <td [attr.colspan]="columns().length + (selectable() ? 1 : 0)">
              <ng-content select="[knTableEmpty]">{{
                emptyText() ?? labels().table.empty
              }}</ng-content>
            </td>
          </tr>
        }
        @if (window().after) {
          <tr class="spacer" aria-hidden="true" [style.block-size.px]="window().after">
            <td [attr.colspan]="columns().length + (selectable() ? 1 : 0)"></td>
          </tr>
        }
      </tbody>
    </table>
  `,
  host: {
    '[attr.aria-label]': 'null',
    '[attr.data-size]': 'size()',
    '[attr.data-sticky]': 'stickyHeader() ? "" : null',
    '[attr.data-virtual]': 'virtual() ? "" : null',
    '[style.--_row.px]': 'virtual() ? rowHeight() : null',
  },
  styles: `
    :host {
      --_pad-block: var(--kn-space-3);

      display: block;
      overflow: auto;
      border-radius: var(--kn-table-radius, var(--kn-radius-lg));
      background: var(--kn-table-bg, var(--kn-color-surface));
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-table-shadow, var(--kn-elevation-card));
    }

    :host([data-size='sm']) {
      --_pad-block: var(--kn-space-2);
      font-size: var(--kn-text-sm);
    }

    :host([data-size='lg']) {
      --_pad-block: var(--kn-space-4);
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }

    th,
    td {
      padding: var(--_pad-block) var(--kn-space-4);
      text-align: start;
      white-space: nowrap;
    }

    [data-align='end'] {
      text-align: end;
    }

    [data-align='center'] {
      text-align: center;
    }

    th {
      /* Containing block for a visually hidden header */
      position: relative;
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
      color: var(--kn-color-text-muted);
      box-shadow: inset 0 -1px 0 0 var(--kn-color-border);
    }

    :host([data-sticky]) th {
      position: sticky;
      inset-block-start: 0;
      z-index: var(--kn-z-raised);
      background: var(--kn-color-surface-raised);
    }

    tbody tr {
      animation: kn-stagger-in var(--kn-duration-normal) var(--kn-ease-out) backwards;
      animation-delay: calc(min(var(--kn-index, 0), 12) * var(--kn-stagger));
    }

    /*
     * Virtual rows: every row has the same height, so the position of any of them is
     * known without rendering the ones before it. Rows appear while scrolling — no cascade.
     */
    :host([data-virtual]) tbody tr {
      animation: none;
    }

    :host([data-virtual]) tbody tr:not(.spacer):not(.empty) {
      block-size: var(--_row);
    }

    :host([data-virtual]) tbody td {
      padding-block: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    tbody tr.spacer td {
      padding: 0;
      box-shadow: none;
    }

    tbody tr + tr td {
      box-shadow: inset 0 1px 0 0 var(--kn-color-border);
    }

    @media (hover: hover) {
      tbody tr:not(.empty):hover {
        background: var(--kn-color-hover);
      }
    }

    tbody tr[data-selected] {
      background: var(--kn-color-accent-soft);
    }

    .check {
      inline-size: 1px;
      padding-inline-end: 0;
      line-height: 0;
    }

    .sort {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1);
      margin: calc(var(--kn-space-1) * -1) calc(var(--kn-space-2) * -1);
      padding: var(--kn-space-1) var(--kn-space-2);
      border: 0;
      border-radius: var(--kn-radius-xs);
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    [data-align='end'] .sort {
      flex-direction: row-reverse;
    }

    .sort:hover {
      color: var(--kn-color-text);
      background: var(--kn-color-hover);
    }

    .sort:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: 0;
    }

    .arrow {
      --kn-icon-size: 0.875rem;
      opacity: 0;
      transition:
        opacity var(--kn-duration-fast) var(--kn-ease-standard),
        transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .sort:hover .arrow {
      opacity: 0.4;
    }

    .arrow[data-direction] {
      opacity: 1;
      color: var(--kn-color-accent-text);
    }

    .arrow[data-direction='desc'] {
      transform: rotate(180deg);
    }

    .sr-only {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .empty td {
      padding: var(--kn-space-10) var(--kn-space-4);
      text-align: center;
      color: var(--kn-color-text-muted);
      white-space: normal;
    }
  `,
})
export class KnTable<T = unknown> {
  protected readonly labels = injectKnLabels();
  /** Строки таблицы. */
  readonly data = input.required<readonly T[]>();
  /** Описание колонок. */
  readonly columns = input.required<readonly KnColumn<T>[]>();
  /** Текущая сортировка. Двусторонняя привязка: `[(sort)]`. */
  readonly sort = model<KnSort | null>(null);
  /** `client` — таблица сортирует сама; `manual` — только сообщает о выборе (серверная сортировка). */
  readonly sortMode = input<'client' | 'manual'>('client');
  /** Включает колонку с флажками выбора. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Выбранные строки. Двусторонняя привязка: `[(selection)]`. */
  readonly selection = model<readonly T[]>([]);
  /** Имя свойства-идентификатора или функция; нужна для стабильных строк и сравнения при выборе. */
  readonly trackBy = input<(keyof T & string) | ((row: T) => unknown) | null>(null);
  /** Плотность строк. */
  readonly size = input<KnSize>(knDefaultSize());
  /** Закрепляет заголовок при прокрутке (нужна ограниченная высота). */
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  /**
   * Рисует только строки, попавшие в окно прокрутки, — для тысяч записей. Таблице нужна
   * ограниченная высота, а строкам — одинаковая (`rowHeight`).
   */
  readonly virtual = input(false, { transform: booleanAttribute });
  /** Высота строки в пикселях при `virtual`. */
  readonly rowHeight = input(44, { transform: numberAttribute });
  /** Текст, когда строк нет. Для сложной разметки используйте слот `knTableEmpty`. */
  readonly emptyText = input<string>();
  /** Доступное имя таблицы. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  /** Scroll position and height of the table: what decides which rows are rendered. */
  private readonly scrollTop = signal(0);
  private readonly viewport = signal(640);

  private readonly cells = contentChildren<KnCell<T>>(KnCell);
  private readonly templates = computed(
    () => new Map(this.cells().map((cell) => [cell.key(), cell.template])),
  );

  /** Rows in display order. */
  protected readonly rows = computed(() => {
    const sort = this.sort();
    const data = this.data();
    if (!sort || this.sortMode() === 'manual') return data;
    const column = this.columns().find((c) => c.key === sort.key);
    if (!column) return data;
    const factor = sort.direction === 'asc' ? 1 : -1;
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    return [...data].sort((a, b) => {
      const x = this.cellValue(a, column);
      const y = this.cellValue(b, column);
      if (x == null || y == null) return (x == null ? 1 : 0) - (y == null ? 1 : 0);
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor;
      if (x instanceof Date && y instanceof Date) return (x.getTime() - y.getTime()) * factor;
      return collator.compare(String(x), String(y)) * factor;
    });
  });

  private readonly selectedIds = computed(
    () => new Set(this.selection().map((row) => this.identify(row))),
  );
  protected readonly allSelected = computed(
    () =>
      this.data().length > 0 &&
      this.data().every((row) => this.selectedIds().has(this.identify(row))),
  );
  protected readonly someSelected = computed(
    () =>
      !this.allSelected() && this.data().some((row) => this.selectedIds().has(this.identify(row))),
  );

  /**
   * The rows to render and the empty space that stands in for the rest. Without `virtual`
   * that is simply every row.
   */
  protected readonly window = computed(() => {
    const rows = this.rows();
    if (!this.virtual()) {
      return { items: rows.map((row, index) => ({ row, index })), before: 0, after: 0 };
    }
    const height = Math.max(1, this.rowHeight());
    // A few rows beyond each edge, so that fast scrolling does not show a gap
    const overscan = 6;
    const start = Math.max(0, Math.floor(this.scrollTop() / height) - overscan);
    const end = Math.min(
      rows.length,
      Math.ceil((this.scrollTop() + this.viewport()) / height) + overscan,
    );
    return {
      items: rows.slice(start, end).map((row, offset) => ({ row, index: start + offset })),
      before: start * height,
      after: (rows.length - end) * height,
    };
  });

  constructor() {
    afterNextRender(() => {
      const host = this.element;
      let frame = 0;
      const measure = (): void => {
        frame = 0;
        this.scrollTop.set(host.scrollTop);
        this.viewport.set(host.clientHeight);
      };
      // At most one measurement per frame, and none at all unless rows are virtual
      const schedule = (): void => {
        if (this.virtual() && !frame) frame = requestAnimationFrame(measure);
      };
      host.addEventListener('scroll', schedule, { passive: true });
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
      observer?.observe(host);
      schedule();
      this.destroyRef.onDestroy(() => {
        host.removeEventListener('scroll', schedule);
        observer?.disconnect();
        cancelAnimationFrame(frame);
      });
    });
  }

  protected cellTemplate(key: string) {
    return this.templates().get(key) ?? null;
  }

  protected cellValue(row: T, column: KnColumn<T>): unknown {
    return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
  }

  protected trackRow(row: T, index: number): unknown {
    return this.trackBy() ? this.identify(row) : index;
  }

  protected isSelected(row: T): boolean {
    return this.selectedIds().has(this.identify(row));
  }

  protected ariaSort(key: string): 'ascending' | 'descending' | 'none' {
    const sort = this.sort();
    if (sort?.key !== key) return 'none';
    return sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  /** Cycles a column: ascending → descending → unsorted. */
  protected toggleSort(key: string): void {
    const sort = this.sort();
    if (sort?.key !== key) this.sort.set({ key, direction: 'asc' });
    else if (sort.direction === 'asc') this.sort.set({ key, direction: 'desc' });
    else this.sort.set(null);
  }

  protected toggleRow(row: T, selected: boolean): void {
    const id = this.identify(row);
    const rest = this.selection().filter((other) => this.identify(other) !== id);
    this.selection.set(selected ? [...rest, row] : rest);
  }

  protected toggleAll(selected: boolean): void {
    this.selection.set(selected ? [...this.data()] : []);
  }

  private identify(row: T): unknown {
    const trackBy = this.trackBy();
    if (typeof trackBy === 'function') return trackBy(row);
    return trackBy ? row[trackBy] : row;
  }
}
