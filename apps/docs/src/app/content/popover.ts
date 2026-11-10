import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnPopover, KnPopoverTrigger } from '@kenny/ui/popover';
import { data } from '../../generated/popover';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range } from '../core/playground';
import Basic from '../demos/popover/basic.demo';

const PLACEMENTS = ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'start', 'end'] as const;

@Component({
  imports: [DocsPlayground, KnButton, KnPopover, KnPopoverTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button kn-button variant="glass" tone="neutral" [knPopoverTrigger]="popover">Открыть</button>
      <kn-popover #popover aria-label="Пример панели" width="14rem" [placement]="placement.value()" [offset]="offset.value()">
        Панель привязана к кнопке и следует за ней при прокрутке.
      </kn-popover>
    </docs-playground>
  `,
})
class Playground {
  protected readonly placement = choice('placement', PLACEMENTS);
  protected readonly offset = range('offset', 8, 0, 24, 2);
  protected readonly controls = [this.placement, this.offset];
  protected readonly code = computed(
    () =>
      `<button kn-button [knPopoverTrigger]="popover">Открыть</button>\n<kn-popover #popover aria-label="Пример панели"${attrs({
        placement: [this.placement.value(), 'bottom-start'],
        offset: [this.offset.value(), 8],
      })}>\n  …\n</kn-popover>`,
  );
}

export default {
  slug: 'popover',
  title: 'Popover',
  entry: 'popover',
  description:
    'Всплывающая панель с произвольным содержимым рядом с элементом: быстрые настройки, фильтры, подробности. Для списка действий используйте Dropdown Menu.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Панель настроек',
      description: 'Триггер связывается с панелью директивой knPopoverTrigger; закрыть панель можно и из содержимого.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Содержимое панели. Создаётся при открытии.' }],
  keyboard: [
    { keys: ['Enter', 'Пробел'], action: 'На триггере: открывает и закрывает панель.' },
    { keys: ['Tab'], action: 'Перемещает фокус внутри панели по кругу.' },
    { keys: ['Esc'], action: 'Закрывает панель и возвращает фокус на триггер.' },
  ],
  a11y: [
    'Панель — role="dialog" с именем из aria-label; триггер получает aria-haspopup, aria-expanded и aria-controls.',
    'При открытии фокус переходит на первый интерактивный элемент панели.',
    'Клик вне панели закрывает её и не перехватывает фокус у элемента, по которому кликнули.',
    'Если места не хватает, панель переворачивается на противоположную сторону; точка роста анимации следует за положением.',
  ],
} satisfies ComponentDoc;
