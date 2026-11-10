import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnDatePicker } from '@kenny/ui/date-picker';
import { KnField } from '@kenny/ui/field';

@Component({
  imports: [KnDatePicker, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Дата релиза" hint="Введите дату или откройте календарь (Alt + ↓)">
      <kn-date-picker [(value)]="release" />
    </kn-field>

    <kn-field label="Доставка" hint="Только будни в ближайшие 30 дней">
      <kn-date-picker [(value)]="delivery" [min]="today" [max]="inMonth" [dateFilter]="weekdaysOnly" />
    </kn-field>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
      max-inline-size: 18rem;
    }
  `,
})
export default class DatePickerBasicDemo {
  protected readonly today = new Date();
  protected readonly inMonth = new Date(Date.now() + 30 * 864e5);
  protected readonly release = signal<Date | null>(new Date());
  protected readonly delivery = signal<Date | null>(null);
  protected readonly weekdaysOnly = (date: Date) => date.getDay() !== 0 && date.getDay() !== 6;
}
