import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnCheckbox } from '@kenny/ui/checkbox';

@Component({
  imports: [KnCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-checkbox [checked]="all()" [indeterminate]="some()" (checkedChange)="toggleAll($event)">
      Все уведомления
    </kn-checkbox>
    <div class="nested">
      @for (item of items(); track item.id) {
        <kn-checkbox [checked]="item.on" (checkedChange)="toggle(item.id, $event)">
          {{ item.label }}
        </kn-checkbox>
      }
    </div>
    <kn-checkbox disabled>Недоступно на вашем тарифе</kn-checkbox>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-3);
    }

    .nested {
      display: grid;
      gap: var(--kn-space-3);
      padding-inline-start: var(--kn-space-8);
    }
  `,
})
export default class CheckboxBasicDemo {
  protected readonly items = signal([
    { id: 'mentions', label: 'Упоминания', on: true },
    { id: 'reviews', label: 'Запросы на ревью', on: true },
    { id: 'digest', label: 'Еженедельная сводка', on: false },
  ]);
  protected readonly all = computed(() => this.items().every((i) => i.on));
  protected readonly some = computed(() => !this.all() && this.items().some((i) => i.on));

  protected toggle(id: string, on: boolean): void {
    this.items.update((items) => items.map((i) => (i.id === id ? { ...i, on } : i)));
  }

  protected toggleAll(on: boolean): void {
    this.items.update((items) => items.map((i) => ({ ...i, on })));
  }
}
