import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnIcon } from '@kenny/ui/icon';
import { KnToggle, KnToggleGroup } from '@kenny/ui/toggle-group';

@Component({
  imports: [KnToggleGroup, KnToggle, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <span id="view-label" class="label">Вид списка</span>
      <kn-toggle-group aria-labelledby="view-label" requireSelection [(value)]="view">
        <button kn-toggle value="list">Список</button>
        <button kn-toggle value="board">Доска</button>
        <button kn-toggle value="calendar">Календарь</button>
      </kn-toggle-group>
    </div>

    <div class="field">
      <span id="days-label" class="label">Дни доставки: {{ days().length }} из 5</span>
      <kn-toggle-group aria-labelledby="days-label" multiple [(value)]="days">
        @for (day of week; track day.value) {
          <button kn-toggle [value]="day.value">{{ day.short }}</button>
        }
      </kn-toggle-group>
    </div>

    <div class="field">
      <span id="align-label" class="label">Выравнивание — только иконки</span>
      <kn-toggle-group aria-labelledby="align-label" requireSelection [(value)]="align">
        <button kn-toggle value="left" aria-label="По левому краю">
          <kn-icon name="align-left" />
        </button>
        <button kn-toggle value="center" aria-label="По центру">
          <kn-icon name="align-center" />
        </button>
        <button kn-toggle value="right" aria-label="По правому краю">
          <kn-icon name="align-right" />
        </button>
      </kn-toggle-group>
    </div>

    <div class="field">
      <span id="size-label" class="label">Размеры</span>
      <div class="sizes">
        <kn-toggle-group aria-labelledby="size-label" size="sm" value="m">
          <button kn-toggle value="s">S</button>
          <button kn-toggle value="m">M</button>
          <button kn-toggle value="l">L</button>
        </kn-toggle-group>
        <kn-toggle-group aria-labelledby="size-label" size="lg" value="m">
          <button kn-toggle value="s">S</button>
          <button kn-toggle value="m">M</button>
          <button kn-toggle value="l" disabled>L</button>
        </kn-toggle-group>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-5);
    }

    .field {
      display: grid;
      justify-items: start;
      gap: var(--kn-space-2);
    }

    .label {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }

    .sizes {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-3);
    }
  `,
})
export default class ToggleGroupBasicDemo {
  protected readonly view = signal<string | null>('board');
  protected readonly days = signal<string[]>(['mon', 'wed', 'fri']);
  protected readonly align = signal<string | null>('left');
  protected readonly week = [
    { value: 'mon', short: 'Пн' },
    { value: 'tue', short: 'Вт' },
    { value: 'wed', short: 'Ср' },
    { value: 'thu', short: 'Чт' },
    { value: 'fri', short: 'Пт' },
  ];
}
