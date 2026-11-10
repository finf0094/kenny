import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KnTone } from '@kenny/ui/core';

/** Короткая метка статуса или счётчик. */
@Component({
  selector: 'kn-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dot()) {
      <span class="dot" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
  styles: `
    :host {
      --_fg: var(--kn-color-text-muted);
      --_soft: var(--kn-color-surface-sunken);
      --_solid: var(--kn-color-text);
      --_on-solid: var(--kn-color-canvas);

      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1-5);
      box-sizing: border-box;
      min-inline-size: 1.375rem;
      block-size: 1.375rem;
      padding: 0 var(--kn-space-2);
      border-radius: var(--kn-badge-radius, var(--kn-radius-full));
      background: var(--_soft);
      color: var(--_fg);
      font-size: var(--kn-text-xs);
      font-weight: var(--kn-weight-semibold);
      font-variant-numeric: tabular-nums;
      line-height: 1;
      white-space: nowrap;
      justify-content: center;
      vertical-align: middle;
    }

    :host([data-size='lg']) {
      block-size: 1.75rem;
      padding-inline: var(--kn-space-3);
      font-size: var(--kn-text-sm);
    }

    :host([data-tone='accent']) {
      --_fg: var(--kn-color-accent-text);
      --_soft: var(--kn-color-accent-soft);
      --_solid: var(--kn-color-accent);
      --_on-solid: var(--kn-color-on-accent);
    }

    :host([data-tone='success']) {
      --_fg: var(--kn-color-success);
      --_soft: var(--kn-color-success-soft);
      --_solid: var(--kn-color-success);
    }

    :host([data-tone='warning']) {
      --_fg: var(--kn-color-warning);
      --_soft: var(--kn-color-warning-soft);
      --_solid: var(--kn-color-warning);
    }

    :host([data-tone='danger']) {
      --_fg: var(--kn-color-danger);
      --_soft: var(--kn-color-danger-soft);
      --_solid: var(--kn-color-danger);
      --_on-solid: var(--kn-color-on-danger);
    }

    :host([data-variant='solid']) {
      background: var(--_solid);
      color: var(--_on-solid);
    }

    :host([data-variant='outline']) {
      background: transparent;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--_fg) 45%, transparent);
    }

    .dot {
      inline-size: 0.4375rem;
      block-size: 0.4375rem;
      border-radius: 50%;
      background: currentColor;
    }
  `,
})
export class KnBadge {
  /** Смысловая окраска. */
  readonly tone = input<KnTone>('neutral');
  /** Насыщенность заливки. */
  readonly variant = input<'soft' | 'solid' | 'outline'>('soft');
  /** Размер. */
  readonly size = input<'md' | 'lg'>('md');
  /** Точка-индикатор перед текстом. */
  readonly dot = input(false, { transform: booleanAttribute });
}
