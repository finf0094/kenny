import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnCard } from '@kenny/ui/card';
import { data } from '../../generated/card';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/card/basic.demo';
import Interactive from '../demos/card/interactive.demo';

@Component({
  imports: [DocsPlayground, KnCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-card style="inline-size: 16rem" [variant]="variant.value()" [padding]="padding.value()" [interactive]="interactive.value()">
        <strong knCardHeader>Квартальный отчёт</strong>
        <span>Обновлён сегодня в 14:20</span>
      </kn-card>
    </docs-playground>
  `,
})
class Playground {
  protected readonly variant = choice('variant', ['glass', 'solid', 'outline']);
  protected readonly padding = choice('padding', ['none', 'sm', 'md', 'lg'], 'md');
  protected readonly interactive = toggle('interactive');
  protected readonly controls = [this.variant, this.padding, this.interactive];
  protected readonly code = computed(
    () =>
      `<kn-card${attrs({
        variant: [this.variant.value(), 'glass'],
        padding: [this.padding.value(), 'md'],
        interactive: [this.interactive.value()],
      })}>\n  <strong knCardHeader>Квартальный отчёт</strong>\n  <span>Обновлён сегодня в 14:20</span>\n</kn-card>`,
  );
}

export default {
  slug: 'card',
  title: 'Card',
  entry: 'card',
  description:
    'Поверхность, которая объединяет связанное содержимое. По умолчанию стеклянная; для длинного текста и плотных данных есть сплошной вариант.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Три материала',
      description: 'Стекло читается только на фоне с деталями; на ровной заливке выбирайте solid или outline.',
      component: Basic,
    },
    {
      source: 'interactive',
      title: 'Карточка-ссылка',
      description: 'Селектор работает на <a> и <button>: вся карточка становится одним интерактивным элементом.',
      component: Interactive,
    },
  ],
  playground: Playground,
  slots: [
    { name: 'knCardMedia', description: 'Изображение или обложка во всю ширину, без отступов.' },
    { name: 'knCardHeader', description: 'Заголовок карточки; становится первым в теле.' },
    { name: '(по умолчанию)', description: 'Основное содержимое.' },
    { name: 'knCardFooter', description: 'Ряд действий, прижатый к низу карточки.' },
  ],
  keyboard: [{ keys: ['Enter'], action: 'Для карточки-ссылки или кнопки: активирует её.' }],
  a11y: [
    'Обычная карточка не имеет роли: это визуальная группировка. Смысл задаёт заголовок внутри.',
    'Интерактивную карточку делайте на <a> или <button> — тогда роль, фокус и клавиатура нативные.',
    'Не вкладывайте другие интерактивные элементы в карточку-ссылку.',
    'Подъём при наведении — transform, отключается при prefers-reduced-motion вместе с остальными длительностями.',
  ],
} satisfies ComponentDoc;
