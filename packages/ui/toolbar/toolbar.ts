import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';

const FOCUSABLE =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [role="combobox"]:not(:disabled), [tabindex="0"], [data-kn-toolbar-item]';

/**
 * Панель инструментов по паттерну APG Toolbar: один Tab-стоп на всю панель,
 * внутри — стрелки, Home и End. Любые кнопки и ссылки внутри становятся её элементами.
 */
@Component({
  selector: 'kn-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'toolbar',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-variant]': 'variant()',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--kn-toolbar-gap, var(--kn-space-1));
      box-sizing: border-box;
      max-inline-size: 100%;
      padding: var(--kn-toolbar-padding, var(--kn-space-1));
      border-radius: var(--kn-toolbar-radius, var(--kn-radius-full));
    }

    :host([aria-orientation='vertical']) {
      flex-direction: column;
      border-radius: var(--kn-toolbar-radius, var(--kn-radius-lg));
    }

    :host([data-variant='glass']) {
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      -webkit-backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-shadow-glass-md);
    }
  `,
})
export class KnToolbar {
  /** Доступное имя панели. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** Направление навигации стрелками. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** `glass` — плавающая стеклянная капсула, `plain` — без фона. */
  readonly variant = input<'glass' | 'plain'>('glass');

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dir = inject(Directionality, { optional: true });

  constructor() {
    afterNextRender(() => this.setTabStop(this.items()[0]));
  }

  private items(): HTMLElement[] {
    return Array.from(this.element.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (item) => item.getAttribute('aria-disabled') !== 'true',
    );
  }

  /** Roving tabindex: exactly one item is reachable with Tab. */
  private setTabStop(active: HTMLElement | undefined): void {
    if (!active) return;
    for (const item of this.items()) {
      item.tabIndex = item === active ? 0 : -1;
    }
  }

  protected onFocusIn(event: FocusEvent): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>(FOCUSABLE);
    if (target && this.items().includes(target)) this.setTabStop(target);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    // Text fields keep their own caret keys; a select keeps Home/End for its list.
    if (target.matches('input:not([type=checkbox]):not([type=radio]), textarea')) return;
    if (target.matches('[role="combobox"]') && (event.key === 'Home' || event.key === 'End'))
      return;
    const items = this.items();
    const index = items.indexOf(target.closest<HTMLElement>(FOCUSABLE) ?? target);
    if (index === -1) return;
    const horizontal = this.orientation() === 'horizontal';
    const forward = horizontal
      ? this.dir?.value === 'rtl'
        ? 'ArrowLeft'
        : 'ArrowRight'
      : 'ArrowDown';
    const backward = horizontal
      ? this.dir?.value === 'rtl'
        ? 'ArrowRight'
        : 'ArrowLeft'
      : 'ArrowUp';
    let next: HTMLElement | undefined;
    if (event.key === forward) next = items[(index + 1) % items.length];
    else if (event.key === backward) next = items[(index - 1 + items.length) % items.length];
    else if (event.key === 'Home') next = items[0];
    else if (event.key === 'End') next = items[items.length - 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
  }
}

/** Вертикальная черта между группами инструментов. */
@Component({
  selector: 'kn-toolbar-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: { role: 'separator', 'aria-orientation': 'vertical' },
  styles: `
    :host {
      flex: none;
      align-self: stretch;
      inline-size: 1px;
      margin: var(--kn-space-1-5) var(--kn-space-1);
      background: var(--kn-color-border-strong);
    }

    :host-context(kn-toolbar[aria-orientation='vertical']) {
      inline-size: auto;
      block-size: 1px;
      margin: var(--kn-space-1) var(--kn-space-1-5);
    }
  `,
})
export class KnToolbarSeparator {}

/** Распорка: отодвигает следующие элементы к противоположному краю. */
@Component({
  selector: 'kn-toolbar-spacer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: { 'aria-hidden': 'true' },
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class KnToolbarSpacer {}
