import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnCalendar } from '@kenny/ui/date-picker';

@Component({
  imports: [KnCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <kn-calendar [(value)]="date" />
    </div>
    <p>Выбрано: {{ date()?.toLocaleDateString('ru') ?? '—' }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-3);
      justify-items: start;
    }

    .card {
      padding: var(--kn-space-4);
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface);
      backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-elevation-card);
    }

    p {
      margin: 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class DatePickerCalendarDemo {
  protected readonly date = signal<Date | null>(new Date());
}
