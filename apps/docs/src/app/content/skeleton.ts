import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnSkeleton } from '@kenny/ui/skeleton';
import { data } from '../../generated/skeleton';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, text } from '../core/playground';
import Basic from '../demos/skeleton/basic.demo';

@Component({
  imports: [DocsPlayground, KnSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <div style="inline-size: 16rem; display: grid; justify-items: start">
        <kn-skeleton
          [shape]="shape.value()"
          [lines]="lines.value()"
          [width]="width.value() || null"
        />
      </div>
    </docs-playground>
  `,
})
class Playground {
  protected readonly shape = choice('shape', ['text', 'rect', 'circle']);
  protected readonly lines = range('lines (для text)', 3, 1, 6);
  protected readonly width = text('width', '');
  protected readonly controls = [this.shape, this.lines, this.width];
  protected readonly code = computed(
    () =>
      `<kn-skeleton${attrs({
        shape: [this.shape.value(), 'text'],
        lines: [this.shape.value() === 'text' ? this.lines.value() : 1, 1],
        width: [this.width.value()],
      })} />`,
  );
}

export default {
  slug: 'skeleton',
  title: 'Skeleton',
  entry: 'skeleton',
  description:
    'Заглушка, повторяющая форму будущего содержимого. Уместна, когда структура известна заранее; для неизвестной длительности без структуры подойдёт Spinner.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Карточка в загрузке',
      description:
        'Заглушки собираются из трёх форм и повторяют раскладку готового содержимого, чтобы оно не «прыгало».',
      component: Basic,
    },
  ],
  playground: Playground,
  a11y: [
    'Заглушки скрыты от вспомогательных технологий (aria-hidden="true").',
    'О загрузке сообщает контейнер: задайте ему aria-busy="true", пока данные не пришли.',
    'Блик — полоса, сдвигаемая через transform; при prefers-reduced-motion он отключается совсем.',
    'Высота текстовой заглушки задана в em и следует за размером шрифта места, где она стоит.',
  ],
} satisfies ComponentDoc;
