import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnBadge } from '@kenny/ui/badge';
import { data } from '../../generated/badge';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/badge/basic.demo';

@Component({
  imports: [DocsPlayground, KnBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-badge [tone]="tone.value()" [variant]="variant.value()" [size]="size.value()" [dot]="dot.value()">
        {{ label.value() }}
      </kn-badge>
    </docs-playground>
  `,
})
class Playground {
  protected readonly label = text('Текст', 'Оплачен');
  protected readonly tone = choice('tone', ['neutral', 'accent', 'success', 'warning', 'danger'], 'success');
  protected readonly variant = choice('variant', ['soft', 'solid', 'outline']);
  protected readonly size = choice('size', ['md', 'lg']);
  protected readonly dot = toggle('dot', true);
  protected readonly controls = [this.label, this.tone, this.variant, this.size, this.dot];
  protected readonly code = computed(
    () =>
      `<kn-badge${attrs({
        tone: [this.tone.value(), 'neutral'],
        variant: [this.variant.value(), 'soft'],
        size: [this.size.value(), 'md'],
        dot: [this.dot.value()],
      })}>${this.label.value()}</kn-badge>`,
  );
}

export default {
  slug: 'badge',
  title: 'Badge',
  entry: 'badge',
  description: 'Короткая метка: статус записи, счётчик, версия. Не интерактивна — для фильтров и выбора нужны кнопки.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Тона и варианты',
      description: 'Статусу всегда сопутствует текст; точка только усиливает его.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Текст или число.' }],
  a11y: [
    'Обычный текст без роли: скринридер читает его в потоке содержимого.',
    'Не передавайте статус одним цветом — у метки всегда есть текст.',
    'Если счётчик стоит рядом с иконкой без подписи, добавьте контекст в aria-label родителя: «Входящие, 12 непрочитанных».',
    'Цифры моноширинные (tabular-nums): метка не дёргается при смене значения.',
  ],
} satisfies ComponentDoc;
