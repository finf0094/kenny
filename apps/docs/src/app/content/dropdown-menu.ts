import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnMenu, KnMenuItem, KnMenuSeparator, KnMenuTrigger } from '@kenny/ui/menu';
import { data } from '../../generated/menu';
import { ComponentDoc } from '../core/doc-types';
import { choice, DocsPlayground, toggle } from '../core/playground';
import Dropdown from '../demos/menu/dropdown.demo';

@Component({
  imports: [DocsPlayground, KnButton, KnMenu, KnMenuItem, KnMenuSeparator, KnMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <div style="display: grid; gap: 0.75rem; justify-items: center">
        <button kn-button variant="outline" tone="neutral" [knMenuTrigger]="menu">Действия</button>
        <small>Выбрано: {{ last() }}</small>
      </div>
      <ng-template #menu>
        <kn-menu>
          <button kn-menu-item (triggered)="last.set('Открыть')">Открыть</button>
          <button
            kn-menu-item
            [disabled]="disabled.value()"
            (triggered)="last.set('Переименовать')"
          >
            Переименовать
          </button>
          <kn-menu-separator />
          <button kn-menu-item [tone]="tone.value()" (triggered)="last.set('Удалить')">
            Удалить
          </button>
        </kn-menu>
      </ng-template>
    </docs-playground>
  `,
})
class Playground {
  protected readonly last = signal('—');
  protected readonly tone = choice('tone последнего пункта', ['danger', 'neutral']);
  protected readonly disabled = toggle('Второй пункт disabled');
  protected readonly controls = [this.tone, this.disabled];
  protected readonly code = computed(
    () =>
      `<button kn-button [knMenuTrigger]="menu">Действия</button>\n\n<ng-template #menu>\n  <kn-menu>\n    <button kn-menu-item (triggered)="open()">Открыть</button>\n    <button kn-menu-item${this.disabled.value() ? ' disabled' : ''} (triggered)="rename()">Переименовать</button>\n    <kn-menu-separator />\n    <button kn-menu-item${this.tone.value() === 'danger' ? ' tone="danger"' : ''} (triggered)="remove()">Удалить</button>\n  </kn-menu>\n</ng-template>`,
  );
}

export default {
  slug: 'dropdown-menu',
  title: 'Dropdown Menu',
  entry: 'menu',
  description:
    'Список действий, раскрывающийся из кнопки: команды, флажки, переключатели и вложенные меню. Для выбора значения поля используйте Select.',
  api: data.api,
  sources: data.sources,
  apiClasses: [
    'KnMenu',
    'KnMenuItem',
    'KnMenuItemCheckbox',
    'KnMenuItemRadio',
    'KnMenuGroup',
    'KnMenuTrigger',
  ],
  imports: [
    'KnMenu',
    'KnMenuItem',
    'KnMenuTrigger',
    'KnMenuSeparator',
    'KnMenuShortcut',
    'KnMenuGroup',
    'KnMenuItemCheckbox',
    'KnMenuItemRadio',
  ],
  demos: [
    {
      source: 'dropdown',
      title: 'Команды, подменю, флажки и радио',
      description:
        'Меню описывается в <ng-template> и создаётся при открытии. Пункт с [knMenuTrigger] открывает вложенное меню.',
      component: Dropdown,
    },
  ],
  playground: Playground,
  slots: [
    { name: '(по умолчанию, kn-menu)', description: 'Пункты, группы и разделители.' },
    { name: '(по умолчанию, пункт)', description: 'Иконка и текст пункта.' },
    { name: 'kn-menu-shortcut', description: 'Подсказка о горячей клавише справа от пункта.' },
  ],
  keyboard: [
    {
      keys: ['Enter', 'Пробел', '↓'],
      action: 'На кнопке: открывает меню, фокус на первом пункте.',
    },
    { keys: ['↓', '↑'], action: 'Следующий и предыдущий пункт, по кругу.' },
    { keys: ['→'], action: 'Открывает вложенное меню (в RTL — ←).' },
    { keys: ['←'], action: 'Закрывает вложенное меню и возвращается к родительскому пункту.' },
    { keys: ['Home', 'End'], action: 'Первый и последний пункт.' },
    { keys: ['Enter', 'Пробел'], action: 'Активирует пункт. Пробел на флажке не закрывает меню.' },
    { keys: ['Буквы'], action: 'Переход к пункту по первым буквам.' },
    { keys: ['Esc'], action: 'Закрывает меню и возвращает фокус на кнопку.' },
  ],
  a11y: [
    'Паттерн APG Menu Button на @angular/cdk/menu: role="menu", menuitem, menuitemcheckbox, menuitemradio.',
    'Кнопка получает aria-haspopup="menu" и aria-expanded; отключённые пункты остаются фокусируемыми и объявляются как недоступные.',
    'Входы disabled и checked, выход triggered и событие закрытия проброшены из директив CDK (в таблице ниже описаны только собственные входы Kenny).',
    'Меню появляется пружинным масштабированием от кнопки, а закрывается мгновенно: выбор пункта — частое действие, задержка здесь мешает.',
  ],
} satisfies ComponentDoc;
