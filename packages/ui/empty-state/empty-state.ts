import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { KnIcon } from '@kenny/ui/icon';

/**
 * Пустое состояние: объясняет, почему здесь ничего нет, и предлагает следующий шаг.
 * Кнопки действий передаются проекцией контента.
 */
@Component({
  selector: 'kn-empty-state',
  imports: [KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (icon()) {
      <span class="icon"><kn-icon [name]="icon()" /></span>
    }
    <div class="heading" role="heading" [attr.aria-level]="headingLevel()">{{ heading() }}</div>
    @if (description()) {
      <p class="description">{{ description() }}</p>
    }
    <div class="actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: var(--kn-space-2);
      padding: var(--kn-empty-state-padding, var(--kn-space-10) var(--kn-space-6));
      text-align: center;
    }

    .icon {
      display: grid;
      place-items: center;
      inline-size: 3.5rem;
      block-size: 3.5rem;
      margin-block-end: var(--kn-space-2);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface);
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-elevation-raised);
      color: var(--kn-color-accent-text);
    }

    .icon kn-icon {
      --kn-icon-size: 1.625rem;
    }

    .heading {
      font-size: var(--kn-text-lg);
      font-weight: var(--kn-weight-semibold);
      letter-spacing: var(--kn-tracking-snug);
    }

    .description {
      margin: 0;
      max-inline-size: 26rem;
      color: var(--kn-color-text-muted);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--kn-space-2);
      margin-block-start: var(--kn-space-3);
    }

    .actions:empty {
      display: none;
    }
  `,
})
export class KnEmptyState {
  /** Заголовок: что произошло или чего здесь пока нет. */
  readonly heading = input.required<string>();
  /** Пояснение и подсказка, что делать дальше. */
  readonly description = input<string>('');
  /** Имя иконки. */
  readonly icon = input<string>('');
  /** Уровень заголовка (`aria-level`). */
  readonly headingLevel = input(3, { transform: numberAttribute });
}
