import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Разделитель: тонкая линия между группами содержимого, при необходимости с подписью.
 * Чисто декоративному разделителю задайте `decorative` — скринридер его пропустит.
 */
@Component({
  selector: 'kn-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="label"><ng-content /></span>`,
  host: {
    '[attr.role]': 'decorative() ? "presentation" : "separator"',
    '[attr.aria-orientation]': 'decorative() || orientation() === "horizontal" ? null : "vertical"',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-align]': 'align()',
    '[style.--_gap]': 'gap()',
  },
  styles: `
    :host {
      --_line: var(--kn-divider-color, var(--kn-color-border));
      --_size: var(--kn-divider-size, 1px);
      display: flex;
      align-items: center;
      gap: var(--kn-space-3);
      margin-block: var(--_gap, 0);
      color: var(--kn-color-text-subtle);
      font-size: var(--kn-text-sm);
      line-height: var(--kn-leading-snug);
    }

    :host::before,
    :host::after {
      content: '';
      flex: 1;
      block-size: var(--_size);
      background: var(--_line);
    }

    .label:empty {
      display: none;
    }

    /* No label: one continuous line */
    :host(:has(.label:empty)) {
      gap: 0;
    }

    :host([data-align='start'])::before,
    :host([data-align='end'])::after {
      flex: 0 0 var(--kn-space-4);
    }

    :host([data-orientation='vertical']) {
      display: inline-flex;
      flex-direction: column;
      align-self: stretch;
      min-block-size: 1em;
      margin-block: 0;
      margin-inline: var(--_gap, 0);
    }

    :host([data-orientation='vertical'])::before,
    :host([data-orientation='vertical'])::after {
      inline-size: var(--_size);
      block-size: auto;
    }
  `,
})
export class KnDivider {
  /** Направление линии. Вертикальный разделитель растягивается на высоту flex-контейнера. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Положение подписи вдоль линии. */
  readonly align = input<'start' | 'center' | 'end'>('center');
  /** Отступ с обеих сторон: имя шага шкалы (`4` → `--kn-space-4`) или любое CSS-значение. */
  readonly spacing = input<string>('');
  /** Убирает роль `separator`: линия только для глаз. */
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly gap = computed(() => {
    const spacing = this.spacing();
    if (!spacing) return null;
    return /^[\d-]+$/.test(spacing) ? `var(--kn-space-${spacing})` : spacing;
  });
}
