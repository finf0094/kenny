import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KnSize, injectKnLabels } from '@kenny/ui/core';

/**
 * Индикатор неопределённой загрузки. Объявляется скринридеру как `progressbar`
 * без значения; внутри уже подписанного контейнера (кнопка с `aria-busy`) можно
 * скрыть через `decorative`.
 */
@Component({
  selector: 'kn-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle class="track" cx="12" cy="12" r="9" />
      <path class="arc" d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  `,
  host: {
    '[attr.role]': 'decorative() ? null : "progressbar"',
    '[attr.aria-label]': 'decorative() ? null : (label() ?? labels().spinner.label)',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.data-size]': 'size()',
  },
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      inline-size: var(--kn-spinner-size, 1.25rem);
      block-size: var(--kn-spinner-size, 1.25rem);
      color: var(--kn-spinner-color, currentColor);
    }

    :host([data-size='sm']) {
      --kn-spinner-size: 1rem;
    }

    :host([data-size='lg']) {
      --kn-spinner-size: 1.75rem;
    }

    svg {
      inline-size: 100%;
      block-size: 100%;
      animation: kn-spin 0.75s linear infinite;
    }

    circle,
    path {
      stroke: currentColor;
      stroke-width: 2.5;
      stroke-linecap: round;
    }

    .track {
      opacity: 0.18;
    }

    @media (prefers-reduced-motion: reduce) {
      svg {
        animation-duration: 2.4s;
      }
    }
  `,
})
export class KnSpinner {
  protected readonly labels = injectKnLabels();
  /** Размер индикатора. */
  readonly size = input<KnSize>('md');
  /** Подпись для скринридера. По умолчанию — из `provideKnLabels`. */
  readonly label = input<string>();
  /** Скрывает индикатор от вспомогательных технологий. */
  readonly decorative = input(false, { transform: booleanAttribute });
}
