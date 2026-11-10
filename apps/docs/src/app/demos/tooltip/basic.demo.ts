import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { KnTooltip } from '@kenny/ui/tooltip';

@Component({
  imports: [KnTooltip, KnButton, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-icon-button variant="glass" tone="neutral" aria-label="Архивировать" knTooltip="В архив (E)">
      <kn-icon name="archive" />
    </button>
    <button kn-icon-button variant="glass" tone="neutral" aria-label="Отложить" knTooltip="Напомнить позже" knTooltipPlacement="bottom">
      <kn-icon name="clock" />
    </button>
    <button kn-icon-button variant="glass" tone="neutral" aria-label="Удалить" knTooltip="Удалить навсегда" knTooltipPlacement="end">
      <kn-icon name="trash" />
    </button>
    <button kn-button variant="soft" knTooltip="Появляется сразу" [knTooltipDelay]="0">Без задержки</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-3);
    }
  `,
})
export default class TooltipBasicDemo {}
