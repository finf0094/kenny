import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';

/**
 * Заглушка на время загрузки. Декоративна (`aria-hidden`): контейнеру, в котором
 * идёт загрузка, задайте `aria-busy="true"`.
 */
@Component({
  selector: 'kn-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (line of lineList(); track $index) {
      <span class="bone" [style.inline-size]="line"></span>
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[attr.data-shape]': 'shape()',
    '[style.--_w]': 'width()',
    '[style.--_h]': 'height()',
  },
  styles: `
    :host {
      display: grid;
      gap: 0.6em;
      inline-size: var(--_w, 100%);
    }

    .bone {
      position: relative;
      display: block;
      block-size: var(--_h, 0.9em);
      border-radius: var(--kn-skeleton-radius, var(--kn-radius-xs));
      background: var(--kn-skeleton-color, var(--kn-color-surface-sunken));
      overflow: hidden;
    }

    :host([data-shape='rect']) .bone {
      block-size: var(--_h, 6rem);
      border-radius: var(--kn-skeleton-radius, var(--kn-radius-md));
    }

    :host([data-shape='circle']) {
      inline-size: var(--_w, 2.375rem);
    }

    :host([data-shape='circle']) .bone {
      block-size: auto;
      aspect-ratio: 1;
      border-radius: 50%;
    }

    /* The shimmer is a band translated across the bone */
    .bone::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent,
        light-dark(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.1)),
        transparent
      );
      animation: kn-shimmer 1.5s var(--kn-ease-standard) infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .bone::after {
        animation: none;
        opacity: 0;
      }
    }
  `,
})
export class KnSkeleton {
  /** Форма заглушки. */
  readonly shape = input<'text' | 'rect' | 'circle'>('text');
  /** Ширина (CSS-значение). */
  readonly width = input<string | null>(null);
  /** Высота (CSS-значение). */
  readonly height = input<string | null>(null);
  /** Количество строк для `shape="text"`; последняя строка короче. */
  readonly lines = input(1, { transform: numberAttribute });

  protected readonly lineList = computed(() => {
    const count = this.shape() === 'text' ? Math.max(1, this.lines()) : 1;
    return Array.from({ length: count }, (_, i) => (count > 1 && i === count - 1 ? '62%' : '100%'));
  });
}
