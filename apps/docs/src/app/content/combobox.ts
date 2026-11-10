import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KnCombobox, KnOption } from '@kenny/ui/combobox';
import { data } from '../../generated/combobox';
import { ComponentDoc } from '../core/doc-types';
import { attrs, choice, DocsPlayground, text, toggle } from '../core/playground';
import Async from '../demos/combobox/async.demo';
import Basic from '../demos/combobox/basic.demo';

@Component({
  imports: [DocsPlayground, KnCombobox, KnOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-playground [controls]="controls" [code]="code()">
      <kn-combobox
        style="inline-size: 16rem"
        aria-label="Город"
        [size]="size.value()"
        [placeholder]="placeholder.value()"
        [clearable]="clearable.value()"
        [disabled]="disabled.value()"
        [invalid]="invalid.value()"
        [(value)]="value"
      >
        @for (city of cities; track city) {
          <kn-option [value]="city">{{ city }}</kn-option>
        }
      </kn-combobox>
    </docs-playground>
  `,
})
class Playground {
  protected readonly cities = ['Владивосток', 'Волгоград', 'Воронеж', 'Екатеринбург', 'Казань', 'Калининград', 'Краснодар', 'Москва', 'Новосибирск', 'Санкт-Петербург'];
  protected readonly value = signal<string | null>(null);
  protected readonly placeholder = text('placeholder', 'Начните вводить город');
  protected readonly size = choice('size', ['sm', 'md', 'lg'], 'md');
  protected readonly clearable = toggle('clearable', true);
  protected readonly disabled = toggle('disabled');
  protected readonly invalid = toggle('invalid');
  protected readonly controls = [this.placeholder, this.size, this.clearable, this.disabled, this.invalid];
  protected readonly code = computed(
    () =>
      `<kn-combobox [(value)]="city"${attrs({
        placeholder: [this.placeholder.value()],
        size: [this.size.value(), 'md'],
        clearable: [this.clearable.value()],
        disabled: [this.disabled.value()],
        invalid: [this.invalid.value()],
      })}>\n  @for (city of cities; track city) {\n    <kn-option [value]="city">{{ city }}</kn-option>\n  }\n</kn-combobox>`,
  );
}

export default {
  slug: 'combobox',
  title: 'Combobox',
  entry: 'combobox',
  description:
    'Поле с автодополнением: текст сужает список, значение выбирается из вариантов. Подходит для длинных списков и поиска на сервере.',
  api: data.api,
  sources: data.sources,
  imports: ['KnCombobox', 'KnOption'],
  demos: [
    {
      source: 'basic',
      title: 'Фильтрация на клиенте',
      description: 'По умолчанию варианты фильтруются по вхождению текста без учёта регистра.',
      component: Basic,
    },
    {
      source: 'async',
      title: 'Поиск на сервере',
      description: 'filterMode="manual" отключает встроенный фильтр: приложение слушает [(query)] и само отдаёт варианты.',
      component: Async,
    },
  ],
  playground: Playground,
  slots: [{ name: '(по умолчанию)', description: 'Элементы <kn-option> и <kn-option-group>.' }],
  keyboard: [
    { keys: ['Буквы'], action: 'Фильтруют список; первый подходящий вариант становится активным.' },
    { keys: ['↓', '↑'], action: 'Открывают список и перемещают активный вариант по кругу.' },
    { keys: ['Enter'], action: 'Выбирает активный вариант.' },
    { keys: ['Esc'], action: 'Закрывает список; при закрытом списке очищает поле.' },
    { keys: ['Tab'], action: 'Уходит из поля; несохранённый текст возвращается к выбранному значению.' },
  ],
  a11y: [
    'Паттерн APG «Editable Combobox With List Autocomplete»: input с role="combobox" и aria-autocomplete="list".',
    'Фокус остаётся в поле, активный вариант передаётся через aria-activedescendant.',
    'Кнопки очистки и раскрытия не входят в порядок табуляции: их действия доступны с клавиатуры из самого поля.',
    'Значением может быть только вариант из списка: произвольный текст при уходе из поля сбрасывается.',
  ],
} satisfies ComponentDoc;
