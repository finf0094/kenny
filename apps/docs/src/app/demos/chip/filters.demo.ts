import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnChip } from '@kenny/ui/chip';

interface Task {
  title: string;
  tags: string[];
}

const TASKS: Task[] = [
  { title: 'Собрать макет главной', tags: ['Дизайн'] },
  { title: 'Починить выгрузку счетов', tags: ['Бэкенд', 'Срочно'] },
  { title: 'Обновить тексты онбординга', tags: ['Дизайн', 'Тексты'] },
  { title: 'Перевести письма на английский', tags: ['Тексты'] },
  { title: 'Ускорить поиск по клиентам', tags: ['Бэкенд'] },
];

@Component({
  imports: [KnChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filters" role="group" aria-label="Фильтр по меткам">
      @for (tag of tags; track tag) {
        <kn-chip selectable [selected]="active().has(tag)" (selectedChange)="toggle(tag)">
          {{ tag }}
        </kn-chip>
      }
    </div>
    <ul class="list" aria-live="polite">
      @for (task of visible(); track task.title) {
        <li>{{ task.title }}</li>
      } @empty {
        <li class="empty">Под такие метки ничего не подходит.</li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
      max-inline-size: 28rem;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--kn-space-2);
    }

    .list {
      display: grid;
      gap: var(--kn-space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .empty {
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class ChipFiltersDemo {
  protected readonly tags = ['Дизайн', 'Бэкенд', 'Тексты', 'Срочно'];
  protected readonly active = signal(new Set<string>(['Дизайн']));

  protected readonly visible = computed(() => {
    const active = this.active();
    if (active.size === 0) return TASKS;
    return TASKS.filter((task) => task.tags.some((tag) => active.has(tag)));
  });

  protected toggle(tag: string): void {
    this.active.update((current) => {
      const next = new Set(current);
      if (!next.delete(tag)) next.add(tag);
      return next;
    });
  }
}
