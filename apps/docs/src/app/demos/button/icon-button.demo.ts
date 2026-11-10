import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';

@Component({
  imports: [KnButton, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-icon-button aria-label="Добавить"><kn-icon name="plus" /></button>
    <button kn-icon-button variant="soft" aria-label="Изменить"><kn-icon name="edit" /></button>
    <button kn-icon-button variant="glass" tone="neutral" aria-label="В избранное">
      <kn-icon name="star" />
    </button>
    <button kn-icon-button variant="ghost" tone="neutral" aria-label="Ещё">
      <kn-icon name="more" />
    </button>
    <button kn-icon-button variant="soft" tone="danger" aria-label="Удалить">
      <kn-icon name="trash" />
    </button>
    <span class="divider" aria-hidden="true"></span>
    <button kn-icon-button size="sm" variant="glass" tone="neutral" aria-label="Закрыть">
      <kn-icon name="x" />
    </button>
    <button kn-icon-button size="lg" variant="glass" tone="neutral" aria-label="Поиск">
      <kn-icon name="search" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-3);
    }

    .divider {
      inline-size: 1px;
      block-size: var(--kn-space-6);
      background: var(--kn-color-border-strong);
    }
  `,
})
export default class IconButtonDemo {}
