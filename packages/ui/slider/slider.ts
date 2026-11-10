import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { knDefaultSize, KnFormControl, KnSize } from '@kenny/ui/core';

/**
 * Ползунок для выбора числа из диапазона. Внутри нативный `<input type="range">`,
 * поэтому стрелки, Home/End, PageUp/PageDown и RTL работают как в браузере;
 * бегунок и заливка двигаются только через `transform`.
 */
@Component({
  selector: 'kn-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="track" aria-hidden="true"><span class="fill"></span></span>
    <span class="thumb" aria-hidden="true"></span>
    <input
      class="native"
      type="range"
      [id]="controlId"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [value]="value()"
      [disabled]="isDisabled()"
      [attr.name]="name() || null"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-valuetext]="valueText()"
      [attr.aria-invalid]="isInvalid() ? 'true' : null"
      (input)="commit($any($event.target).valueAsNumber)"
      (blur)="markTouched()"
    />
  `,
  host: {
    // The label belongs to the inner element; the wrapper must not carry a copy
    '[attr.aria-label]': 'null',
    '[attr.data-size]': 'size()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[style.--_ratio]': 'ratio()',
  },
  styles: `
    :host {
      --_k: 1;
      --_thumb: calc(var(--kn-slider-thumb-size, 1.5rem) * var(--_k));
      --_track: calc(var(--kn-slider-track-size, 0.375rem) * var(--_k));
      /* Distance the thumb travels: track width minus the thumb itself */
      --_travel: calc(100cqi - var(--_thumb));

      position: relative;
      display: block;
      container-type: inline-size;
      block-size: var(--_thumb);
      min-inline-size: 6rem;
      touch-action: pan-y;
    }

    :host([data-size='sm']) {
      --_k: 0.75;
    }

    :host([data-size='lg']) {
      --_k: 1.25;
    }

    .track {
      position: absolute;
      inset-inline: 0;
      inset-block-start: calc(50% - var(--_track) / 2);
      block-size: var(--_track);
      border-radius: var(--kn-radius-full);
      background: var(--kn-slider-track, var(--kn-color-border-strong));
      overflow: hidden;
    }

    /* A full-width bar slid so that its end sits under the thumb centre */
    .fill {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--kn-slider-color, var(--kn-color-accent));
      transform: translateX(
        calc((var(--_thumb) / 2 + var(--_ratio) * var(--_travel) - 100cqi) * var(--kn-dir))
      );
    }

    .thumb {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      inline-size: var(--_thumb);
      block-size: var(--_thumb);
      border-radius: 50%;
      background: var(--kn-slider-thumb, #fff);
      box-shadow: var(
        --kn-slider-thumb-shadow,
        inset 0 0 0 0.5px rgb(8 12 28 / 0.08),
        0 1px 2px rgb(8 12 28 / 0.14),
        0 4px 12px rgb(8 12 28 / 0.2)
      );
      transform: translateX(calc(var(--_ratio) * var(--_travel) * var(--kn-dir)));
    }

    /* The thumb swells while dragged — the scale lives on a pseudo-element so it can spring */
    .thumb::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: inherit;
      box-shadow: inherit;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    .native {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      margin: 0;
      opacity: 0;
      cursor: pointer;
      appearance: none;
    }

    /* Keep the native thumb the same size so pointer mapping matches the visual thumb */
    .native::-webkit-slider-thumb {
      appearance: none;
      inline-size: var(--_thumb);
      block-size: var(--_thumb);
    }

    .native::-moz-range-thumb {
      inline-size: var(--_thumb);
      block-size: var(--_thumb);
      border: 0;
    }

    :host(:has(.native:active:not(:disabled))) .thumb::after {
      transform: scale(1.18);
    }

    :host(:has(.native:focus-visible)) .thumb {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    :host([data-disabled]) {
      opacity: 0.5;
    }

    :host([data-disabled]) .native {
      cursor: not-allowed;
    }
  `,
})
export class KnSlider extends KnFormControl<number> {
  /** Текущее значение. Двусторонняя привязка: `[(value)]`. */
  readonly value = model(0);
  /** Минимум. */
  readonly min = input(0, { transform: numberAttribute });
  /** Максимум. */
  readonly max = input(100, { transform: numberAttribute });
  /** Шаг. */
  readonly step = input(1, { transform: numberAttribute });
  /** Размер. */
  readonly size = input<KnSize>(knDefaultSize());
  /** Превращает значение в текст для скринридера, например `v => v + ' %'`. */
  readonly formatValue = input<((value: number) => string) | null>(null);

  protected readonly model = this.value;

  protected readonly ratio = computed(() => {
    const span = this.max() - this.min();
    if (span <= 0) return 0;
    return Math.min(1, Math.max(0, (this.value() - this.min()) / span));
  });

  protected readonly valueText = computed(() => this.formatValue()?.(this.value()) ?? null);

  protected override coerce(value: number): number {
    return typeof value === 'number' && !Number.isNaN(value) ? value : this.min();
  }
}
