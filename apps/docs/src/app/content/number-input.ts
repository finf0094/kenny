import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnNumberInput } from '@kenny/ui/number-input';
import { data } from '../../generated/number-input';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, range, toggle } from '../core/playground';
import Basic from '../demos/number-input/basic.demo';

@Component({
  imports: [DocsPlayground, KnNumberInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-number-input
        aria-label="Количество"
        [size]="size.value()"
        [min]="min.value()"
        [max]="max.value()"
        [step]="step.value()"
        [disabled]="disabled.value()"
        [(value)]="value"
      />
    </docs-playground>
  `,
})
class Playground {
  protected readonly value = signal<number | null>(4);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly min = range('min', 0, 0, 10);
  protected readonly max = range('max', 20, 10, 100, 10);
  protected readonly step = range('step', 1, 1, 5);
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.size, this.min, this.max, this.step, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-number-input aria-label="Количество" [(value)]="quantity" [min]="${this.min.value()}" [max]="${this.max.value()}"${attrs(
        {
          step: [this.step.value(), 1],
          size: [this.size.value(), 'md'],
          disabled: [this.disabled.value()],
        },
      )} />`,
  );
}

export default {
  slug: 'number-input',
  title: 'Number Input',
  entry: 'number-input',
  description:
    'Числовое поле с кнопками шага: количество, проценты, суммы. Понимает запятую и пробелы между разрядами, держит значение в границах.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Границы, шаг и формат',
      description:
        'Точность берётся из шага: при шаге 0,5 значение округляется до одного знака. format передаётся в Intl.NumberFormat.',
      component: Basic,
    },
  ],
  playground: Playground,
  keyboard: [
    { keys: ['↑', '↓'], action: 'Увеличивают и уменьшают значение на шаг.' },
    { keys: ['Page Up', 'Page Down'], action: 'На десять шагов.' },
    { keys: ['Home', 'End'], action: 'К нижней и верхней границе, если они заданы.' },
    { keys: ['Enter'], action: 'Применяет набранный текст, не убирая фокус.' },
  ],
  a11y: [
    'role="spinbutton" с aria-valuenow, aria-valuemin и aria-valuemax; отформатированное значение («10 %») уходит в aria-valuetext.',
    'Кнопки шага не входят в порядок табуляции — с клавиатуры их заменяют стрелки. У них есть имена для сенсорных скринридеров.',
    'Удержание кнопки повторяет шаг; фокус и курсор остаются в поле.',
    'Нераспознанный ввод откатывается к прежнему значению, пустое поле даёт null — удобно для необязательных полей.',
    'Внутри kn-field получает подпись, подсказку и текст ошибки. Работает с Reactive Forms и signal forms.',
  ],
} satisfies ComponentDoc;
