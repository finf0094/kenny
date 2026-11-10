import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KnButton } from '@kenny/ui/button';

@Component({
  imports: [KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row">
      <button kn-button>Сохранить</button>
      <button kn-button variant="soft">Черновик</button>
      <button kn-button variant="glass">Поделиться</button>
      <button kn-button variant="ghost">Отмена</button>
    </div>
    <div class="row">
      <button kn-button tone="neutral">Продолжить</button>
      <button kn-button tone="neutral" variant="soft">Назад</button>
      <button kn-button tone="neutral" variant="glass">Фильтры</button>
      <button kn-button tone="neutral" variant="ghost">Пропустить</button>
    </div>
    <div class="row">
      <button kn-button tone="danger">Удалить проект</button>
      <button kn-button tone="danger" variant="soft">Отключить</button>
      <button kn-button tone="danger" variant="glass">Выйти</button>
      <button kn-button tone="danger" variant="ghost">Сбросить</button>
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
      gap: var(--kn-space-3);
    }
  `,
})
export default class ButtonVariantsDemo {}
