import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { AriaDescriber } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inheritTheme, knPositions, KnPlacement, playExit } from '@kenny/ui/core';

/** @internal Visual bubble. The accessible description is provided separately. */
@Component({
  selector: 'kn-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ text() }}`,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host {
      display: block;
      max-inline-size: 16rem;
      padding: var(--kn-space-1-5) var(--kn-space-3);
      border-radius: var(--kn-tooltip-radius, var(--kn-radius-sm));
      background: var(--kn-tooltip-bg, light-dark(rgb(12 19 48 / 0.88), rgb(238 242 255 / 0.92)));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--kn-tooltip-color, light-dark(#fff, #0c1330));
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
      line-height: var(--kn-leading-snug);
      box-shadow: var(--kn-shadow-md);
      pointer-events: none;
      animation: kn-pop-in var(--kn-duration-fast) var(--kn-ease-out);
    }

    :host([data-kn-state='closing']) {
      animation: kn-fade-out var(--kn-duration-instant) linear forwards;
    }
  `,
})
export class KnTooltipPanel {
  readonly text = signal('');
}

/**
 * Короткая подсказка при наведении и фокусе. Текст также привязывается к элементу
 * через `aria-describedby`, поэтому скринридер читает его всегда, а не только
 * пока подсказка видна. Не заменяет подпись: кнопке-иконке всё равно нужен `aria-label`.
 */
@Directive({
  selector: '[knTooltip]',
  host: {
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'hide()',
    '(pointerdown)': 'hide()',
    '(focusin)': 'onFocus()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class KnTooltip {
  /** Текст подсказки. Пустая строка отключает её. */
  readonly text = input<string>('', { alias: 'knTooltip' });
  /** Положение относительно элемента. */
  readonly placement = input<KnPlacement>('top', { alias: 'knTooltipPlacement' });
  /** Задержка перед показом при наведении, мс. При фокусе с клавиатуры подсказка появляется сразу. */
  readonly delay = input(500, { alias: 'knTooltipDelay', transform: numberAttribute });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly describer = inject(AriaDescriber);
  private readonly dir = inject(Directionality, { optional: true });
  private overlayRef: OverlayRef | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private described = '';

  constructor() {
    effect(() => {
      const text = this.text();
      if (this.described) this.describer.removeDescription(this.element, this.described);
      if (text) this.describer.describe(this.element, text);
      this.described = text;
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.overlayRef?.dispose();
      if (this.described) this.describer.removeDescription(this.element, this.described);
    });
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.show(), this.delay());
  }

  protected onFocus(): void {
    // Only keyboard focus: a click already tells the user what the control does.
    if (this.element.matches(':focus-visible') || this.element.querySelector(':focus-visible')) {
      this.show();
    }
  }

  /** Показывает подсказку. */
  show(): void {
    clearTimeout(this.timer);
    if (this.overlayRef || !this.text()) return;
    const ref = createOverlayRef(this.injector, {
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.element)
        .withPositions(knPositions(this.placement(), 6))
        .withFlexibleDimensions(false)
        .withViewportMargin(6)
        .withPush(true),
      direction: this.dir ?? undefined,
    });
    ref.overlayElement.style.pointerEvents = 'none';
    inheritTheme(this.element, ref.overlayElement);
    const panel = ref.attach(new ComponentPortal(KnTooltipPanel));
    panel.instance.text.set(this.text());
    this.overlayRef = ref;
  }

  /** Скрывает подсказку. */
  hide(): void {
    clearTimeout(this.timer);
    const ref = this.overlayRef;
    if (!ref) return;
    this.overlayRef = null;
    void playExit(ref.overlayElement.firstElementChild).then(() => ref.dispose());
  }
}
