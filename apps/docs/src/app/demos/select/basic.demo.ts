import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnOption, KnOptionGroup, KnSelect } from '@kenny/ui/select';

@Component({
  imports: [KnSelect, KnOption, KnOptionGroup, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Часовой пояс" hint="Влияет на время в отчётах">
      <kn-select [(value)]="zone" placeholder="Выберите пояс">
        <kn-option-group label="Европа">
          <kn-option value="Europe/Kaliningrad">Калининград (UTC+2)</kn-option>
          <kn-option value="Europe/Moscow">Москва (UTC+3)</kn-option>
          <kn-option value="Europe/Samara">Самара (UTC+4)</kn-option>
        </kn-option-group>
        <kn-option-group label="Азия">
          <kn-option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</kn-option>
          <kn-option value="Asia/Novosibirsk">Новосибирск (UTC+7)</kn-option>
          <kn-option value="Asia/Vladivostok">Владивосток (UTC+10)</kn-option>
          <kn-option value="Asia/Kamchatka" disabled>Камчатка (скоро)</kn-option>
        </kn-option-group>
      </kn-select>
    </kn-field>

    <div class="row">
      <kn-select size="sm" aria-label="Период" [(value)]="period">
        @for (p of periods; track p.value) {
          <kn-option [value]="p.value">{{ p.label }}</kn-option>
        }
      </kn-select>
      <kn-select aria-label="Период" [(value)]="period">
        @for (p of periods; track p.value) {
          <kn-option [value]="p.value">{{ p.label }}</kn-option>
        }
      </kn-select>
      <kn-select size="lg" aria-label="Период" [(value)]="period">
        @for (p of periods; track p.value) {
          <kn-option [value]="p.value">{{ p.label }}</kn-option>
        }
      </kn-select>
    </div>

    <kn-select aria-label="Отключённый список" placeholder="Недоступно" disabled />
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 30rem;
    }

    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
      align-items: center;
      gap: var(--kn-space-3);
    }
  `,
})
export default class SelectBasicDemo {
  protected readonly zone = signal<string | null>('Europe/Moscow');
  protected readonly period = signal<number | null>(7);
  protected readonly periods = [
    { value: 1, label: 'Сегодня' },
    { value: 7, label: '7 дней' },
    { value: 30, label: '30 дней' },
    { value: 365, label: 'Год' },
  ];
}
