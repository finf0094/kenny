import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  PLATFORM_ID,
  signal,
} from '@angular/core';

export type KnRevealEffect = 'rise' | 'fade' | 'zoom' | 'shift';

const keyframes: Record<KnRevealEffect, string> = {
  rise: 'kn-stagger-in',
  fade: 'kn-fade-in',
  zoom: 'kn-zoom-in',
  shift: 'kn-shift-in',
};

/**
 * Появление элемента, когда он попадает в окно просмотра. Срабатывает один раз.
 * До гидратации и без JavaScript содержимое видно сразу: директива прячет только то,
 * что ещё ниже края экрана. При `prefers-reduced-motion` ничего не анимируется.
 */
@Directive({
  selector: '[knReveal]',
  host: {
    '[style.opacity]': 'pending() ? "0" : null',
    '[style.animation]': 'animation()',
    '(animationend)': 'clear($event)',
  },
})
export class KnReveal {
  /** Эффект: подъём, проявление, масштаб или сдвиг сбоку. */
  readonly effect = input<KnRevealEffect, KnRevealEffect | ''>('rise', {
    alias: 'knReveal',
    transform: (value) => value || 'rise',
  });
  /** Порядковый номер в группе: каждый следующий элемент появляется на шаг позже. */
  readonly index = input(0, { alias: 'knRevealIndex', transform: numberAttribute });

  protected readonly pending = signal(false);
  protected readonly animation = signal<string | null>(null);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      const view = element.ownerDocument.defaultView;
      if (
        !view ||
        typeof IntersectionObserver === 'undefined' ||
        view.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }
      // The first callback reports where the element is right now. Already on screen:
      // leave it alone, a page must not replay itself. Below the edge: hide and wait.
      let first = true;
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          if (first) {
            first = false;
            if (visible) observer.disconnect();
            else this.pending.set(true);
            return;
          }
          if (!visible) return;
          observer.disconnect();
          this.pending.set(false);
          this.animation.set(
            `${keyframes[this.effect()]} var(--kn-duration-slower) var(--kn-ease-out) ` +
              `calc(${this.index()} * var(--kn-stagger) * 2) backwards`,
          );
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Drops the animation once it has played, so it never fights the element's own transforms. */
  protected clear(event: AnimationEvent): void {
    if (event.target === event.currentTarget) this.animation.set(null);
  }
}
