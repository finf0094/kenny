import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { KnSize } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

export type KnTabsVariant = 'segmented' | 'underline';

/**
 * Вкладки по паттерну APG Tabs с автоматической активацией. Индикатор активной
 * вкладки переезжает пружинной FLIP-анимацией (только `transform`).
 */
@Component({
  selector: 'kn-tabs',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #list
      class="list"
      role="tablist"
      [attr.aria-label]="ariaLabel()"
      (keydown)="onKeydown($event)"
    >
      <span #indicator class="indicator" aria-hidden="true"></span>
      @for (tab of tabs(); track tab.id) {
        <button
          class="tab"
          type="button"
          role="tab"
          [id]="tab.id + '-tab'"
          [disabled]="tab.disabled()"
          [attr.aria-selected]="tab.active()"
          [attr.aria-controls]="tab.id"
          [attr.data-value]="tab.value()"
          [tabindex]="tab.active() ? 0 : -1"
          (click)="select(tab)"
        >
          @if (tab.icon(); as icon) {
            <kn-icon [name]="icon" />
          }
          {{ tab.label() }}
        </button>
      }
    </div>
    <ng-content />
  `,
  host: {
    // The label belongs to the inner element; the wrapper must not carry a copy
    '[attr.aria-label]': 'null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-stretch]': 'stretch() ? "" : null',
  },
  styles: `
    :host {
      --_height: var(--kn-size-md);
      display: block;
      min-inline-size: 0;
    }

    :host([data-size='sm']) {
      --_height: var(--kn-size-sm);
    }

    :host([data-size='lg']) {
      --_height: var(--kn-size-lg);
    }

    .list {
      position: relative;
      display: inline-flex;
      max-inline-size: 100%;
      overflow-x: auto;
      scrollbar-width: none;
      isolation: isolate;
    }

    :host([data-stretch]) .list {
      display: flex;
    }

    :host([data-stretch]) .tab {
      flex: 1;
    }

    .tab {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kn-space-1-5);
      flex: none;
      block-size: var(--_height);
      padding: 0 var(--kn-space-4);
      border: 0;
      background: none;
      color: var(--kn-color-text-muted);
      font: inherit;
      font-size: var(--kn-text-md);
      font-weight: var(--kn-weight-medium);
      white-space: nowrap;
      cursor: pointer;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    :host([data-size='sm']) .tab {
      padding-inline: var(--kn-space-3);
      font-size: var(--kn-text-sm);
    }

    .tab kn-icon {
      --kn-icon-size: 1.125em;
    }

    .tab[aria-selected='true'] {
      color: var(--kn-color-text);
    }

    @media (hover: hover) {
      .tab:hover:not(:disabled):not([aria-selected='true']) {
        color: var(--kn-color-text);
      }
    }

    .tab:disabled {
      color: var(--kn-color-text-disabled);
      cursor: not-allowed;
    }

    .tab:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -3px;
      border-radius: var(--kn-radius-full);
    }

    .indicator {
      position: absolute;
      z-index: -1;
      inset-block: 0;
      left: 0;
      inline-size: 0;
      pointer-events: none;
      transform-origin: left center;
    }

    /* Segmented: a glass pill sliding inside a sunken track */
    :host([data-variant='segmented']) .list {
      padding: 3px;
      border-radius: var(--kn-radius-full);
      background: var(--kn-tabs-track, var(--kn-color-surface-sunken));
      box-shadow: inset 0 0 0 1px var(--kn-color-border);
    }

    :host([data-variant='segmented']) .tab {
      block-size: calc(var(--_height) - 6px);
      border-radius: var(--kn-radius-full);
    }

    :host([data-variant='segmented']) .indicator {
      inset-block: 3px;
      border-radius: var(--kn-radius-full);
      background: var(--kn-tabs-indicator, var(--kn-glass-bg-strong));
      box-shadow:
        inset 0 1px 0 0 var(--kn-glass-specular),
        0 0 0 0.5px var(--kn-glass-edge),
        var(--kn-shadow-sm);
    }

    /* Underline: a line travelling along the bottom edge */
    :host([data-variant='underline']) .list {
      display: flex;
      box-shadow: inset 0 -1px 0 0 var(--kn-color-border);
    }

    :host([data-variant='underline']) .tab {
      padding-inline: var(--kn-space-3);
    }

    :host([data-variant='underline']) .tab[aria-selected='true'] {
      color: var(--kn-color-accent-text);
    }

    :host([data-variant='underline']) .indicator {
      inset-block: auto 0;
      block-size: 2px;
      border-radius: 2px 2px 0 0;
      background: var(--kn-tabs-indicator, var(--kn-color-accent));
    }
  `,
})
export class KnTabs<T = unknown> {
  /** Значение активной вкладки. Двусторонняя привязка: `[(value)]`. По умолчанию — первая. */
  readonly value = model<T | undefined>(undefined);
  /** Внешний вид. */
  readonly variant = input<KnTabsVariant>('segmented');
  /** Размер. */
  readonly size = input<KnSize>('md');
  /** Растягивает вкладки на всю ширину. */
  readonly stretch = input(false, { transform: booleanAttribute });
  /** Доступное имя списка вкладок. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  protected readonly tabs = contentChildren<KnTab<T>>(forwardRef(() => KnTab));
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  private readonly indicator = viewChild.required<ElementRef<HTMLElement>>('indicator');
  private readonly dir = inject(Directionality, { optional: true });
  private readonly resized = signal(0);
  private previous: { left: number; width: number } | null = null;

  /** The active value, falling back to the first enabled tab. */
  readonly current = computed(() => {
    const value = this.value();
    const tabs = this.tabs();
    if (value !== undefined && tabs.some((tab) => tab.value() === value)) return value;
    return tabs.find((tab) => !tab.disabled())?.value();
  });

  constructor() {
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => this.resized.update((n) => n + 1));
      afterRenderEffect(() => observer.observe(this.list().nativeElement));
      inject(DestroyRef).onDestroy(() => observer.disconnect());
    }
    afterRenderEffect(() => {
      const resizeTick = this.resized();
      this.tabs();
      this.moveIndicator(this.current(), resizeTick);
    });
  }

  protected select(tab: KnTab<T>): void {
    if (!tab.disabled()) this.value.set(tab.value());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.tabs().filter((tab) => !tab.disabled());
    const index = enabled.findIndex((tab) => tab.active());
    const step = this.dir?.value === 'rtl' ? -1 : 1;
    let next: KnTab<T> | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = enabled[(index + step + enabled.length) % enabled.length];
        break;
      case 'ArrowLeft':
        next = enabled[(index - step + enabled.length) % enabled.length];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
    }
    if (!next) return;
    event.preventDefault();
    this.select(next);
    this.list().nativeElement.querySelector<HTMLElement>(`#${CSS.escape(next.id + '-tab')}`)?.focus();
  }

  /**
   * FLIP: place the indicator at its final geometry, then animate a transform from
   * where it used to be. Layout is written once; the motion is transform-only.
   */
  private lastTick = -1;
  private moveIndicator(_current: T | undefined, resizeTick: number): void {
    const list = this.list().nativeElement;
    const indicator = this.indicator().nativeElement;
    const active = list.querySelector<HTMLElement>('.tab[aria-selected="true"]');
    if (!active) {
      indicator.style.opacity = '0';
      this.previous = null;
      return;
    }
    const next = { left: active.offsetLeft, width: active.offsetWidth };
    indicator.style.opacity = '1';
    indicator.style.left = `${next.left}px`;
    indicator.style.inlineSize = `${next.width}px`;

    const resizeOnly = resizeTick !== this.lastTick;
    this.lastTick = resizeTick;
    const prev = this.previous;
    this.previous = next;
    if (!prev || resizeOnly || !next.width || typeof indicator.animate !== 'function') return;
    if (prev.left === next.left && prev.width === next.width) return;

    const style = getComputedStyle(indicator);
    const duration = parseFloat(style.getPropertyValue('--kn-duration-slow')) || 0;
    const easing = style.getPropertyValue('--kn-ease-spring').trim() || 'ease-out';
    indicator.animate(
      [
        { transform: `translateX(${prev.left - next.left}px) scaleX(${prev.width / next.width})` },
        { transform: 'none' },
      ],
      { duration: Math.max(duration, 1), easing },
    );
    active.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }
}

/**
 * Вкладка: заголовок задаётся входами, содержимое — проекцией. Сам элемент
 * является панелью (`role="tabpanel"`).
 */
@Component({
  selector: 'kn-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'id',
    '[attr.aria-labelledby]': 'id + "-tab"',
    '[hidden]': '!active()',
  },
  styles: `
    :host {
      display: block;
      padding-block-start: var(--kn-tabs-gap, var(--kn-space-4));
      animation: kn-fade-in var(--kn-duration-normal) var(--kn-ease-standard);
    }

    :host([hidden]) {
      display: none;
    }

    :host(:focus-visible) {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
      border-radius: var(--kn-radius-sm);
    }
  `,
})
export class KnTab<T = unknown> {
  /** Значение вкладки. */
  readonly value = input.required<T>();
  /** Текст на вкладке. */
  readonly label = input.required<string>();
  /** Имя иконки перед текстом. */
  readonly icon = input<string>('');
  /** Отключает вкладку. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly tabsHost = inject<KnTabs<T>>(KnTabs);
  readonly id = inject(_IdGenerator).getId('kn-tab-');
  readonly active = computed(() => this.tabsHost.current() === this.value());
}
