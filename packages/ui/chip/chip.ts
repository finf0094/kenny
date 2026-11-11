import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { injectKnLabels, KnTone, useRipple } from '@kenny/ui/core';
import { KnIcon } from '@kenny/ui/icon';

/**
 * Чип: значение, которое можно убрать (метка, выбранный фильтр, адресат), или
 * переключаемый фильтр. С `selectable` тело чипа становится кнопкой с `aria-pressed`.
 */
@Component({
  selector: 'kn-chip',
  imports: [KnIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (selectable()) {
      <button
        class="body"
        type="button"
        [id]="bodyId"
        [disabled]="disabled()"
        [attr.aria-pressed]="selected()"
        (click)="selected.set(!selected())"
      >
        @if (selected()) {
          <kn-icon class="check" name="check" />
        }
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    } @else {
      <span class="body" [id]="bodyId"><ng-container [ngTemplateOutlet]="content" /></span>
    }
    @if (removable()) {
      <button
        class="remove"
        type="button"
        [id]="removeId"
        [disabled]="disabled()"
        [attr.aria-label]="removeLabel() ?? labels().chip.remove"
        [attr.aria-labelledby]="removeId + ' ' + bodyId"
        (click)="removed.emit()"
      >
        <kn-icon name="x" />
      </button>
    }
  `,
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.data-selected]': 'selectable() && selected() ? "" : null',
    '[attr.data-selectable]': 'selectable() ? "" : null',
    '[attr.data-removable]': 'removable() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  styles: `
    :host {
      --_fg: var(--kn-color-text);
      --_bg: var(--kn-color-surface-sunken);
      --_on: var(--kn-color-accent-text);
      --_on-bg: var(--kn-color-accent-soft);
      --_h: 1.75rem;
      --_pad: var(--kn-space-3);

      position: relative;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      max-inline-size: 100%;
      block-size: var(--kn-chip-height, var(--_h));
      border-radius: var(--kn-chip-radius, 999px);
      background: var(--kn-chip-bg, var(--_bg));
      box-shadow: var(--kn-chip-shadow, none);
      color: var(--kn-chip-color, var(--_fg));
      font-size: var(--kn-text-sm);
      font-weight: var(--kn-weight-medium);
      line-height: 1;
      vertical-align: middle;
      isolation: isolate;
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    :host([data-size='sm']) {
      --_h: 1.5rem;
      --_pad: var(--kn-space-2);
      font-size: var(--kn-text-xs);
    }

    :host([data-tone='accent']) {
      --_fg: var(--kn-color-accent-text);
      --_bg: var(--kn-color-accent-soft);
    }

    :host([data-tone='success']) {
      --_fg: var(--kn-color-success);
      --_bg: var(--kn-color-success-soft);
    }

    :host([data-tone='warning']) {
      --_fg: var(--kn-color-warning);
      --_bg: var(--kn-color-warning-soft);
    }

    :host([data-tone='danger']) {
      --_fg: var(--kn-color-danger);
      --_bg: var(--kn-color-danger-soft);
    }

    /* The selected fill fades in above the resting one: opacity only */
    :host::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background: var(--kn-chip-selected-bg, var(--_on-bg));
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
    }

    :host([data-selected]) {
      color: var(--kn-chip-selected-color, var(--_on));
    }

    :host([data-selected])::before {
      opacity: 1;
    }

    :host([data-selectable]:active:not([data-disabled])) {
      transform: scale(var(--kn-press-scale));
      transition-duration: var(--kn-duration-instant);
    }

    :host([data-disabled]) {
      opacity: 0.5;
    }

    .body {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--kn-space-1);
      min-inline-size: 0;
      block-size: 100%;
      padding: 0 var(--_pad);
      border: 0;
      border-radius: inherit;
      background: none;
      color: inherit;
      font: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host([data-removable]) .body {
      padding-inline-end: var(--kn-space-1);
    }

    button.body {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button.body:disabled,
    .remove:disabled {
      cursor: not-allowed;
    }

    /* Hover layer of the toggle */
    button.body::after,
    .remove::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--kn-color-hover);
      opacity: 0;
      transition: opacity var(--kn-duration-fast) var(--kn-ease-standard);
      pointer-events: none;
    }

    @media (hover: hover) {
      button.body:hover:not(:disabled)::after,
      .remove:hover:not(:disabled)::after {
        opacity: 1;
      }
    }

    .body:focus-visible,
    .remove:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    .check {
      --kn-icon-size: 0.875rem;
      flex: none;
      margin-inline-start: calc(var(--kn-space-1) * -1);
      animation: kn-pop-in var(--kn-duration-slow) var(--kn-ease-spring-bouncy);
    }

    .remove {
      position: relative;
      flex: none;
      display: grid;
      place-items: center;
      inline-size: 1.25rem;
      block-size: 1.25rem;
      margin-inline-end: var(--kn-space-1);
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: none;
      color: inherit;
      cursor: pointer;
    }

    /* A 20px button with a 28px touch target */
    .remove::before {
      content: '';
      position: absolute;
      inset: -0.25rem;
    }

    .remove kn-icon {
      --kn-icon-size: 0.875rem;
      opacity: 0.72;
    }
  `,
})
export class KnChip {
  /** Смысловая окраска. */
  readonly tone = input<KnTone>('neutral');
  /** Размер. */
  readonly size = input<'sm' | 'md'>('md');
  /** Делает чип переключателем: нажатие меняет `selected`. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Выбран ли чип. Двусторонняя привязка: `[(selected)]`. */
  readonly selected = model(false);
  /** Показывает кнопку удаления. Сам чип не исчезает — уберите его по событию `removed`. */
  readonly removable = input(false, { transform: booleanAttribute });
  /** Подпись кнопки удаления. По умолчанию — из `provideKnLabels`; текст чипа добавляется сам. */
  readonly removeLabel = input<string>();
  /** Отключает чип. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Нажата кнопка удаления. */
  readonly removed = output<void>();

  protected readonly labels = injectKnLabels();
  private readonly ids = inject(_IdGenerator);
  protected readonly bodyId = this.ids.getId('kn-chip-');
  protected readonly removeId = this.ids.getId('kn-chip-remove-');

  constructor() {
    useRipple('button.body');
  }
}
