import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnCheckbox } from '@kenny/ui/checkbox';
import { data } from '../../generated/checkbox';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/checkbox/basic.demo';

@Component({
  imports: [DocsPlayground, KnCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-checkbox
        [size]="size.value()"
        [indeterminate]="indeterminate.value()"
        [disabled]="disabled.value()"
        [invalid]="invalid.value()"
        [(checked)]="checked"
      >
        {{ label.value() }}
      </kn-checkbox>
    </docs-playground>
  `,
})
class Playground {
  protected readonly checked = signal(true);
  protected readonly label = text('Подпись', 'Запомнить меня');
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly indeterminate = toggle('indeterminate');
  protected readonly disabled = toggle('disabled');
  protected readonly invalid = toggle('invalid');
  protected readonly controls = [this.label, this.size, this.indeterminate, this.disabled, this.invalid];
  protected readonly code = computed(
    () =>
      `<kn-checkbox [(checked)]="remember"${attrs({
        size: [this.size.value(), 'md'],
        disabled: [this.disabled.value()],
        invalid: [this.invalid.value()],
      })}${this.indeterminate.value() ? ' [indeterminate]="true"' : ''}>${this.label.value()}</kn-checkbox>`,
  );
}

export default {
  slug: 'checkbox',
  title: 'Checkbox',
  entry: 'checkbox',
  description:
    'Флажок для независимых настроек и выбора нескольких пунктов. Если изменение применяется сразу, без кнопки «Сохранить», точнее подойдёт Switch.',
  api: data.api,
  sources: data.sources,
  demos: [
    {
      source: 'basic',
      title: 'Группа с «Выбрать все»',
      description: 'Родительский флажок показывает промежуточное состояние, пока выбрана только часть пунктов.',
      component: Basic,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Подпись. Без неё задайте aria-label.' }],
  keyboard: [
    { keys: ['Пробел'], action: 'Переключает флажок.' },
    { keys: ['Tab'], action: 'Переводит фокус на флажок и с него.' },
  ],
  a11y: [
    'Внутри нативный <input type="checkbox">: роль, состояние checked и mixed объявляет браузер.',
    'Подпись оборачивает поле в <label>, поэтому кликабельна вся строка.',
    'В Reactive Forms после touched невалидный флажок получает aria-invalid автоматически.',
    'Галочка появляется пружинным масштабированием; заливка — прозрачностью. Цвет не единственный признак: меняется и форма.',
  ],
} satisfies ComponentDoc;
