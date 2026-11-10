import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import {
  KnMenu,
  KnMenuGroup,
  KnMenuItem,
  KnMenuItemCheckbox,
  KnMenuItemRadio,
  KnMenuSeparator,
  KnMenuShortcut,
  KnMenuTrigger,
} from '@kenny/ui/menu';

@Component({
  imports: [
    KnButton,
    KnIcon,
    KnMenu,
    KnMenuGroup,
    KnMenuItem,
    KnMenuItemCheckbox,
    KnMenuItemRadio,
    KnMenuSeparator,
    KnMenuShortcut,
    KnMenuTrigger,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button kn-button variant="glass" tone="neutral" [knMenuTrigger]="file">
      Файл <kn-icon name="chevron-down" [size]="16" />
    </button>
    <button kn-icon-button variant="ghost" tone="neutral" aria-label="Вид" [knMenuTrigger]="view">
      <kn-icon name="more" />
    </button>
    <p>Последнее действие: {{ last() }}</p>

    <ng-template #file>
      <kn-menu>
        <button kn-menu-item (triggered)="last.set('Новый документ')">
          <kn-icon name="file" [size]="16" /> Новый документ <kn-menu-shortcut>⌘N</kn-menu-shortcut>
        </button>
        <button kn-menu-item (triggered)="last.set('Дублировать')">
          <kn-icon name="copy" [size]="16" /> Дублировать <kn-menu-shortcut>⌘D</kn-menu-shortcut>
        </button>
        <button kn-menu-item [knMenuTrigger]="share"><kn-icon name="send" [size]="16" /> Поделиться</button>
        <button kn-menu-item disabled><kn-icon name="download" [size]="16" /> Экспорт в PDF</button>
        <kn-menu-separator />
        <button kn-menu-item tone="danger" (triggered)="last.set('Удалить')">
          <kn-icon name="trash" [size]="16" /> Удалить
        </button>
      </kn-menu>
    </ng-template>

    <ng-template #share>
      <kn-menu>
        <button kn-menu-item (triggered)="last.set('Скопировать ссылку')">Скопировать ссылку</button>
        <button kn-menu-item (triggered)="last.set('Отправить по почте')">Отправить по почте</button>
      </kn-menu>
    </ng-template>

    <ng-template #view>
      <kn-menu>
        <button kn-menu-item-checkbox [checked]="sidebar()" (triggered)="sidebar.set(!sidebar())">
          Боковая панель
        </button>
        <button kn-menu-item-checkbox [checked]="minimap()" (triggered)="minimap.set(!minimap())">
          Мини-карта
        </button>
        <kn-menu-separator />
        <kn-menu-group label="Масштаб">
          @for (zoom of zooms; track zoom) {
            <button kn-menu-item-radio [checked]="scale() === zoom" (triggered)="scale.set(zoom)">{{ zoom }}%</button>
          }
        </kn-menu-group>
      </kn-menu>
    </ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--kn-space-3);
    }

    p {
      flex-basis: 100%;
      margin: 0;
      font-size: var(--kn-text-sm);
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class MenuDropdownDemo {
  protected readonly last = signal('—');
  protected readonly sidebar = signal(true);
  protected readonly minimap = signal(false);
  protected readonly scale = signal(100);
  protected readonly zooms = [75, 100, 125, 150];
}
