import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { KnCombobox, KnOption } from '@kenny/ui/combobox';
import { KnField } from '@kenny/ui/field';

const PEOPLE = [
  'Анна Орлова',
  'Борис Ким',
  'Вера Соколова',
  'Глеб Назаров',
  'Дина Ахметова',
  'Егор Лапин',
  'Зоя Мельникова',
  'Илья Гринберг',
];

@Component({
  imports: [KnCombobox, KnOption, KnField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-field label="Исполнитель" hint="Список приходит с «сервера» с задержкой 300 мс">
      <kn-combobox
        filterMode="manual"
        placeholder="Имя или фамилия"
        [emptyText]="loading() ? 'Ищем…' : 'Никого не нашли'"
        [(query)]="query"
        [(value)]="assignee"
      >
        @for (person of results(); track person) {
          <kn-option [value]="person">{{ person }}</kn-option>
        }
      </kn-combobox>
    </kn-field>
  `,
  styles: `
    :host {
      display: block;
      max-inline-size: 22rem;
    }
  `,
})
export default class ComboboxAsyncDemo {
  protected readonly query = signal('');
  protected readonly assignee = signal<string | null>(null);
  protected readonly results = signal<string[]>(PEOPLE);
  protected readonly loading = signal(false);

  constructor() {
    // filterMode="manual": the component only reports the text, the app decides what to show.
    effect((onCleanup) => {
      const query = this.query().trim().toLowerCase();
      this.loading.set(true);
      const timer = setTimeout(() => {
        this.results.set(PEOPLE.filter((p) => p.toLowerCase().includes(query)));
        this.loading.set(false);
      }, 300);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
