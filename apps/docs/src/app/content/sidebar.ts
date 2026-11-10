import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnIcon } from '@kenny/ui/icon';
import { KnSidebar, KnSidebarGroup, KnSidebarItem } from '@kenny/ui/sidebar';
import { data } from '../../generated/sidebar';
import { ComponentDoc } from '../core/doc-types';
import { DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/sidebar/basic.demo';

@Component({
  imports: [DocsPlayground, KnSidebar, KnSidebarGroup, KnSidebarItem, KnIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-sidebar
        style="block-size: 15rem"
        aria-label="Пример навигации"
        [collapsed]="collapsed.value()"
      >
        <kn-sidebar-group label="Работа">
          @for (item of items; track item.id) {
            <button
              kn-sidebar-item
              type="button"
              [active]="current() === item.id"
              (click)="current.set(item.id)"
            >
              <kn-icon knSidebarIcon [name]="item.icon" /> {{ item.label }}
            </button>
          }
        </kn-sidebar-group>
      </kn-sidebar>
    </docs-playground>
  `,
})
class Playground {
  protected readonly current = signal('inbox');
  protected readonly items = [
    { id: 'inbox', label: 'Входящие', icon: 'inbox' },
    { id: 'sent', label: 'Отправленные', icon: 'send' },
    { id: 'archive', label: 'Архив', icon: 'archive' },
  ];
  protected readonly collapsed = toggle('collapsed');
  protected readonly controls = [this.collapsed];
  protected readonly code = computed(
    () =>
      `<kn-sidebar aria-label="Разделы"${this.collapsed.value() ? ' [collapsed]="true"' : ''}>\n  <kn-sidebar-group label="Работа">\n    <a kn-sidebar-item routerLink="/inbox" routerLinkActive="active">\n      <kn-icon knSidebarIcon name="inbox" /> Входящие\n    </a>\n  </kn-sidebar-group>\n</kn-sidebar>`,
  );
}

export default {
  slug: 'sidebar',
  title: 'Sidebar',
  entry: 'sidebar',
  description:
    'Боковая навигация приложения: группы ссылок, шапка и подвал. Сворачивается до полосы иконок. Навигация этого сайта собрана из неё.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Группы, счётчики и сворачивание',
      description:
        'Кнопка в шапке переключает [(collapsed)]. Счётчик попадает в слот knSidebarEnd.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    {
      name: 'knSidebarHeader',
      description: 'Шапка: логотип, переключатель пространства, кнопка сворачивания.',
    },
    { name: '(по умолчанию)', description: 'Группы и пункты навигации; область прокручивается.' },
    { name: 'knSidebarFooter', description: 'Подвал: профиль, помощь.' },
    {
      name: 'knSidebarIcon (пункт)',
      description: 'Иконка пункта; остаётся видимой в свёрнутом виде.',
    },
    { name: 'knSidebarEnd (пункт)', description: 'Счётчик или бейдж справа.' },
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Перемещает фокус по пунктам в порядке документа.' },
    { keys: ['Enter'], action: 'Переходит по ссылке или нажимает кнопку.' },
  ],
  a11y: [
    'Корневой элемент содержит <nav> с именем из aria-label; группы — role="group" с именем заголовка.',
    'Текущая страница отмечается aria-current="page" (вход active) или классом active от routerLinkActive.',
    'В свёрнутом виде подписи скрыты визуально, но остаются в дереве доступности — имя пункта не теряется.',
    'Ширина меняется мгновенно, подписи растворяются: анимировать ширину значило бы пересчитывать раскладку страницы на каждом кадре.',
  ],
} satisfies ComponentDoc;
