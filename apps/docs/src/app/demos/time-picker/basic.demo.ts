import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnField } from '@kenny/ui/field';
import { KnTimePicker } from '@kenny/ui/time-picker';

@Component({
  imports: [KnTimePicker, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <kn-field label="Начало встречи">
        <kn-time-picker [step]="5" [(value)]="start" />
      </kn-field>
      <kn-field label="Конец" [error]="error()">
        <kn-time-picker [step]="5" [(value)]="end" />
      </kn-field>
    </div>
    <p class="note">{{ summary() }}</p>

    <kn-field label="12-часовой формат" hint="Значение всё равно хранится как 24-часовое">
      <kn-time-picker locale="en-US" [hourCycle]="12" [(value)]="alarm" />
    </kn-field>
    <p class="note">Значение: {{ alarm() ?? 'не задано' }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-3);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-4);
    }

    .note {
      margin: 0 0 var(--kn-space-3);
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }
  `,
})
export default class TimePickerBasicDemo {
  protected readonly start = signal<string | null>('10:00');
  protected readonly end = signal<string | null>('10:45');
  protected readonly alarm = signal<string | null>('19:30');

  private readonly minutes = computed(() => {
    const [start, end] = [this.start(), this.end()];
    if (!start || !end) return null;
    const total = (time: string): number => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    return total(end) - total(start);
  });
  protected readonly error = computed(() =>
    (this.minutes() ?? 1) <= 0 ? 'Конец должен быть позже начала' : null,
  );
  protected readonly summary = computed(() => {
    const minutes = this.minutes();
    if (minutes === null) return 'Введите оба времени';
    return minutes > 0 ? `Длительность: ${minutes} мин` : 'Проверьте время';
  });
}
