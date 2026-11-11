import { injectKnLabels } from '@kenny/ui/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';

/**
 * Контейнер панелей с изменяемым размером. Размеры хранятся в процентах;
 * между панелями ставятся `<kn-splitter-handle>` — разделители по паттерну
 * APG Window Splitter (перетаскивание, стрелки, Home/End).
 */
@Component({
  selector: 'kn-splitter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-dragging]': 'dragging() ? "" : null',
  },
  styles: `
    :host {
      display: flex;
      min-inline-size: 0;
      min-block-size: 0;
    }

    :host([data-orientation='vertical']) {
      flex-direction: column;
    }

    :host([data-dragging]) {
      user-select: none;
      cursor: col-resize;
    }

    :host([data-dragging][data-orientation='vertical']) {
      cursor: row-resize;
    }
  `,
})
export class KnSplitter {
  /** Направление: `horizontal` — панели в ряд, `vertical` — друг под другом. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  readonly panels = contentChildren(forwardRef(() => KnSplitterPanel));
  readonly handles = contentChildren(forwardRef(() => KnSplitterHandle));
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly dragging = signal(false);

  /** Effective sizes in percent: explicit ones kept, the rest share what is left. */
  readonly sizes = computed(() => {
    const explicit = this.panels().map((panel) => panel.size());
    const taken = explicit.reduce<number>((sum, size) => sum + (size ?? 0), 0);
    const free = explicit.filter((size) => size == null).length;
    const share = free ? Math.max(0, 100 - taken) / free : 0;
    return explicit.map((size) => size ?? share);
  });

  /**
   * Moves the boundary after panel `index` by `delta` percent, respecting the
   * min/max of both neighbours. Returns the applied delta.
   */
  resize(index: number, delta: number): number {
    const panels = this.panels();
    const before = panels[index];
    const after = panels[index + 1];
    if (!before || !after) return 0;
    const sizes = this.sizes();
    const a = sizes[index];
    const b = sizes[index + 1];
    const lower = Math.max(before.min() - a, b - after.max());
    const upper = Math.min(before.max() - a, b - after.min());
    const applied = Math.min(upper, Math.max(lower, delta));
    // Freeze every panel at its current size so the untouched ones do not shift.
    panels.forEach((panel, i) => panel.size.set(round(sizes[i])));
    before.size.set(round(a + applied));
    after.size.set(round(b - applied));
    return applied;
  }
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Панель сплиттера. */
@Component({
  selector: 'kn-splitter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[id]': 'id', '[style.flex-grow]': 'grow()' },
  styles: `
    :host {
      display: block;
      flex: 1 1 0;
      min-inline-size: 0;
      min-block-size: 0;
      overflow: auto;
    }
  `,
})
export class KnSplitterPanel {
  /** Размер в процентах. Без значения панель делит оставшееся место поровну. `[(size)]` сохраняет раскладку. */
  readonly size = model<number | undefined>(undefined);
  /** Минимальный размер, %. */
  readonly min = input(10, { transform: numberAttribute });
  /** Максимальный размер, %. */
  readonly max = input(90, { transform: numberAttribute });

  private readonly splitter = inject(KnSplitter);
  readonly id = inject(_IdGenerator).getId('kn-splitter-panel-');
  protected readonly grow = computed(() => {
    const index = this.splitter.panels().indexOf(this);
    return this.splitter.sizes()[index] ?? 1;
  });
}

/**
 * Разделитель между двумя панелями. Фокусируемый `role="separator"`: его значение —
 * размер предыдущей панели.
 */
@Component({
  selector: 'kn-splitter-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="grip" aria-hidden="true"></span>`,
  host: {
    role: 'separator',
    tabindex: '0',
    '[attr.aria-label]': 'ariaLabel() ?? labels().splitter.label',
    '[attr.aria-orientation]':
      'splitter.orientation() === "horizontal" ? "vertical" : "horizontal"',
    '[attr.aria-controls]': 'previous()?.id ?? null',
    '[attr.aria-valuenow]': 'valueNow()',
    '[attr.aria-valuemin]': 'previous()?.min() ?? 0',
    '[attr.aria-valuemax]': 'previous()?.max() ?? 100',
    '[attr.data-active]': 'active() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(dblclick)': 'reset()',
  },
  styles: `
    :host {
      position: relative;
      display: grid;
      place-items: center;
      flex: none;
      inline-size: var(--kn-splitter-handle-size, 0.75rem);
      cursor: col-resize;
      touch-action: none;
      outline: none;
    }

    :host([aria-orientation='horizontal']) {
      inline-size: auto;
      block-size: var(--kn-splitter-handle-size, 0.75rem);
      cursor: row-resize;
    }

    .grip {
      inline-size: 4px;
      block-size: 2.25rem;
      border-radius: var(--kn-radius-full);
      background: var(--kn-color-border-strong);
      transition:
        transform var(--kn-duration-normal) var(--kn-ease-spring),
        opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    :host([aria-orientation='horizontal']) .grip {
      inline-size: 2.25rem;
      block-size: 4px;
    }

    @media (hover: hover) {
      :host(:hover) .grip {
        transform: scaleY(1.25);
      }

      :host([aria-orientation='horizontal']:hover) .grip {
        transform: scaleX(1.25);
      }
    }

    :host([data-active]) .grip,
    :host(:focus-visible) .grip {
      background: var(--kn-color-accent);
      transform: scaleY(1.5);
    }

    :host([aria-orientation='horizontal'][data-active]) .grip,
    :host([aria-orientation='horizontal']:focus-visible) .grip {
      transform: scaleX(1.5);
    }

    :host(:focus-visible) .grip {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }
  `,
})
export class KnSplitterHandle {
  protected readonly labels = injectKnLabels();
  /** Доступное имя разделителя, например «Изменить ширину списка». */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Шаг изменения с клавиатуры, %. С Shift шаг в пять раз больше. */
  readonly step = input(2, { transform: numberAttribute });

  protected readonly splitter = inject(KnSplitter);
  private readonly dir = inject(Directionality, { optional: true });
  protected readonly active = signal(false);
  private readonly index = computed(() => this.splitter.handles().indexOf(this));
  protected readonly previous = computed(() => this.splitter.panels()[this.index()]);
  protected readonly valueNow = computed(() =>
    Math.round(this.splitter.sizes()[this.index()] ?? 0),
  );

  private initial: (number | undefined)[] | null = null;
  private pointerOrigin = 0;

  protected onKeydown(event: KeyboardEvent): void {
    const horizontal = this.splitter.orientation() === 'horizontal';
    const inline = this.dir?.value === 'rtl' ? -1 : 1;
    const step = this.step() * (event.shiftKey ? 5 : 1);
    const previous = this.previous();
    const current = this.splitter.sizes()[this.index()] ?? 0;
    let delta: number | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        if (horizontal) delta = -step * inline;
        break;
      case 'ArrowRight':
        if (horizontal) delta = step * inline;
        break;
      case 'ArrowUp':
        if (!horizontal) delta = -step;
        break;
      case 'ArrowDown':
        if (!horizontal) delta = step;
        break;
      case 'Home':
        delta = (previous?.min() ?? 0) - current;
        break;
      case 'End':
        delta = (previous?.max() ?? 100) - current;
        break;
    }
    if (delta === null) return;
    event.preventDefault();
    this.remember();
    this.splitter.resize(this.index(), delta);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.remember();
    this.pointerOrigin = this.coordinate(event);
    this.active.set(true);
    this.splitter.dragging.set(true);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.active()) return;
    const horizontal = this.splitter.orientation() === 'horizontal';
    const rect = this.splitter.element.getBoundingClientRect();
    const total = horizontal ? rect.width : rect.height;
    if (!total) return;
    const position = this.coordinate(event);
    const inline = horizontal && this.dir?.value === 'rtl' ? -1 : 1;
    const delta = (((position - this.pointerOrigin) * inline) / total) * 100;
    const applied = this.splitter.resize(this.index(), delta);
    // Only consume the distance that was actually applied, so the handle
    // stays under the pointer after hitting a limit.
    this.pointerOrigin += ((applied * total) / 100) * inline;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.active()) return;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.active.set(false);
    this.splitter.dragging.set(false);
  }

  /** Возвращает панели к размерам, которые были до первого изменения. */
  reset(): void {
    if (!this.initial) return;
    this.splitter.panels().forEach((panel, i) => panel.size.set(this.initial?.[i]));
  }

  private remember(): void {
    this.initial ??= this.splitter.panels().map((panel) => panel.size());
  }

  private coordinate(event: PointerEvent): number {
    return this.splitter.orientation() === 'horizontal' ? event.clientX : event.clientY;
  }
}
