import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnDivider } from '@kenny/ui/divider';
import { data } from '../../generated/divider';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text } from '../core/playground';
import Basic from '../demos/divider/basic.demo';

@Component({
  imports: [DocsPlayground, KnDivider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <div style="inline-size: min(20rem, 100%)">
        <kn-divider [align]="align.value()">{{ label.value() }}</kn-divider>
      </div>
    </docs-playground>
  `,
})
class Playground {
  protected readonly label = text('Подпись', 'или');
  protected readonly align = choice('align', ['start', 'center', 'end'], 'center');
  protected readonly controls = [this.label, this.align];
  protected readonly code = computed(() => {
    const label = this.label.value();
    const attributes = attrs({ align: [this.align.value(), 'center'] });
    return label ? `<kn-divider${attributes}>${label}</kn-divider>` : `<kn-divider${attributes} />`;
  });
}

export default {
  slug: 'divider',
  title: 'Divider',
  entry: 'divider',
  description:
    'Линия между группами содержимого, горизонтальная или вертикальная, при необходимости с подписью.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'С подписью, вертикальный, с выравниванием',
      description:
        'Отступы задаются входом spacing — шагом шкалы или любым CSS-значением. Вертикальный разделитель растягивается на высоту строки.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Подпись на линии. Без неё линия сплошная.' }],
  a11y: [
    'role="separator": скринридер объявляет границу между группами. Вертикальному добавляется aria-orientation.',
    'Если линия только украшает (между датой и суммой в одной строке), задайте decorative — она исчезнет из дерева доступности.',
    'Подпись читается как имя разделителя.',
  ],
} satisfies ComponentDoc;
