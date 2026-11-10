import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnTab, KnTabs } from '@kenny/ui/tabs';

@Component({
  imports: [KnTabs, KnTab],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-tabs aria-label="Период" [(value)]="period">
      <kn-tab value="day" label="День">Сегодня: 1 284 визита, на 6% больше, чем вчера.</kn-tab>
      <kn-tab value="week" label="Неделя">За неделю: 8 912 визитов. Пик пришёлся на четверг.</kn-tab>
      <kn-tab value="month" label="Месяц">За месяц: 36 540 визитов и 412 регистраций.</kn-tab>
      <kn-tab value="year" label="Год" disabled>Данные появятся после первого года.</kn-tab>
    </kn-tabs>
    <p>Активная вкладка: {{ period() ?? 'day' }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
    }

    p {
      margin: 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class TabsBasicDemo {
  protected readonly period = signal<string | undefined>(undefined);
}
