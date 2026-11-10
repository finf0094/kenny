import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnAvatar } from '@kenny/ui/avatar';
import { data } from '../../generated/avatar';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text } from '../core/playground';
import Basic from '../demos/avatar/basic.demo';

@Component({
  imports: [DocsPlayground, KnAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-avatar [name]="name.value()" [size]="size.value()" [status]="status.value() === 'нет' ? null : $any(status.value())" />
    </docs-playground>
  `,
})
class Playground {
  protected readonly name = text('name', 'Зоя Мельникова');
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'lg');
  protected readonly status = choice('status', ['нет', 'online', 'away', 'busy', 'offline']);
  protected readonly controls = [this.name, this.size, this.status];
  protected readonly code = computed(
    () =>
      `<kn-avatar${attrs({
        name: [this.name.value()],
        size: [this.size.value(), 'md'],
        status: [this.status.value(), 'нет'],
      })} />`,
  );
}

export default {
  slug: 'avatar',
  title: 'Avatar',
  entry: 'avatar',
  description:
    'Изображение человека или его инициалы. Цвет фона выводится из имени и не меняется между сессиями, поэтому людей легко различать даже без фотографий.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Размеры, статус и группа',
      description: 'Если картинка не загрузилась, аватар сам переключается на инициалы.',
      component: Basic,
    },
  ],
  playground: Playground,
  a11y: [
    'С изображением имя передаётся через alt; без него аватар получает role="img" и aria-label с именем.',
    'Статус добавляется к имени словами: «Борис Ким, в сети» — не только цветной точкой.',
    'Инициалы декоративны (aria-hidden): скринридер читает полное имя.',
    'Рядом с именем в тексте аватар избыточен для скринридера — тогда оберните его в элемент с aria-hidden="true".',
  ],
} satisfies ComponentDoc;
