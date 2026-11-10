import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnRadio, KnRadioGroup } from '@kenny/ui/radio';
import { data } from '../../generated/radio';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, toggle } from '../core/playground';
import Basic from '../demos/radio/basic.demo';

@Component({
  imports: [DocsPlayground, KnRadioGroup, KnRadio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-radio-group
        aria-label="Способ доставки"
        [orientation]="orientation.value()"
        [size]="size.value()"
        [disabled]="disabled.value()"
        [(value)]="value"
      >
        <kn-radio value="courier">Курьер</kn-radio>
        <kn-radio value="pickup">Самовывоз</kn-radio>
        <kn-radio value="post">Почта</kn-radio>
      </kn-radio-group>
    </docs-playground>
  `,
})
class Playground {
  protected readonly value = signal<string | null>('courier');
  protected readonly orientation = choice('orientation', ['vertical', 'horizontal']);
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly disabled = toggle('disabled');
  protected readonly controls = [this.orientation, this.size, this.disabled];
  protected readonly code = computed(
    () =>
      `<kn-radio-group aria-label="Способ доставки" [(value)]="delivery"${attrs({
        orientation: [this.orientation.value(), 'vertical'],
        size: [this.size.value(), 'md'],
        disabled: [this.disabled.value()],
      })}>\n  <kn-radio value="courier">Курьер</kn-radio>\n  <kn-radio value="pickup">Самовывоз</kn-radio>\n</kn-radio-group>`,
  );
}

export default {
  slug: 'radio',
  title: 'Radio',
  entry: 'radio',
  description:
    'Выбор одного варианта из нескольких, когда все варианты важно видеть сразу. Для пяти и более вариантов компактнее Select.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Вертикальная и горизонтальная группы',
      description: 'Значение хранит группа; <kn-field> даёт ей подпись и подсказку.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [
    { name: '(по умолчанию, kn-radio-group)', description: 'Элементы <kn-radio>.' },
    { name: '(по умолчанию, kn-radio)', description: 'Подпись варианта.' },
  ],
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Фокус на выбранную радиокнопку (или первую, если ничего не выбрано).',
    },
    { keys: ['↓', '→'], action: 'Выбирает следующий вариант, пропуская отключённые.' },
    { keys: ['↑', '←'], action: 'Выбирает предыдущий вариант.' },
    { keys: ['Пробел'], action: 'Выбирает вариант в фокусе.' },
  ],
  a11y: [
    'Группа — role="radiogroup" с именем от aria-label или подписи <kn-field>.',
    'Внутри нативные <input type="radio"> с общим name: перемещение стрелками и один Tab-стоп обеспечивает браузер.',
    'Группа считается «тронутой», когда фокус покидает её целиком, а не при переходе между вариантами.',
  ],
} satisfies ComponentDoc;
