import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnDateRange, KnDateRangePicker, KnDateRangePreset } from '@kenny/ui/date-picker';
import { KnField } from '@kenny/ui/field';

const DAY = 24 * 60 * 60 * 1000;

function daysBack(days: number): KnDateRange {
  const end = new Date();
  return { start: new Date(end.getTime() - (days - 1) * DAY), end };
}

function thisMonth(): KnDateRange {
  const now = new Date();
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
}

@Component({
  imports: [KnDateRangePicker, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Период отчёта" [hint]="summary()">
      <kn-date-range-picker clearable [presets]="presets" [max]="today" [(value)]="period" />
    </kn-field>
  `,
  styles: `
    :host {
      display: block;
      max-inline-size: 20rem;
    }
  `,
})
export default class DateRangeDemo {
  protected readonly today = new Date();
  protected readonly presets: KnDateRangePreset[] = [
    { label: 'Последние 7 дней', range: daysBack(7) },
    { label: 'Последние 30 дней', range: daysBack(30) },
    { label: 'Этот месяц', range: thisMonth() },
  ];
  protected readonly period = signal<KnDateRange | null>(daysBack(7));

  protected readonly summary = computed(() => {
    const period = this.period();
    if (!period) return 'Без периода в отчёт попадут все счета';
    const days = Math.round((period.end.getTime() - period.start.getTime()) / DAY) + 1;
    return `Дней в периоде: ${days}. Будущие даты недоступны.`;
  });
}
