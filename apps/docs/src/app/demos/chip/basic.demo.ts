import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnChip } from '@kenny/ui/chip';

@Component({
  imports: [KnChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row" role="group" aria-label="Получатели">
      @for (person of people(); track person) {
        <kn-chip removable (removed)="remove(person)">{{ person }}</kn-chip>
      } @empty {
        <span class="hint">Все получатели убраны.</span>
      }
    </div>
    <div class="row">
      <kn-chip>Черновик</kn-chip>
      <kn-chip tone="accent">Дизайн</kn-chip>
      <kn-chip tone="success">Готово</kn-chip>
      <kn-chip tone="warning">На проверке</kn-chip>
      <kn-chip tone="danger">Блокер</kn-chip>
      <kn-chip size="sm">Маленький</kn-chip>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--kn-space-4);
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-2);
      min-block-size: 1.75rem;
    }

    .hint {
      color: var(--kn-color-text-muted);
      font-size: var(--kn-text-sm);
    }
  `,
})
export default class ChipBasicDemo {
  protected readonly people = signal(['Анна Орлова', 'Борис Ким', 'Вера Соколова', 'Глеб Маркин']);

  protected remove(person: string): void {
    this.people.update((people) => people.filter((item) => item !== person));
  }
}
