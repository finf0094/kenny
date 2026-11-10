import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { KnEmptyState } from '@kenny/ui/empty-state';
import { data } from '../../generated/empty-state';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/empty-state/basic.demo';

@Component({
  imports: [DocsPlayground, KnEmptyState, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-empty-state [icon]="icon.value()" [heading]="heading.value()" [description]="description.value()">
        @if (action.value()) {
          <button kn-button size="sm">Сбросить фильтры</button>
        }
      </kn-empty-state>
    </docs-playground>
  `,
})
class Playground {
  protected readonly icon = choice('icon', ['search', 'inbox', 'folder', 'filter', 'bell']);
  protected readonly heading = text('heading', 'Ничего не найдено');
  protected readonly description = text('description', 'Попробуйте изменить запрос или сбросить фильтры.');
  protected readonly action = toggle('Кнопка действия', true);
  protected readonly controls = [this.icon, this.heading, this.description, this.action];
  protected readonly code = computed(
    () =>
      `<kn-empty-state${attrs({
        icon: [this.icon.value()],
        heading: [this.heading.value()],
        description: [this.description.value()],
      })}>${this.action.value() ? '\n  <button kn-button size="sm">Сбросить фильтры</button>\n' : ''}</kn-empty-state>`,
  );
}

export default {
  slug: 'empty-state',
  title: 'Empty State',
  entry: 'empty-state',
  description:
    'Содержимое для пустого списка, раздела или результата поиска. Объясняет, почему здесь пусто, и предлагает следующий шаг.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Пустые входящие',
      description: 'Главное действие — кнопкой solid, запасное — тише.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Кнопки действий под текстом.' }],
  a11y: [
    'Заголовок — элемент с role="heading"; уровень задаётся входом headingLevel под структуру страницы.',
    'Иконка декоративна. Смысл несут заголовок и описание.',
    'Пишите, что случилось и что делать: «Ничего не найдено. Сбросьте фильтры», а не «Упс!».',
  ],
} satisfies ComponentDoc;
