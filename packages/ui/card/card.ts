import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KnCardVariant, knDefaults } from '@kenny/ui/core';

export type { KnCardVariant } from '@kenny/ui/core';

/**
 * Поверхность для группы связанного содержимого. Слоты размечаются атрибутами:
 * `knCardMedia`, `knCardHeader`, `knCardFooter`; всё остальное попадает в тело.
 */
@Component({
  selector: 'kn-card, a[kn-card], button[kn-card]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content select="[knCardMedia]" />
    <div class="body">
      <ng-content select="[knCardHeader]" />
      <ng-content />
      <ng-content select="[knCardFooter]" />
    </div>
  `,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-padding]': 'padding()',
    '[attr.data-interactive]': 'interactive() ? "" : null',
  },
  styles: `
    :host {
      --_pad: var(--kn-space-5);

      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      min-inline-size: 0;
      border: 0;
      border-radius: var(--kn-card-radius, var(--kn-radius-lg));
      color: var(--kn-color-text);
      font: inherit;
      text-align: start;
      text-decoration: none;
      overflow: hidden;
    }

    :host([data-variant='surface']) {
      background: var(--kn-card-bg, var(--kn-color-surface));
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-card-shadow, var(--kn-elevation-card));
    }

    /* Raised: lifted off the page like a popup */
    :host([data-variant='raised']) {
      background: var(--kn-card-bg, var(--kn-color-surface-raised));
      backdrop-filter: var(--kn-surface-filter-raised);
      -webkit-backdrop-filter: var(--kn-surface-filter-raised);
      box-shadow: var(--kn-card-shadow, var(--kn-elevation-popup));
    }

    :host([data-variant='outline']) {
      background: var(--kn-card-bg, transparent);
      box-shadow: var(--kn-card-shadow, inset 0 0 0 1px var(--kn-color-border-strong));
    }

    :host([data-variant='plain']) {
      background: var(--kn-card-bg, transparent);
    }

    :host([data-padding='none']) {
      --_pad: 0;
    }

    :host([data-padding='sm']) {
      --_pad: var(--kn-space-3);
    }

    :host([data-padding='lg']) {
      --_pad: var(--kn-space-8);
    }

    .body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--kn-space-3);
      padding: var(--kn-card-padding, var(--_pad));
      min-block-size: 0;
    }

    :host ::ng-deep > [knCardMedia] {
      display: block;
      inline-size: 100%;
      object-fit: cover;
    }

    :host ::ng-deep > .body > [knCardFooter] {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      margin-block-start: auto;
      padding-block-start: var(--kn-space-2);
    }

    /* Interactive cards lift towards the pointer */
    :host([data-interactive]) {
      cursor: pointer;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    @media (hover: hover) {
      :host([data-interactive]:hover) {
        transform: translateY(-3px);
      }
    }

    :host([data-interactive]:active) {
      transform: scale(0.985);
      transition-duration: var(--kn-duration-instant);
    }

    :host(:focus-visible) {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }
  `,
})
export class KnCard {
  /** Материал поверхности. */
  readonly variant = input<KnCardVariant>(knDefaults('card').variant ?? 'surface');
  /** Внутренние отступы. */
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  /** Реакция на наведение и нажатие — для карточек-ссылок и карточек-кнопок. */
  readonly interactive = input(false, { transform: booleanAttribute });
}
