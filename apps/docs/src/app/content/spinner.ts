import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnSpinner } from '@kenny/ui/spinner';
import { data } from '../../generated/spinner';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/spinner/basic.demo';

@Component({
  imports: [DocsPlayground, KnSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-spinner [size]="size.value()" [label]="label.value()" [decorative]="decorative.value()" />
    </docs-playground>
  `,
})
class Playground {
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'lg');
  protected readonly label = text('label', 'Загрузка');
  protected readonly decorative = toggle('decorative');
  protected readonly controls = [this.size, this.label, this.decorative];
  protected readonly code = computed(
    () =>
      `<kn-spinner${attrs({
        size: [this.size.value(), 'md'],
        label: [this.decorative.value() ? '' : this.label.value(), 'Загрузка'],
        decorative: [this.decorative.value()],
      })} />`,
  );
}

export default {
  slug: 'spinner',
  title: 'Spinner',
  entry: 'spinner',
  description:
    'Индикатор короткого ожидания без известной длительности. Встроен в Button (вход loading); отдельно нужен для областей и строк.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Размеры и цвет',
      description:
        'Цвет наследуется от текста (currentColor), размер можно задать переменной --kn-spinner-size.',
      component: Basic,
    },
  ],
  playground: Playground,
  a11y: [
    'role="progressbar" без значения и с именем из входа label — скринридер объявит «Загрузка».',
    'Внутри элемента, который уже сообщает о загрузке (кнопка с aria-busy, область с подписью), ставьте decorative.',
    'Вращение — transform: rotate. При prefers-reduced-motion оно втрое медленнее, но не останавливается.',
    'Если ожидание дольше нескольких секунд, добавьте рядом текст о том, что происходит.',
  ],
} satisfies ComponentDoc;
