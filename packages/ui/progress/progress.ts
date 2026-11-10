import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { KnSize, KnTone } from '@kenny/ui/core';

/**
 * Линейный индикатор прогресса. С числом в `value` показывает долю выполнения,
 * с `null` — неопределённое ожидание. Заливка двигается через `transform`.
 */
@Component({
  selector: 'kn-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="fill"></span>`,
  host: {
    role: 'progressbar',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-valuemin]': 'value() === null ? null : 0',
    '[attr.aria-valuemax]': 'value() === null ? null : max()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.data-indeterminate]': 'value() === null ? "" : null',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[style.--_ratio]': 'ratio()',
  },
  styles: `
    :host {
      --_color: var(--kn-color-accent);
      --_height: 0.375rem;

      position: relative;
      display: block;
      block-size: var(--kn-progress-height, var(--_height));
      border-radius: var(--kn-radius-full);
      background: var(--kn-progress-track, var(--kn-color-border-strong));
      overflow: hidden;
    }

    :host([data-size='sm']) {
      --_height: 0.25rem;
    }

    :host([data-size='lg']) {
      --_height: 0.625rem;
    }

    :host([data-tone='success']) {
      --_color: var(--kn-color-success);
    }

    :host([data-tone='warning']) {
      --_color: var(--kn-color-warning);
    }

    :host([data-tone='danger']) {
      --_color: var(--kn-color-danger);
    }

    :host([data-tone='neutral']) {
      --_color: var(--kn-color-text);
    }

    .fill {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--kn-progress-color, var(--_color));
      transform: translateX(calc((var(--_ratio) - 1) * 100% * var(--kn-dir)));
      transition: transform var(--kn-duration-slow) var(--kn-ease-out);
    }

    :host([data-indeterminate]) .fill {
      inline-size: 40%;
      transition: none;
      animation: progress-slide 1.4s var(--kn-ease-standard) infinite;
    }

    @keyframes progress-slide {
      from {
        transform: translateX(calc(-100% * var(--kn-dir)));
      }
      to {
        transform: translateX(calc(250% * var(--kn-dir)));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host([data-indeterminate]) .fill {
        animation-duration: 4s;
      }
    }
  `,
})
export class KnProgress {
  /** Текущее значение или `null` для неопределённого состояния. */
  readonly value = input<number | null>(null);
  /** Значение, соответствующее 100%. */
  readonly max = input(100, { transform: numberAttribute });
  /** Смысловая окраска. */
  readonly tone = input<KnTone>('accent');
  /** Толщина полосы. */
  readonly size = input<KnSize>('md');
  /** Доступное имя: что именно загружается или выполняется. */
  readonly ariaLabel = input<string>('Прогресс', { alias: 'aria-label' });

  protected readonly ratio = computed(() => {
    const value = this.value();
    if (value === null || this.max() <= 0) return 0;
    return Math.min(1, Math.max(0, value / this.max()));
  });
}
