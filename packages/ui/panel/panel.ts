import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { KnCollapse } from '@kenny/ui/collapse';
import { KnIcon } from '@kenny/ui/icon';

/**
 * Секция с заголовком, которую можно свернуть. Заголовок — настоящая кнопка внутри
 * элемента с ролью заголовка; действия из слота `knPanelActions` остаются снаружи кнопки.
 */
@Component({
  selector: 'kn-panel',
  imports: [KnCollapse, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="header">
      <div class="heading" role="heading" [attr.aria-level]="headingLevel()">
        @if (collapsible()) {
          <button
            class="toggle"
            type="button"
            [id]="headerId"
            [attr.aria-expanded]="expanded()"
            [attr.aria-controls]="bodyId"
            (click)="expanded.set(!expanded())"
          >
            <kn-icon class="chevron" name="chevron-right" />
            <span class="text">
              <span class="title">{{ heading() }}</span>
              @if (description()) {
                <span class="description">{{ description() }}</span>
              }
            </span>
          </button>
        } @else {
          <span class="text static" [id]="headerId">
            <span class="title">{{ heading() }}</span>
            @if (description()) {
              <span class="description">{{ description() }}</span>
            }
          </span>
        }
      </div>
      <div class="actions"><ng-content select="[knPanelActions]" /></div>
    </div>
    <kn-collapse [open]="!collapsible() || expanded()">
      <div class="body" role="region" [id]="bodyId" [attr.aria-labelledby]="headerId">
        <ng-content />
      </div>
    </kn-collapse>
  `,
  host: { '[attr.data-expanded]': 'expanded() ? "" : null' },
  styles: `
    :host {
      display: block;
      border-radius: var(--kn-panel-radius, var(--kn-radius-lg));
      background: var(--kn-panel-bg, var(--kn-color-surface));
      backdrop-filter: var(--kn-surface-filter);
      -webkit-backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-panel-shadow, var(--kn-elevation-card));
      overflow: hidden;
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      padding-inline-end: var(--kn-space-3);
    }

    .heading {
      flex: 1;
      min-inline-size: 0;
    }

    .toggle,
    .static {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      box-sizing: border-box;
      inline-size: 100%;
      padding: var(--kn-space-3) var(--kn-space-4);
    }

    .toggle {
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .toggle:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: -3px;
      border-radius: var(--kn-radius-lg);
    }

    .text {
      display: grid;
      min-inline-size: 0;
    }

    .title {
      font-weight: var(--kn-weight-semibold);
      letter-spacing: var(--kn-tracking-snug);
    }

    .description {
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }

    .chevron {
      --kn-icon-size: 1.125rem;
      color: var(--kn-color-text-subtle);
      transition: transform var(--kn-duration-normal) var(--kn-ease-spring);
    }

    :host-context([dir='rtl']) .chevron {
      transform: scaleX(-1);
    }

    :host([data-expanded]) .chevron {
      transform: rotate(90deg);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--kn-space-1);
    }

    .actions:empty {
      display: none;
    }

    .body {
      padding: var(--kn-panel-padding, var(--kn-space-1) var(--kn-space-4) var(--kn-space-4));
    }
  `,
})
export class KnPanel {
  /** Заголовок панели. */
  readonly heading = input.required<string>();
  /** Пояснение под заголовком. */
  readonly description = input<string>('');
  /** Раскрыта ли панель. Двусторонняя привязка: `[(expanded)]`. */
  readonly expanded = model(true);
  /** Можно ли сворачивать панель. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** Уровень заголовка для структуры документа (`aria-level`). */
  readonly headingLevel = input(3, { transform: numberAttribute });

  private readonly ids = inject(_IdGenerator);
  protected readonly headerId = this.ids.getId('kn-panel-header-');
  protected readonly bodyId = this.ids.getId('kn-panel-body-');
}
