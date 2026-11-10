import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KnBadge } from '@kenny/ui/badge';
import { KnButton } from '@kenny/ui/button';
import { KnIcon } from '@kenny/ui/icon';
import { KnSidebar, KnSidebarGroup, KnSidebarItem } from '@kenny/ui/sidebar';

@Component({
  imports: [KnSidebar, KnSidebarGroup, KnSidebarItem, KnIcon, KnButton, KnBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <kn-sidebar aria-label="Разделы приложения" [(collapsed)]="collapsed">
      <button
        knSidebarHeader
        kn-icon-button
        variant="ghost"
        tone="neutral"
        [attr.aria-label]="collapsed() ? 'Развернуть меню' : 'Свернуть меню'"
        [attr.aria-expanded]="!collapsed()"
        (click)="collapsed.set(!collapsed())"
      >
        <kn-icon name="panel-left" />
      </button>

      <kn-sidebar-group label="Работа">
        @for (item of work; track item.id) {
          <button kn-sidebar-item type="button" [active]="current() === item.id" (click)="current.set(item.id)">
            <kn-icon knSidebarIcon [name]="item.icon" />
            {{ item.label }}
            @if (item.count) {
              <kn-badge knSidebarEnd tone="accent">{{ item.count }}</kn-badge>
            }
          </button>
        }
      </kn-sidebar-group>

      <kn-sidebar-group label="Команда">
        <button kn-sidebar-item type="button" [active]="current() === 'people'" (click)="current.set('people')">
          <kn-icon knSidebarIcon name="user" /> Участники
        </button>
        <button kn-sidebar-item type="button" [active]="current() === 'settings'" (click)="current.set('settings')">
          <kn-icon knSidebarIcon name="sliders" /> Настройки
        </button>
      </kn-sidebar-group>
    </kn-sidebar>

    <p>Открыт раздел: <strong>{{ current() }}</strong></p>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: var(--kn-space-6);
    }

    kn-sidebar {
      block-size: 22rem;
    }

    p {
      margin: var(--kn-space-3) 0 0;
      color: var(--kn-color-text-muted);
    }
  `,
})
export default class SidebarBasicDemo {
  protected readonly collapsed = signal(false);
  protected readonly current = signal('inbox');
  protected readonly work = [
    { id: 'inbox', label: 'Входящие', icon: 'inbox', count: 12 },
    { id: 'projects', label: 'Проекты', icon: 'folder', count: 0 },
    { id: 'reports', label: 'Отчёты', icon: 'chart', count: 0 },
    { id: 'archive', label: 'Архив', icon: 'archive', count: 0 },
  ];
}
