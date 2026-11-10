import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KnButton } from '@kenny/ui/button';
import { data } from '../../generated/button';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import States from '../demos/button/states.demo';
import Variants from '../demos/button/variants.demo';

@Component({
  imports: [DocsPlayground, KnButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <button
        kn-button
        [variant]="variant.value()"
        [tone]="tone.value()"
        [size]="size.value()"
        [loading]="loading.value()"
        [disabled]="disabled.value()"
        [block]="block.value()"
      >
        {{ label.value() }}
      </button>
    </docs-playground>
  `,
})
class Playground {
  protected readonly label = text('Текст', 'Сохранить');
  protected readonly variant = choice('variant', ['solid', 'soft', 'glass', 'ghost']);
  protected readonly tone = choice('tone', ['accent', 'neutral', 'danger']);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly loading = toggle('loading');
  protected readonly disabled = toggle('disabled');
  protected readonly block = toggle('block');
  protected readonly controls = [
    this.label,
    this.variant,
    this.tone,
    this.size,
    this.loading,
    this.disabled,
    this.block,
  ];
  protected readonly code = computed(
    () =>
      `<button kn-button${attrs({
        variant: [this.variant.value(), 'solid'],
        tone: [this.tone.value(), 'accent'],
        size: [this.size.value(), 'md'],
        loading: [this.loading.value()],
        disabled: [this.disabled.value()],
        block: [this.block.value()],
      })}>${this.label.value()}</button>`,
  );
}

export default {
  slug: 'button',
  title: 'Button',
  entry: 'button',
  description:
    'Кнопка запускает действие. Директива навешивается на нативный <button> или <a>, поэтому отправка форм, фокус и клавиатура остаются браузерными.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'variants',
      title: 'Варианты и тона',
      description:
        'Вариант задаёт вес кнопки на экране, тон — смысл. Одно главное действие на экран — solid, остальные тише.',
      component: Variants,
    },
    {
      source: 'states',
      title: 'Размеры, иконки и состояния',
      description:
        'В состоянии loading кнопка сохраняет ширину и фокус, но не принимает нажатия. Ссылка выглядит так же, как кнопка.',
      component: States,
    },
  ],
  playground: Playground,
  slots: [
    { name: '(по умолчанию)', description: 'Текст кнопки и иконки <kn-icon> до или после него.' },
  ],
  keyboard: [
    { keys: ['Enter', 'Пробел'], action: 'Нажимает кнопку.' },
    { keys: ['Tab'], action: 'Переводит фокус на кнопку и с неё.' },
  ],
  a11y: [
    'Роль и имя берутся у нативного элемента: текст кнопки — её доступное имя.',
    'loading выставляет aria-busy и aria-disabled, но не убирает кнопку из порядка табуляции — фокус не теряется.',
    'У отключённой ссылки нет атрибута disabled, поэтому она получает aria-disabled и tabindex="-1".',
    'Нажатие и наведение анимируются через transform и opacity отдельного слоя; кольцо фокуса появляется только при навигации с клавиатуры.',
  ],
} satisfies ComponentDoc;
