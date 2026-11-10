import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { KnButtonVariant, knDefaults, knDefaultSize, KnSize } from '@kenny/ui/core';
import { KnSpinner } from '@kenny/ui/spinner';

export type { KnButtonVariant } from '@kenny/ui/core';
export type KnButtonTone = 'accent' | 'neutral' | 'danger';

/**
 * Кнопка и кнопка-иконка. Навешивается на нативный `<button>` или `<a>`, поэтому
 * фокус, клавиатура и отправка форм работают как у обычного элемента.
 *
 * `kn-icon-button` — квадратный вариант для одной иконки; ему обязательно нужен
 * `aria-label`.
 */
@Component({
  selector: 'button[kn-button], a[kn-button], button[kn-icon-button], a[kn-icon-button]',
  imports: [KnSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="content"><ng-content /></span>
    @if (loading()) {
      <kn-spinner class="spinner" decorative size="sm" />
    }
  `,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.data-icon-only]': 'iconOnly ? "" : null',
    '[attr.data-block]': 'block() ? "" : null',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.disabled]': 'isNativeButton && disabled() ? "" : null',
    '[attr.aria-disabled]': 'inert() && !(isNativeButton && disabled()) ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.tabindex]': '!isNativeButton && disabled() ? -1 : null',
  },
  styles: `
    :host {
      --_tone: var(--kn-color-accent);
      --_on-tone: var(--kn-color-on-accent);
      --_tone-soft: var(--kn-color-accent-soft);
      --_tone-text: var(--kn-color-accent-text);
      --_layer: rgb(255 255 255 / 0.14);
      --_height: var(--kn-size-md);
      --_pad: var(--kn-space-4);

      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--kn-space-2);
      box-sizing: border-box;
      min-inline-size: var(--_height);
      block-size: var(--kn-button-height, var(--_height));
      padding: 0 var(--kn-button-padding, var(--_pad));
      border: 0;
      border-radius: var(--kn-button-radius, var(--kn-radius-control));
      background: var(--kn-button-bg, var(--_bg));
      color: var(--kn-button-color, var(--_fg));
      font: inherit;
      font-size: var(--kn-text-md);
      font-weight: var(--kn-button-weight, var(--kn-weight-medium));
      letter-spacing: var(--kn-button-tracking, var(--kn-tracking-snug));
      text-transform: var(--kn-button-transform, none);
      line-height: 1;
      white-space: nowrap;
      text-decoration: none;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      isolation: isolate;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    /* State layer: hover/press are an opacity change on a pseudo-element, never a repaint of the fill. */
    :host::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background: var(--_layer);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
      pointer-events: none;
    }

    @media (hover: hover) {
      :host(:hover)::after {
        opacity: 1;
      }
    }

    :host(:active) {
      transform: scale(var(--kn-press-scale));
      transition-duration: var(--kn-duration-instant);
    }

    :host(:active)::after {
      opacity: 1;
    }

    :host(:focus-visible) {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    /* Tones */
    :host([data-tone='neutral']) {
      --_tone: var(--kn-color-text);
      --_on-tone: var(--kn-color-canvas);
      --_tone-soft: var(--kn-color-surface-sunken);
      --_tone-text: var(--kn-color-text);
    }

    :host([data-tone='danger']) {
      --_tone: var(--kn-color-danger);
      --_on-tone: var(--kn-color-on-danger);
      --_tone-soft: var(--kn-color-danger-soft);
      --_tone-text: var(--kn-color-danger);
    }

    /* Variants */
    :host([data-variant='solid']) {
      --_bg: var(--_tone);
      --_fg: var(--_on-tone);
      box-shadow: var(--kn-button-shadow, var(--kn-shadow-highlight), var(--kn-shadow-xs));
    }

    :host([data-variant='soft']) {
      --_bg: var(--_tone-soft);
      --_fg: var(--_tone-text);
      --_layer: var(--kn-color-hover);
    }

    /* Outline: painted like a small surface, with whatever edge the style gives surfaces */
    :host([data-variant='outline']) {
      --_bg: var(--kn-color-surface);
      --_fg: var(--_tone-text);
      --_layer: var(--kn-color-hover);
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-elevation-raised);
    }

    :host([data-variant='ghost']) {
      --_bg: transparent;
      --_fg: var(--_tone-text);
      --_layer: var(--kn-color-hover);
    }

    /* Sizes */
    :host([data-size='sm']) {
      --_height: var(--kn-size-sm);
      --_pad: var(--kn-space-3);
      gap: var(--kn-space-1-5);
      font-size: var(--kn-text-sm);
    }

    :host([data-size='lg']) {
      --_height: var(--kn-size-lg);
      --_pad: var(--kn-space-6);
      font-size: var(--kn-text-lg);
    }

    :host([data-icon-only]) {
      inline-size: var(--kn-button-height, var(--_height));
      padding: 0;
    }

    :host([data-block]) {
      display: flex;
      inline-size: 100%;
    }

    /* Disabled and loading */
    :host(:disabled),
    :host([aria-disabled='true']) {
      cursor: not-allowed;
      transform: none;
    }

    :host(:disabled),
    :host([aria-disabled='true']:not([data-loading])) {
      opacity: 0.45;
      box-shadow: none;
    }

    :host(:disabled)::after,
    :host([aria-disabled='true'])::after {
      opacity: 0;
    }

    .content {
      display: inline-flex;
      align-items: center;
      gap: inherit;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    :host([data-loading]) .content {
      opacity: 0;
    }

    .spinner {
      position: absolute;
      inset: 0;
      margin: auto;
      animation: kn-fade-in var(--kn-duration-fast) var(--kn-ease-standard);
    }
  `,
})
export class KnButton {
  /** Визуальный вариант. */
  readonly variant = input<KnButtonVariant>(knDefaults('button').variant ?? 'solid');
  /** Смысловая окраска. */
  readonly tone = input<KnButtonTone>('accent');
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize('button'));
  /** Растягивает кнопку на всю ширину контейнера. */
  readonly block = input(false, { transform: booleanAttribute });
  /** Показывает индикатор и блокирует нажатия, сохраняя фокус и ширину кнопки. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Отключает кнопку. Для `<a>` выставляет `aria-disabled` и убирает из порядка табуляции. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isNativeButton = this.element.tagName === 'BUTTON';
  protected readonly iconOnly = this.element.hasAttribute('kn-icon-button');
  protected readonly inert = computed(() => this.disabled() || this.loading());

  constructor() {
    // Capture phase: runs before any (click) handler bound by the consumer.
    inject(Renderer2).listen(this.element, 'click', (event: Event) => this.haltWhenInert(event), {
      capture: true,
    });
    if (typeof ngDevMode !== 'undefined' && ngDevMode && this.iconOnly) {
      queueMicrotask(() => {
        const named = ['aria-label', 'aria-labelledby', 'title'].some((a) =>
          this.element.hasAttribute(a),
        );
        if (!named) {
          console.warn(
            '[kenny] kn-icon-button needs an accessible name (aria-label).',
            this.element,
          );
        }
      });
    }
  }

  private haltWhenInert(event: Event): void {
    if (this.inert()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
