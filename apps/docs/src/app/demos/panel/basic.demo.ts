import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnCheckbox } from '@kenny/ui/checkbox';
import { KnIcon } from '@kenny/ui/icon';
import { KnPanel } from '@kenny/ui/panel';

@Component({
  imports: [KnPanel, KnButton, KnIcon, KnCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-panel heading="Фильтры" description="Статус и исполнитель" [(expanded)]="filtersOpen">
      <button knPanelActions kn-icon-button size="sm" variant="ghost" tone="neutral" aria-label="Сбросить фильтры">
        <kn-icon name="refresh" />
      </button>
      <div class="stack">
        <kn-checkbox [checked]="true">В работе</kn-checkbox>
        <kn-checkbox [checked]="true">На ревью</kn-checkbox>
        <kn-checkbox>Завершённые</kn-checkbox>
      </div>
    </kn-panel>

    <kn-panel heading="Сводка" [collapsible]="false">
      <p>Эта панель не сворачивается: у заголовка нет кнопки, остаётся только структура.</p>
    </kn-panel>

    <button kn-button variant="soft" size="sm" (click)="filtersOpen.set(!filtersOpen())">
      {{ filtersOpen() ? 'Свернуть' : 'Развернуть' }} фильтры снаружи
    </button>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 26rem;
      justify-items: start;
    }

    kn-panel {
      inline-size: 100%;
    }

    .stack {
      display: grid;
      gap: var(--kn-space-3);
    }

    p {
      margin: 0;
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class PanelBasicDemo {
  protected readonly filtersOpen = signal(true);
}
