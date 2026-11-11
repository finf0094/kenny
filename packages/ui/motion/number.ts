import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
  PLATFORM_ID,
  signal,
  untracked,
} from '@angular/core';

/**
 * Число, которое «докручивается» до нового значения, а не подменяется рывком: суммы,
 * счётчики, показатели на дашборде. Форматирует через `Intl.NumberFormat`.
 *
 * Скринридер получает итоговое значение сразу, промежуточные кадры от него скрыты.
 * На сервере и при `prefers-reduced-motion` выводится сразу итог.
 */
@Component({
  selector: 'kn-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="sr">{{ format(value()) }}</span>
    <span aria-hidden="true">{{ format(shown()) }}</span>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .sr {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class KnNumber {
  /** Значение, к которому идёт счёт. */
  readonly value = input.required({ transform: numberAttribute });
  /** Длительность перехода, мс. */
  readonly duration = input(900, { transform: numberAttribute });
  /** Настройки `Intl.NumberFormat`: валюта, проценты, компактная запись. */
  readonly options = input<Intl.NumberFormatOptions>({});
  /** Считать от нуля при первом появлении. Без него анимируются только изменения. */
  readonly appear = input(false, { transform: booleanAttribute });
  /** Локаль форматирования. По умолчанию `LOCALE_ID`. */
  readonly locale = input<string>(inject(LOCALE_ID));

  protected readonly shown = signal(0);
  private readonly formatter = computed(() => new Intl.NumberFormat(this.locale(), this.options()));
  /** Decimal places to keep while counting, so intermediate frames match the final format. */
  private readonly digits = computed(
    () => this.formatter().resolvedOptions().maximumFractionDigits ?? 0,
  );
  private frame = 0;
  private first = true;

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    effect(() => {
      const target = this.value();
      const duration = this.duration();
      untracked(() => {
        const first = this.first;
        this.first = false;
        const animate =
          browser &&
          (!first || this.appear()) &&
          duration > 0 &&
          !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (browser) cancelAnimationFrame(this.frame);
        if (!animate) {
          this.shown.set(target);
          return;
        }
        this.run(first ? 0 : this.shown(), target, duration);
      });
    });
    inject(DestroyRef).onDestroy(() => {
      if (browser) cancelAnimationFrame(this.frame);
    });
  }

  protected format(value: number): string {
    return this.formatter().format(value);
  }

  private run(from: number, to: number, duration: number): void {
    const start = performance.now();
    const factor = 10 ** this.digits();
    const tick = (now: number): void => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease-out quint: a fast start that settles on the final digits
      const eased = 1 - (1 - progress) ** 5;
      const value = from + (to - from) * eased;
      this.shown.set(progress === 1 ? to : Math.round(value * factor) / factor);
      if (progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
}
