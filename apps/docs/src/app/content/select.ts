import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnOption, KnSelect } from '@kenny/ui/select';
import { data as option } from '../../generated/option';
import { data } from '../../generated/select';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Basic from '../demos/select/basic.demo';
import Forms from '../demos/select/forms.demo';

@Component({
  imports: [DocsPlayground, KnSelect, KnOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-select
        style="inline-size: 15rem"
        aria-label="Статус задачи"
        [size]="size.value()"
        [placeholder]="placeholder.value()"
        [disabled]="disabled.value()"
        [invalid]="invalid.value()"
        [(value)]="value"
      >
        <kn-option value="todo">К выполнению</kn-option>
        <kn-option value="doing">В работе</kn-option>
        <kn-option value="review">На ревью</kn-option>
        <kn-option value="done">Готово</kn-option>
      </kn-select>
    </docs-playground>
  `,
})
class Playground {
  protected readonly value = signal<string | null>(null);
  protected readonly placeholder = text('placeholder', 'Выберите статус');
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly disabled = toggle('disabled');
  protected readonly invalid = toggle('invalid');
  protected readonly controls = [this.placeholder, this.size, this.disabled, this.invalid];
  protected readonly code = computed(
    () =>
      `<kn-select [(value)]="status"${attrs({
        placeholder: [this.placeholder.value(), 'Выберите…'],
        size: [this.size.value(), 'md'],
        disabled: [this.disabled.value()],
        invalid: [this.invalid.value()],
      })}>\n  <kn-option value="todo">К выполнению</kn-option>\n  <kn-option value="doing">В работе</kn-option>\n</kn-select>`,
  );
}

export default {
  slug: 'select',
  title: 'Select',
  entry: 'select',
  description:
    'Выбор одного значения из короткого списка. Если вариантов больше десяти или нужен поиск по вхождению — берите Combobox.',
  api: { classes: [...data.api.classes, ...option.api.classes], cssVars: data.api.cssVars },
  sources: data.sources,
  imports: ['KnSelect', 'KnOption', 'KnOptionGroup'],
  demos: [
    {
      source: 'basic',
      title: 'Группы и размеры',
      description:
        'Варианты можно группировать и отключать. Список открывается шириной не меньше поля.',
      component: Basic,
    },
    {
      source: 'forms',
      title: 'Reactive Forms и объекты',
      description:
        'Значением может быть объект: compareWith объясняет, как сравнивать значения формы с вариантами.',
      component: Forms,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Элементы <kn-option> и <kn-option-group>.' }],
  keyboard: [
    {
      keys: ['Enter', 'Пробел', '↓', '↑'],
      action: 'Открывает список; активным становится выбранный вариант.',
    },
    { keys: ['↓', '↑'], action: 'Перемещает активный вариант, пропуская отключённые.' },
    { keys: ['Home', 'End'], action: 'Первый и последний вариант.' },
    { keys: ['Enter', 'Пробел', 'Tab'], action: 'Выбирает активный вариант и закрывает список.' },
    { keys: ['Esc'], action: 'Закрывает список без изменений.' },
    { keys: ['Буквы'], action: 'Поиск по первым буквам; в закрытом списке сразу меняет значение.' },
  ],
  a11y: [
    'Паттерн APG «Select-Only Combobox»: поле — кнопка с role="combobox", список — role="listbox".',
    'Фокус не покидает поле: активный вариант объявляется через aria-activedescendant.',
    'Внутри <kn-field> имя складывается из подписи и выбранного значения: «Город Москва».',
    'Список открывается пружинным масштабированием от поля и закрывается быстрее, чем открывается.',
  ],
} satisfies ComponentDoc;
