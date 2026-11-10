import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { KnSize } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

/** Builds `[1, '…', 4, 5, 6, '…', 20]` for the given position. */
export function paginationRange(
  current: number,
  count: number,
  siblings: number,
): (number | '…')[] {
  const slots = siblings * 2 + 5;
  if (count <= slots) return Array.from({ length: count }, (_, i) => i + 1);
  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, count);
  const showLeft = left > 2;
  const showRight = right < count - 1;
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (!showLeft && showRight) return [...range(1, siblings * 2 + 3), '…', count];
  if (showLeft && !showRight) return [1, '…', ...range(count - siblings * 2 - 2, count)];
  return [1, '…', ...range(left, right), '…', count];
}

/** Постраничная навигация: `nav` с кнопками страниц, текущая отмечена `aria-current`. */
@Component({
  selector: 'kn-pagination',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ul>
        <li>
          <button
            class="page nav"
            type="button"
            aria-label="Предыдущая страница"
            [disabled]="page() <= 1"
            (click)="go(page() - 1)"
          >
            <kn-icon name="chevron-left" />
          </button>
        </li>
        @for (item of items(); track $index) {
          <li>
            @if (item === '…') {
              <span class="gap" aria-hidden="true">…</span>
            } @else {
              <button
                class="page"
                type="button"
                [attr.aria-label]="'Страница ' + item"
                [attr.aria-current]="item === page() ? 'page' : null"
                (click)="go(item)"
              >
                {{ item }}
              </button>
            }
          </li>
        }
        <li>
          <button
            class="page nav"
            type="button"
            aria-label="Следующая страница"
            [disabled]="page() >= pageCount()"
            (click)="go(page() + 1)"
          >
            <kn-icon name="chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  `,
  host: { '[attr.aria-label]': 'null', '[attr.data-size]': 'size()' },
  styles: `
    :host {
      --_size: var(--kn-size-md);
      display: block;
    }

    :host([data-size='sm']) {
      --_size: var(--kn-size-sm);
      font-size: var(--kn-text-sm);
    }

    :host([data-size='lg']) {
      --_size: var(--kn-size-lg);
    }

    ul {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .page,
    .gap {
      display: grid;
      place-items: center;
      min-inline-size: var(--_size);
      block-size: var(--_size);
      box-sizing: border-box;
      font-variant-numeric: tabular-nums;
    }

    .gap {
      color: var(--kn-color-text-subtle);
    }

    .page {
      position: relative;
      padding: 0 var(--kn-space-2);
      border: 0;
      border-radius: var(--kn-radius-control);
      background: none;
      color: var(--kn-color-text);
      font: inherit;
      font-weight: var(--kn-weight-medium);
      cursor: pointer;
      isolation: isolate;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .page::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    @media (hover: hover) {
      .page:hover:not(:disabled)::before {
        opacity: 1;
      }
    }

    .page:active:not(:disabled) {
      transform: scale(0.92);
    }

    .page[aria-current='page'] {
      color: var(--kn-color-on-accent);
    }

    .page[aria-current='page']::before {
      background: var(--kn-pagination-color, var(--kn-color-accent));
      box-shadow: var(--kn-shadow-highlight);
      opacity: 1;
      animation: kn-pop-in var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .page:disabled {
      color: var(--kn-color-text-disabled);
      cursor: not-allowed;
    }

    .page:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .nav kn-icon {
      --kn-icon-size: 1.125rem;
    }

    :host-context([dir='rtl']) .nav kn-icon {
      transform: scaleX(-1);
    }
  `,
})
export class KnPagination {
  /** Текущая страница, начиная с 1. Двусторонняя привязка: `[(page)]`. */
  readonly page = model(1);
  /** Общее количество записей. */
  readonly total = input.required({ transform: numberAttribute });
  /** Записей на странице. */
  readonly pageSize = input(10, { transform: numberAttribute });
  /** Сколько соседних страниц показывать по бокам от текущей. */
  readonly siblings = input(1, { transform: numberAttribute });
  /** Размер кнопок. */
  readonly size = input<KnSize>('md');
  /** Доступное имя навигации. */
  readonly ariaLabel = input<string>('Страницы', { alias: 'aria-label' });

  /** Количество страниц. */
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))),
  );
  protected readonly items = computed(() =>
    paginationRange(Math.min(this.page(), this.pageCount()), this.pageCount(), this.siblings()),
  );

  protected go(page: number): void {
    const next = Math.min(this.pageCount(), Math.max(1, page));
    if (next !== this.page()) this.page.set(next);
  }
}
