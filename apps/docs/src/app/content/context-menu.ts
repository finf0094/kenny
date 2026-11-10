import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnContextMenuTrigger, KnMenu, KnMenuItem } from '@kenny/ui/menu';
import { data } from '../../generated/menu';
import { ComponentDoc } from '../core/doc-types';
import { DocsPlayground, toggle } from '../core/playground';
import Context from '../demos/menu/context.demo';

@Component({
  imports: [DocsPlayground, KnContextMenuTrigger, KnMenu, KnMenuItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <div
        class="area"
        tabindex="0"
        [knContextMenu]="menu"
        [knContextMenuDisabled]="disabled.value()"
      >
        Правый клик здесь<br /><small>{{ last() }}</small>
      </div>
      <ng-template #menu>
        <kn-menu>
          <button kn-menu-item (triggered)="last.set('Скопировано')">Копировать</button>
          <button kn-menu-item (triggered)="last.set('Вставлено')">Вставить</button>
        </kn-menu>
      </ng-template>
    </docs-playground>
  `,
  styles: `
    .area {
      display: grid;
      place-content: center;
      inline-size: 16rem;
      block-size: 9rem;
      border-radius: var(--kn-radius-lg);
      background: var(--kn-color-surface);
      backdrop-filter: var(--kn-surface-filter);
      box-shadow: var(--kn-elevation-raised);
      text-align: center;
    }

    .area:focus-visible {
      outline: var(--kn-focus-width) solid var(--kn-color-focus);
      outline-offset: var(--kn-focus-offset);
    }

    small {
      color: var(--kn-color-text-muted);
    }
  `,
})
class Playground {
  protected readonly last = signal('ещё ничего не выбрано');
  protected readonly disabled = toggle('knContextMenuDisabled');
  protected readonly controls = [this.disabled];
  protected readonly code = computed(
    () =>
      `<div tabindex="0" [knContextMenu]="menu"${this.disabled.value() ? ' [knContextMenuDisabled]="true"' : ''}>…</div>\n\n<ng-template #menu>\n  <kn-menu>\n    <button kn-menu-item (triggered)="copy()">Копировать</button>\n    <button kn-menu-item (triggered)="paste()">Вставить</button>\n  </kn-menu>\n</ng-template>`,
  );
}

export default {
  slug: 'context-menu',
  title: 'Context Menu',
  entry: 'menu',
  description:
    'То же меню, но открывается правым кликом в месте указателя. Дополняет, а не заменяет видимые действия: о контекстном меню знают не все.',
  api: data.api,
  sources: data.sources,
  apiClasses: ['KnContextMenuTrigger', 'KnMenu', 'KnMenuItem'],
  imports: ['KnContextMenuTrigger', 'KnMenu', 'KnMenuItem'],
  demos: [
    {
      source: 'context',
      title: 'Меню файла',
      description:
        'В шаблон меню можно передать данные через [knContextMenuData] — здесь это имя файла.',
      component: Context,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию, kn-menu)', description: 'Те же пункты, что в Dropdown Menu.' }],
  keyboard: [
    { keys: ['Shift', 'F10'], action: 'Открывает меню для элемента в фокусе.' },
    { keys: ['Клавиша меню'], action: 'То же, на клавиатурах, где она есть.' },
    { keys: ['↓', '↑', 'Enter', 'Esc'], action: 'Навигация и выбор — как в Dropdown Menu.' },
  ],
  a11y: [
    'Чтобы меню открывалось с клавиатуры, область должна быть фокусируемой (tabindex="0" или интерактивный элемент).',
    'Системное контекстное меню подавляется только на области с директивой; knContextMenuDisabled возвращает его.',
    'Каждое действие из контекстного меню должно быть доступно и другим способом — кнопкой или через Dropdown Menu.',
    'На сенсорных экранах меню открывается долгим нажатием — это поведение браузера для события contextmenu.',
  ],
} satisfies ComponentDoc;
