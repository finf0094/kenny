import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnIcon } from '@kenny/ui/icon';
import { KnContextMenuTrigger, KnMenu, KnMenuItem, KnMenuSeparator, KnMenuShortcut } from '@kenny/ui/menu';

@Component({
  imports: [KnContextMenuTrigger, KnMenu, KnMenuItem, KnMenuSeparator, KnMenuShortcut, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="files" role="list" aria-label="Файлы">
      @for (file of files(); track file) {
        <div class="file" role="listitem" tabindex="0" [knContextMenu]="menu" [knContextMenuData]="{ $implicit: file }">
          <kn-icon name="file" /> {{ file }}
        </div>
      } @empty {
        <p>Файлов не осталось. Обновите страницу, чтобы вернуть их.</p>
      }
    </div>
    <p>Правый клик по файлу или Shift + F10 с клавиатуры. Последнее действие: {{ last() }}</p>

    <ng-template #menu let-file>
      <kn-menu>
        <button kn-menu-item (triggered)="last.set('Открыть ' + file)">Открыть</button>
        <button kn-menu-item (triggered)="last.set('Переименовать ' + file)">
          Переименовать <kn-menu-shortcut>F2</kn-menu-shortcut>
        </button>
        <kn-menu-separator />
        <button kn-menu-item tone="danger" (triggered)="remove(file)">
          Удалить <kn-menu-shortcut>⌫</kn-menu-shortcut>
        </button>
      </kn-menu>
    </ng-template>
  `,
  styles: `
    .files {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: var(--kn-space-3);
    }

    .file {
      display: flex;
      align-items: center;
      gap: var(--kn-space-2);
      padding: var(--kn-space-3) var(--kn-space-4);
      border-radius: var(--kn-radius-md);
      background: var(--kn-glass-bg);
      backdrop-filter: var(--kn-glass-filter);
      box-shadow: var(--kn-shadow-glass-sm);
      cursor: context-menu;
    }

    .file:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    p {
      margin: var(--kn-space-3) 0 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class MenuContextDemo {
  protected readonly files = signal(['Бриф.docx', 'Смета.xlsx', 'Логотип.svg']);
  protected readonly last = signal('—');

  protected remove(file: string): void {
    this.files.update((files) => files.filter((f) => f !== file));
    this.last.set(`Удалить ${file}`);
  }
}
